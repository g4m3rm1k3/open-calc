# Lesson 54: `EditText`, `Toast`, and Boundary Validation

**What you will build:** Three units read real Android mechanisms
directly. Two units are small, fully runnable, plain Java labs.

**What you need to know first:** Lesson 41's view tree.

**Terms introduced in this lesson:**

- **`EditText`** — a view combining a label's display behavior with an
  editable, focusable text field the on-screen keyboard writes into,
  whose current content code can read back out.
- **UI hint vs. enforced validation** — a UI-level hint about expected
  input (e.g. a keyboard layout matching `inputType="number"`) is for
  convenience and can always be bypassed; only a check that actually runs
  in your own code is a real guarantee.
- **Boundary validation** — validating data specifically at the point
  where it crosses from an untrusted source (like user input) into the
  rest of a program, rather than trusting it further downstream.
- **Fail-fast validation** — stopping immediately at the first detected
  invalid state rather than propagating bad data further into a system.
- **`Toast`** — a small, auto-dismissing message overlay shown briefly to
  the user, independent of the view tree it floats above.

---

## Concept Unit: `EditText`

### The Problem

Every view this curriculum has shown so far (Lesson 41's own view tree)
has been one-directional — code sets a `TextView`'s text, and the user
only ever looks at it or taps it. A form needs the opposite direction
too: a view the *user* writes into, whose content code then reads back
out.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```xml
<EditText
    android:id="@+id/nameInput"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:hint="Item name" />
```

```java
EditText nameInput = findViewById(R.id.nameInput);
String enteredName = nameInput.getText().toString();
```

This is `EditText` — **first appearance**: a view combining a label's
display behavior with an editable, focusable text field the on-screen
keyboard writes into, whose current content code can read back out.
`android:hint` shows placeholder text only until the user types;
`nameInput.getText().toString()` reads back whatever the user has
actually typed at the moment this line runs.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `<EditText android:id="@+id/nameInput" ... android:hint="Item name"
   />` — **(a) first appearance**: declares a focusable, editable text
   field in the layout, with placeholder hint text.
2. `EditText nameInput = findViewById(R.id.nameInput);` — **(b)
   reappearing** `findViewById` from Lesson 45, retrieving this specific
   `EditText` from the view tree.
3. `nameInput.getText().toString()` — **(a) first appearance**: reads the
   field's current, live content — whatever the user has actually typed
   so far, not the original hint text.

### CS Lens

`EditText` is a two-directional view — display and input combined — in
contrast to every purely-display view seen earlier (`TextView`,
`ImageView`). Recognizing "this view accepts input, not just displays
data" is the transferable distinction, regardless of which specific
framework's own input-widget class is involved.

Also recognized in: `<input>` elements in HTML, `TextField` in Compose
and iOS's SwiftUI — the same two-directional-view idea across every
mainstream UI framework.

### SE Lens

The alternative — reading raw touch/keyboard events directly and
reconstructing typed text manually — was not chosen because `EditText`
already handles cursor position, selection, keyboard interaction, and
text storage internally; application code only ever needs its final,
current content via `getText()`.

---

## Concept Unit: UI Hint vs. Enforced Validation

### The Problem

`android:inputType="number"` shows a numeric on-screen keyboard, which
looks like it prevents non-numeric input — but it does not stop a
physically-typed letter from a hardware keyboard, or a pasted
non-numeric string, from actually reaching the field's content.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```xml
<EditText
    android:id="@+id/quantityInput"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:inputType="number" />
```

```java
EditText quantityInput = findViewById(R.id.quantityInput);
String rawQuantity = quantityInput.getText().toString();
// rawQuantity can still be "abc" here — pasted or typed via a hardware keyboard.
```

This is `UI hint vs. enforced validation` — **first appearance**: a
UI-level hint about expected input (e.g. a keyboard layout matching
`inputType="number"`) is for convenience and can always be bypassed;
only a check that actually runs in your own code is a real guarantee.
`android:inputType="number"` only requests a numeric keyboard from the
system — it is a hint to the input method, not a check `EditText` itself
enforces on its own content.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `android:inputType="number"` — **(a) first appearance**: requests a
   numeric keyboard layout from the system's input method — a request,
   not an enforced restriction on the field's own stored content.
2. `quantityInput.getText().toString()` — **(b) reappearing** from this
   lesson's own `EditText` unit: reads back whatever content actually
   ended up in the field, regardless of which keyboard was shown while
   typing it.
3. The comment demonstrates the real gap: nothing about `inputType`
   prevents `rawQuantity` from holding a non-numeric string.

### CS Lens

This is the same underlying gap as any client-side-only check in
distributed systems generally — a hint or convenience offered at one
layer (here, the input method) is never itself a guarantee enforced by
the layer that actually processes the data. Recognizing "this restricts
the *display/entry* experience, not the *data* itself" is the
transferable distinction.

Also recognized in: HTML's own `<input type="number">` (a browser-level
hint, bypassable via developer tools or a direct HTTP request),
client-side form validation in any web framework, generally bypassable
without a matching server-side check.

### SE Lens

The alternative — trusting `inputType="number"` alone as sufficient
validation — was not chosen because it can always be bypassed (a
hardware keyboard, a paste operation, a modified client); a real
guarantee requires an actual check running in the app's own code, the
subject of this lesson's next two units.

---

## Concept Unit: Boundary Validation

### The Problem

Bad data doesn't stay contained. Left unchecked at the point it's
entered, it would flow into an `Item` object, then into the in-memory
list, then — starting with a later lesson's own permanent-storage
material — into storage itself, getting harder to trace back to its
actual source the further it travels.

### Introduce the Concept in Isolation

```
mkdir lesson-54c
cd lesson-54c
```

Create `Main.java`:

```java
public class Main {
    static int parseQuantity(String rawQuantity) {
        // Validated right here, at the boundary — before this value
        // goes anywhere else in the program.
        return Integer.parseInt(rawQuantity);
    }

    public static void main(String[] args) {
        int quantity = parseQuantity("12");
        System.out.println("Parsed quantity: " + quantity);

        try {
            parseQuantity("abc");
        } catch (NumberFormatException e) {
            System.out.println("Rejected at the boundary: " + e.getMessage());
        }
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Parsed quantity: 12
Rejected at the boundary: For input string: "abc"
```

`parseQuantity` is the single point where raw, untrusted text first
becomes a real `int` used by the rest of the program. This is `boundary
validation` — **first appearance**: validating data specifically at the
point where it crosses from an untrusted source (like user input) into
the rest of a program, rather than trusting it further downstream.
`"abc"` is rejected right here, at the boundary, before it could ever
reach an `Item`, a list, or storage.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `parseQuantity("12")` — **(a) first appearance**: valid input, crosses
   the boundary successfully, becomes a real `int`.
2. `parseQuantity("abc")` — invalid input, caught and rejected at this
   exact boundary — `Integer.parseInt` throws before an `int` is ever
   produced.
3. Nothing downstream of `parseQuantity` ever sees `"abc"` at all — the
   boundary is the only place this specific check needs to exist.

### CS Lens

Boundary validation names *where* a check belongs, not merely *that* one
exists — the entry point where untrusted data first enters trusted
territory. The same concept recurs anywhere a system has a trust
boundary: a network request handler, a file parser, a form submission
handler.

Also recognized in: input sanitization at API boundaries in web
backends, parser validation at a file format's own entry point, "validate
at the edges" as a general architecture principle.

### SE Lens

The alternative — checking a quantity's validity scattered across
several places further downstream (say, once before saving, and again
before displaying) — was not chosen because it duplicates the check and
still leaves a window where invalid data exists in memory between the
boundary and wherever the "real" check eventually runs; one check, right
at the boundary, means invalid data is never represented anywhere past
that point at all.

---

## Concept Unit: Fail-Fast Validation

### The Problem

An empty name, a non-numeric quantity, and a negative quantity might all
be present in the same form submission at once. Checking every field,
collecting every problem, and only then deciding what to do is a valid
strategy — but a *simpler*, and often preferable, one is to stop at the
very first problem found.

### Introduce the Concept in Isolation

```
mkdir lesson-54d
cd lesson-54d
```

Create `Main.java`:

```java
public class Main {
    static void validateAndCreate(String name, String rawQuantity) {
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Name cannot be empty.");
        }
        int quantity;
        try {
            quantity = Integer.parseInt(rawQuantity);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Quantity must be a number.");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative.");
        }
        System.out.println("Created: " + name + ", " + quantity);
    }

    public static void main(String[] args) {
        try {
            validateAndCreate("", "-5");
        } catch (IllegalArgumentException e) {
            System.out.println("Stopped immediately: " + e.getMessage());
        }
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Stopped immediately: Name cannot be empty.
```

#### Execution Trace

Trace of `validateAndCreate("", "-5")`'s three possible throw points:

1. `if (name.isEmpty())` — `""` is empty, so this check fails first;
   `throw new IllegalArgumentException("Name cannot be empty.")` runs
   immediately, and the method exits right here.
2. `Integer.parseInt(rawQuantity)` — never reached at all this run, even
   though `"-5"` would still fail the *next* check if execution ever got
   there.
3. `if (quantity < 0)` — also never reached, for the same reason: step 1
   already stopped execution before any later check could run.

Both `""` (an empty name) and `"-5"` (a negative quantity) are invalid,
yet only the *first* problem — the empty name — is ever reported;
execution stops there and never reaches the quantity check at all. This
is `fail-fast validation` — **first appearance**: stopping immediately at
the first detected invalid state rather than propagating bad data further
into a system. `validateAndCreate` never continues past its first failed
check, regardless of how many other problems the input might also have.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `if (name.isEmpty()) { throw ... }` — **(a) first appearance**: the
   first check; fails immediately for `""`.
2. Because step 1 already threw, `Integer.parseInt(rawQuantity)` is never
   reached at all — `"-5"`'s own quantity check never runs this time.
3. `catch (IllegalArgumentException e)` in `main` — catches whichever
   single exception was thrown first, proving execution genuinely stopped
   at the earliest failure.

### CS Lens

Fail-fast trades completeness (reporting every problem at once) for
simplicity and safety (never continuing with any known-bad state, even
briefly). This connects directly to `boundary validation`'s own point:
the boundary is exactly where fail-fast validation should live — reject
immediately, rather than let a partially-valid, partially-invalid object
exist even momentarily.

Also recognized in: assertions in defensive programming (`assert`
statements that halt immediately on a violated invariant), fail-fast
behavior in concurrent collections (`ConcurrentModificationException`
thrown immediately rather than allowing continued, silently-corrupted
iteration).

### SE Lens

The alternative — collecting every validation problem before reporting
any of them — was not chosen for this lesson's own form-validation case
because it requires more code (accumulating a list of errors, rather than
throwing at the first one) for a benefit (showing the user every problem
at once) that matters more for larger, multi-field forms; for a small
form like this one, fail-fast is the simpler, sufficient choice.

---

## Concept Unit: `Toast`

### The Problem

A form submission succeeding needs some visible confirmation — but adding
a dedicated, permanent UI element (a `TextView` that says "Saved!") just
for this one, brief confirmation would clutter the screen with an element
that's only ever relevant for a moment.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Toast.makeText(this, "Item saved.", Toast.LENGTH_SHORT).show();
```

This is `Toast` — **first appearance**: a small, auto-dismissing message
overlay shown briefly to the user, independent of the view tree it
floats above. `Toast.makeText(...)` creates the message; `.show()`
displays it; it disappears on its own, after `Toast.LENGTH_SHORT`'s
duration, with no code needed to dismiss it and nothing added
permanently to the screen's own view tree (Lesson 41).

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `Toast.makeText(this, "Item saved.", Toast.LENGTH_SHORT)` — **(a)
   first appearance**: constructs the message, taking a `Context`
   (Lesson 45), the message text, and a duration constant.
2. `.show();` — **(a) first appearance**: displays the message overlay
   immediately; it dismisses itself automatically once its duration
   elapses, with no further code required.

### CS Lens

A `Toast` is deliberately outside the normal view tree — it floats above
whatever screen is currently showing, rather than being one more child
view added to and later removed from a layout. Recognizing "this is a
transient overlay, not a permanent view-tree member" is the transferable
distinction.

Also recognized in: transient "snackbar" or toast-style notifications
across virtually every mainstream UI framework and OS, brief
auto-dismissing confirmation messages generally.

### SE Lens

The alternative — adding a permanent `TextView` to the layout, shown and
hidden manually to confirm a save — was not chosen because it requires
manually managing visibility and a dismiss timer for something `Toast`
already handles automatically; `Toast` is simpler specifically because
confirmation messages are inherently transient, not a permanent part of
the screen.

---

## Connect the Pieces

`EditText` is the two-directional view a form needs to accept the user's
own typed input. `inputType="number"` looked like a numeric guarantee but
is only a UI hint, bypassable by design. `parseQuantity` demonstrated the
actual guarantee — boundary validation, right where untrusted text first
crosses into the program. `validateAndCreate` demonstrated fail-fast:
stopping at the very first problem, rather than letting bad data linger
even briefly. And `Toast` closes the loop, confirming a successful save
without a dedicated, permanent UI element cluttering the screen.

## What Breaks Without This

Trusting `inputType="number"` alone, with no boundary check in code,
lets a pasted or hardware-typed non-numeric string reach `Integer
.parseInt` deep inside the app, crashing with an uncaught
`NumberFormatException` far from where the bad data actually entered.
Skipping fail-fast and continuing past a first invalid field risks
constructing a partially-invalid object before the second problem is even
detected. And using a permanent `TextView` instead of `Toast` for a
transient confirmation message leaves stale "Saved!" text on screen long
after it's no longer relevant, unless manually hidden.

## Exercises

1. Explain, in your own words, why `android:inputType="number"` cannot,
   by itself, guarantee `rawQuantity` is actually numeric.
2. Modify `validateAndCreate` to check the quantity's numeric-ness
   *before* checking whether the name is empty, and explain why the
   reported error changes for the same two invalid inputs.
3. Explain, in your own words, why `Toast` doesn't need to be manually
   removed from the screen the way a `TextView` would.

## Definition of Done

- [ ] You read the real `EditText`/`getText()` example and can explain
      what it reads back.
- [ ] You read the real `inputType="number"` example and can explain why
      it's a hint, not an enforced guarantee.
- [ ] You ran the `parseQuantity` boundary-validation example and the
      `validateAndCreate` fail-fast example and can explain what each
      demonstrates.
- [ ] You read the real `Toast` example and can explain why it needs no
      manual dismissal.

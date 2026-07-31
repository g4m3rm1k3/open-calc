# Lesson 9b: UI Hint vs. Enforced Validation

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 9a's `EditText`.

**Terms introduced in this lesson:**

- **UI hint vs. enforced validation** — a UI-level hint about expected
  input (e.g. a keyboard layout matching `inputType="number"`) is for
  convenience and can always be bypassed; only a check that actually
  runs in your own code is a real guarantee.

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
system — it is a hint to the input method, not a check `EditText`
itself enforces on its own content.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `android:inputType="number"` — **(a) first appearance**: requests a
   numeric keyboard layout from the system's input method — a request,
   not an enforced restriction on the field's own stored content.
2. `quantityInput.getText().toString()` — **(b) reappearing** from
   Lesson 9a's own `EditText` unit: reads back whatever content
   actually ended up in the field, regardless of which keyboard was
   shown while typing it.
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
subject of the next two lessons.

---

## Connect the Pieces

`EditText` is the two-directional view a form needs. This lesson
showed why `inputType` alone is only a hint, never a guarantee — the
next lesson shows the actual guarantee: a check that runs in code,
right where untrusted text first enters the program.

## What Breaks Without This

Trusting `inputType="number"` alone, with no check in code, lets a
pasted or hardware-typed non-numeric string reach the rest of the
program unchecked, since nothing about the hint itself ever inspects
the field's actual stored content.

## Exercises

1. Explain, in your own words, why `android:inputType="number"`
   cannot, by itself, guarantee `rawQuantity` is actually numeric.
2. Name one other way, besides a hardware keyboard, that a non-numeric
   string could end up in `quantityInput` despite `inputType="number"`.
3. Explain, in your own words, why a UI-level hint and an enforced
   guarantee are not the same thing, using an example outside Android.

## Definition of Done

- [ ] You read the real `inputType="number"` example and can explain
      why it's a hint, not an enforced guarantee.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a real
      guarantee requires a check that runs in code.

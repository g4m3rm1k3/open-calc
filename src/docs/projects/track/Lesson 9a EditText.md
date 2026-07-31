# Lesson 9a: `EditText`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 3a's view tree, Lesson 4j's
`findViewById`.

**Terms introduced in this lesson:**

- **`EditText`** — a view combining a label's display behavior with an
  editable, focusable text field the on-screen keyboard writes into,
  whose current content code can read back out.

---

## Concept Unit: `EditText`

### The Problem

Every view this curriculum has shown so far (Lesson 3a's own view
tree) has been one-directional — code sets a `TextView`'s text, and
the user only ever looks at it or taps it. A form needs the opposite
direction too: a view the *user* writes into, whose content code then
reads back out.

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
   reappearing** `findViewById` from Lesson 4j, retrieving this
   specific `EditText` from the view tree.
3. `nameInput.getText().toString()` — **(a) first appearance**: reads
   the field's current, live content — whatever the user has actually
   typed so far, not the original hint text.

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

## Connect the Pieces

`EditText` is the two-directional view a form needs to accept the
user's own typed input. The next lesson shows why a hint like
`inputType="number"` isn't itself a guarantee about what actually ends
up in this field.

## What Breaks Without This

Without a dedicated input view, there is no way to read back what the
user actually typed — a purely display-only view like `TextView` has
no editable, focusable text field for the keyboard to write into at
all.

## Exercises

1. Explain, in your own words, what `android:hint` displays and when
   it stops being visible.
2. Explain, in your own words, why `nameInput.getText().toString()`
   must be called at the moment the value is needed, rather than once
   up front.
3. Explain, in your own words, why `EditText` is described as
   "two-directional" while `TextView` is not.

## Definition of Done

- [ ] You read the real `EditText`/`getText()` example and can explain
      what it reads back.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `EditText` is a two-directional view.

# Lesson 2o: `Bundle` — A Key-Value Container

**What you will build:** No new code — this reads real Android code
directly.

**What you need to know first:** Lesson 2e's `Activity`.

**Terms introduced in this lesson:**

- **`Bundle`** — a key-value container Android uses to pass data
  around the framework, including as `onCreate`'s saved-instance-state
  parameter.

---

## Concept Unit: `Bundle` — A Key-Value Container

### The Problem

`onCreate(Bundle savedInstanceState)` has appeared, unexplained, on
the first line of every Activity example since Lesson 2e — needing a
name even before its full role (a later lesson's own subject) is
covered.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Bundle extras = new Bundle();
extras.putString("item_name", "Widget");
extras.putInt("quantity", 12);

String name = extras.getString("item_name");
int quantity = extras.getInt("quantity");
```

This is `Bundle` — **first appearance**: a key-value container Android
uses to pass data around the framework, including as `onCreate`'s
saved-instance-state parameter. `putString`/`putInt` store values under
string keys; `getString`/`getInt` read them back — a key-value shape a
later lesson's own `Intent` material reuses directly, because an
`Intent`'s own extras genuinely are stored in a `Bundle` internally.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Bundle()` — **(a) first appearance**: constructs an empty
   key-value container.
2. `extras.putString("item_name", "Widget");` and
   `extras.putInt("quantity", 12);` — **(a) first appearance** of this
   key-value storage shape: a string key maps to one stored value,
   typed per method (`putString`, `putInt`, and others for other
   types).
3. `extras.getString("item_name");` and `extras.getInt("quantity");` —
   read the stored values back, by the same keys used to store them.

### CS Lens

`Bundle` is a real, load-bearing example of the key-value container
shape this course will use again (a `Map`-like structure, though
`Bundle` itself is Android's own specific type, not Java's standard
`Map`). Recognizing `Bundle` on sight, rather than as an unexplained
parameter type, is this lesson's entire, deliberately narrow goal —
full coverage of what `Bundle` is used for is a later lesson's own
subject.

Also recognized in: any key-value data-passing container across other
platforms (a `Dictionary` in C#, a plain `dict` in Python, used the
same way for loosely-structured data passing).

### SE Lens

The alternative — one generic `put(String key, Object value)` method,
rather than a typed method per type (`putString`, `putInt`) — was not
chosen because a generic version would push every type check to
runtime: reading a key back would require an unchecked cast, and
storing an `int` under a key later read with `getString` would fail
only when that specific line actually runs, not at compile time.
Typed methods make the type of every stored value part of the call
site itself, checked by the compiler at the moment it's written.

---

## Connect the Pieces

`onCreate(Bundle savedInstanceState)` (Lesson 2e) has sat unexplained
since it first appeared. This lesson finally put a name on the
container type itself — full coverage of its role comes later.

## What Breaks Without This

Reading a key that was never stored — `extras.getString("missing_key")`
— returns `null` rather than crashing, a real, verified detail worth
knowing before ever relying on a `Bundle` value being present.

## Exercises

1. Add a third value, a `boolean`, using `putBoolean`/`getBoolean`.
2. Read a key that was never stored and confirm the real result is
   `null`, not a crash.
3. Explain, in your own words, why `Bundle` uses typed methods
   (`putString`, `putInt`) rather than one generic `put` method.

## Definition of Done

- [ ] You read the real `Bundle` example and can explain what
      `putString`/`getString` do.
- [ ] You completed Exercise 2 and confirmed the real `null` result.
- [ ] You can name, without looking back at this lesson, one other
      place a `Bundle` appears in Android code you've already read.

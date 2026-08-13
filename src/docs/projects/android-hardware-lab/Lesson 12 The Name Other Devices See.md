# Lesson 12: The Name Other Devices See

**What you will build:** this phone's own Bluetooth name — read, then
changed to whatever the user types into a real, on-screen text field.
Every lesson before this one hardcoded its own input directly in the
source file; this is the first lesson in the series with any real,
interactive UI at all. It also sets up Lesson 13 directly: a device
list is far more useful once the devices in it have names a person
actually chose, not just whatever the manufacturer set at the factory.

**What you need to know first:** Lesson 07 (the `BLUETOOTH_CONNECT`
permission — reused unchanged here, nothing new to request). Lesson 03
(listeners, lambdas — reused for this lesson's new click listener).

**Terms introduced in this lesson:**
- **Adapter name (friendly name)** — the string other nearby devices
  see when they scan. Not this *app's* name, not this app's own data —
  a single, device-wide value any app with permission can read or
  change, shared by the whole phone, the same way the system clipboard
  (Lesson 01) belongs to the whole phone and not to one app.
- **Fire-and-forget confirmation** — a method that returns `true`
  meaning only "this request was accepted for processing," not "this
  request has already finished." `setName`, below, is exactly this
  shape — its `boolean` result says nothing about whether the name has
  actually changed by the time the call returns.

**Objects and methods this lesson uses:**
- **`EditText`**
  - *What it is:* a real, user-editable single- or multi-line text
    field.
  - *Implementation:* a `View` subclass (Lesson 04's term for the
    family `ViewGroup` belongs to, reappearing); its current text is
    read through `getText()`, below.
  - *Its use:* where the user actually types a new device name.
- **`Button`**
  - *What it is:* a tappable UI element.
  - *Implementation:* also a `View` subclass; exposes
    `setOnClickListener(View.OnClickListener)`.
  - *Its use:* the trigger that reads the `EditText`'s current value
    and applies it.
- **`View.OnClickListener`**
  - *What it is:* the specific single-method interface a `Button`
    (or any `View`) calls when tapped.
  - *Implementation:* one method, `onClick(View v)` — a functional
    interface, Lesson 03's term, satisfiable by a lambda the same way
    every listener in this series has been since Lesson 03's clipboard
    listener.
  - *Its use:* registered on the new `Button`, below.
- **`Editable`**
  - *What it is:* the actual type `EditText.getText()` returns — not
    a plain `String`.
  - *Implementation:* a mutable, `CharSequence`-implementing type
    Android uses specifically because a text field's content changes
    character-by-character as the user types; converted to an
    ordinary `String` via `.toString()` when a fixed snapshot is
    actually needed.
  - *Its use:* read once, at the moment the button is tapped, then
    immediately converted — this lesson never holds onto the
    `Editable` itself.

---

## Concept Unit: A Value the Whole Device Shares, Set From Real Input

### The Problem

`bluetoothAdapter.getName()` and `.setName(String)` are just two more
method calls, no harder in shape than anything already covered in this
Bluetooth arc — but every value this series has read or written so
far came from either hardware or a hardcoded literal sitting in the
source file. Letting an actual person choose the value needs something
this project has never had: a real place on screen to type into, and a
real way to know the person is done typing and ready to apply it.

### The Real Thing

**Reference Source:** no reference counterpart — `getName()`/`setName(String)`
and their `BLUETOOTH_CONNECT` requirement are Android platform facts,
confirmed against Android's current and archived official reference
documentation this session.

**Files affected:** `activity_main.xml`, touched for the first time in
this series — every prior lesson left the Android Studio-generated
layout untouched. `MainActivity.java` — new lines in `onCreate`.

**Change type:** add.

**Location:** two new views added to the existing layout, below the
generated "Hello World!" `TextView`; new Java lines at the end of
`onCreate`, after Lesson 11's server-socket setup.

**Dependencies:** Lesson 07's `BLUETOOTH_CONNECT` grant.

The full, updated layout — the generated `TextView` is untouched, two
new views added beneath it:

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res/auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/main"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <TextView
        android:id="@+id/helloText"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Hello World!"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintLeft_toLeftOf="parent"
        app:layout_constraintRight_toRightOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <EditText
        android:id="@+id/nameInput"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:hint="New device name"
        android:inputType="text"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_margin="16dp" />                                    <!-- new -->

    <Button
        android:id="@+id/setNameButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Set Name"
        app:layout_constraintTop_toBottomOf="@id/nameInput"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />                       <!-- new -->

</androidx.constraintlayout.widget.ConstraintLayout>
```

New lines at the end of `onCreate`:

```java
Log.d("BtName", "Current adapter name: " + bluetoothAdapter.getName());  // <- new

EditText nameInput = findViewById(R.id.nameInput);                        // <- new
Button setNameButton = findViewById(R.id.setNameButton);                  // <- new
setNameButton.setOnClickListener(v -> {                                    // <- new
    String newName = nameInput.getText().toString();                      // <- new
    boolean accepted = bluetoothAdapter.setName(newName);                  // <- new
    Log.d("BtName", "Change accepted: " + accepted                        // <- new
            + " (name updates asynchronously — re-check getName() shortly)"); // <- new
});                                                                         // <- new
```

### Mechanical Walkthrough

- `android:id="@+id/nameInput"`, `android:id="@+id/setNameButton"` —
  **first appearance of adding new IDs to this layout file
  ourselves**, though the `@+id/...` syntax itself was already present
  (generated) on the root `ConstraintLayout`'s own `android:id`. Each
  one becomes a real, generated `int` constant in `R.id`, exactly the
  same mechanism `R.id.main` already used since Lesson 01.
- `android:inputType="text"` — **first appearance.** Tells the on-screen
  keyboard what kind of input to offer — plain text here, as opposed
  to, say, a numeric or password keyboard; affects only the keyboard
  Android shows, not what characters the field can technically hold.
- `bluetoothAdapter.getName()` — **first appearance**, full treatment
  above (Terms and Objects).
- `findViewById(R.id.nameInput)`, `findViewById(R.id.setNameButton)` —
  **reappearing from Lesson 01, brief reminder only** — same call,
  same nullability contract, new IDs.
- `setNameButton.setOnClickListener(v -> {...})` — **first appearance
  of `View.OnClickListener` specifically; the lambda-satisfies-a-
  functional-interface mechanism itself already fully established
  since Lesson 03.** `v` is the `Button` itself, unused inside this
  particular lambda — legal, since nothing requires using every lambda
  parameter.
- `nameInput.getText()` — **first appearance**, full treatment above
  (`Editable`).
- `.toString()` — **reappearing method, new receiver type.** Same
  general idea as every other `.toString()` call implicitly used
  throughout this series' `Log.d("..." + someObject)` string
  concatenations, called here explicitly instead of implicitly.
- `bluetoothAdapter.setName(newName)` — **first appearance**, full
  treatment above (Terms — Fire-and-forget confirmation — and
  Objects).

### Execution Trace

**Same honesty note as the rest of this arc:** predicted output,
verified against Android's real documentation, not a captured run.

1. `onCreate` runs. `getName()` logs the phone's real, current
   Bluetooth name — predict something like the phone's model name or
   a manufacturer default, e.g. `"Current adapter name: Pixel 8"` —
   the real value depends entirely on the real device.
2. The screen now shows a text field and a button — nothing else
   happens until the user actually taps the button; typing alone
   triggers nothing.
3. The user types a new name and taps "Set Name." *Only now* does the
   lambda run — predict `nameInput.getText().toString()` returns
   exactly what was typed, `setName(...)` returns `true` on a normal,
   working adapter, and the log line reads `"Change accepted: true
   (name updates asynchronously...)"`.
4. Call `getName()` again immediately afterward (Exercise 1 asks you
   to add this) — predict it may still show the *old* name for a
   brief moment, per the archived official documentation's own
   guidance that the change applies asynchronously, not the instant
   `setName` returns.

### CS Lens

**A device-wide setting, shared and mutable by any sufficiently
permitted app, is exactly the same shape as a global variable in any
single program** — one piece of state, no owner, every reader seeing
whatever the most recent writer left behind, including another app
entirely. Also recognized in: a shared system clock any process can
read; an environment variable any process on a machine can see;
Lesson 01's own `ClipboardManager`, the very first example this series
ever used, sharing exactly this property. The real risk global mutable
state always carries — another app changing this same name out from
under you, with no notification — is not new to Bluetooth; it's the
general cost of anything declared "shared," Bluetooth adapter names
included.

### SE Lens

**Why does `setName` return a `boolean` instead of nothing (`void`),
if the real change is asynchronous anyway?** The returned `boolean`
answers a narrower, still genuinely useful question: was the request
itself well-formed and accepted for processing, distinct from whether
that processing has finished. Real callers who need to know the name
actually changed have to listen for a separate broadcast (Lesson 09's
own pattern, not repeated here) — `ACTION_LOCAL_NAME_CHANGED` — rather
than trust the return value as confirmation. The honest cost of this
lesson stopping at the `boolean`: this lesson's own log line reads
"accepted," not "confirmed changed," on purpose, matching what the API
actually promises rather than overstating it.

---

## Connect the Pieces

`getName()` reads a value that belongs to the whole device, not this
one app — the same sharing Lesson 01's clipboard already established.
A real `EditText` and `Button`, the first interactive UI this series
has built, let a person provide that new value instead of a hardcoded
literal; `setOnClickListener`, the same lambda-satisfies-a-single-
method-interface shape every listener since Lesson 03 has used,
decides exactly when to act on it. `setName`'s `boolean` return closes
the loop honestly — confirming only that the request was accepted, not
that the change has already taken effect, setting up Lesson 13's
device list to show real, person-chosen names instead of raw
manufacturer defaults.

## What Breaks Without This

Trust `setName`'s return value as if it meant "already applied," and
call `getName()` immediately afterward expecting the new value:

```java
boolean accepted = bluetoothAdapter.setName(newName);
Log.d("BtName", "Applied? " + bluetoothAdapter.getName().equals(newName)); // <- wrong assumption
```

Predicted result: this can log `"Applied? false"` immediately after a
`"Change accepted: true"` — not a bug, exactly the asynchronous gap
Android's own documentation describes. Confirm this for yourself, then
remove the incorrect immediate re-check.

## Exercises

1. Add a second `getName()` log call about a second or two after
   `setName` runs (a simple way: log it again from a button tap, not
   from a timer) and confirm for yourself whether the name has caught
   up by then.
2. Leave the `EditText` empty and tap "Set Name." Predict, then
   confirm, what `setName("")` actually does — does it succeed, fail,
   or leave the name unchanged?
3. Type a name longer than what you'd expect a small hardware/protocol
   field to hold — several dozen characters — and tap "Set Name."
   Confirm for yourself whether Android silently truncates it, rejects
   it outright, or accepts it without complaint.

## Definition of Done

- [ ] You ran the real code and saw this phone's actual current
      Bluetooth name logged.
- [ ] You typed a real new name into the real `EditText`, tapped the
      real `Button`, and confirmed (via a second `getName()` call) that
      it eventually took effect.
- [ ] You can explain, without looking, the difference between what
      `setName`'s `boolean` return promises and what it doesn't.
- [ ] You can explain why `nameInput.getText()` returns `Editable`
      rather than `String` directly, and why this lesson converts it
      immediately instead of storing it.
- [ ] You confirmed, firsthand, that an immediate re-check right after
      `setName` can still show the old value.
- [ ] Commit: the layout changes and the naming code in
      `MainActivity.java`.

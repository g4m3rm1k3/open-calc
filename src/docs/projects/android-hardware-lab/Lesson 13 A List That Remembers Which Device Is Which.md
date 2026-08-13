# Lesson 13: A List That Remembers Which Device Is Which

**What you will build:** a real, on-screen list of every paired
device, each one tappable, each tap connecting to *that specific
device* — replacing Lesson 10's `bondedDevices.iterator().next()`
simplification and closing the gap Lesson 11 named outright: with this
lesson, connecting is a real, deliberate choice a person makes, not a
race between two phones both guessing. This is the lesson that makes
the whole Bluetooth arc actually usable, not just demonstrable.

**What you need to know first:** Lessons 10, 11, and 12 in full —
this lesson restructures Lesson 10's connection code and reuses Lesson
12's UI-building pattern (`findViewById`, click listeners) applied to
a list instead of one fixed button.

**Terms introduced in this lesson:**
- **Programmatic UI** — views created and added to the screen from
  code at runtime, as opposed to every view this series has used so
  far, which was declared once, fixed, in XML. Necessary here because
  the number of buttons needed — one per paired device — isn't known
  until the app is actually running on a real phone with a real,
  variable list of paired devices.
- **Capture (in a lambda)** — a lambda that refers to a variable
  declared outside itself is said to *capture* that variable. Every
  lambda this series has written so far captured something already
  effectively constant for the whole method (`sensorListener`,
  `bluetoothAdapter`). This lesson's lambdas are the first to capture
  a variable whose value is genuinely different on each pass through a
  loop — and, per this lesson's own isolated proof, that still works
  correctly, for a specific structural reason explained below.

**Objects and methods this lesson uses:**
- **`LinearLayout.addView(View)`**
  - *What it is:* adds one more view to a `ViewGroup` (Lesson 04's
    term) at runtime, after the screen has already been built from
    XML once.
  - *Implementation:* inherited from `ViewGroup`; appends the given
    view after whatever views the container already holds.
  - *Its use:* adding one `Button` per paired device, below, to a
    container declared empty in XML.
- **`new Button(Context)`**
  - *What it is:* constructing a real `Button` directly in code,
    instead of declaring one in XML the way Lesson 12's `Button` was
    declared.
  - *Implementation:* every `View` subclass has a constructor taking a
    `Context` — this Activity itself, satisfying it directly, the
    same `this` already used throughout this series for
    `getSystemService` calls and more.
  - *Its use:* one instance built per paired device, inside this
    lesson's loop.

---

## Concept Unit: One Button Per Device, Each One Remembering Its Own

### The Problem

Lesson 12 wired exactly one `Button` to exactly one click listener,
fixed in XML, known at the moment the layout file was written. This
lesson needs an unknown number of buttons — one per paired device,
different on every real phone — each one needing to trigger a
connection to a *different*, specific device. Building that means
creating views in a loop instead of in XML, and it raises a real
question: if every button's click listener is built the same way,
inside the same loop, how does each one end up remembering *which*
device is actually its own?

### Introduce the Concept in Isolation — Step 1: Does Each One Remember Its Own, or Just the Last One?

Scratch file, no Android, no UI:

```java
List<String> names = List.of("Alice", "Bob", "Carol");
List<Runnable> actions = new ArrayList<>();

for (String name : names) {
    actions.add(() -> System.out.println("Chosen: " + name));
}

for (Runnable r : actions) {
    r.run();
}
```

Predict the output before running it — does every stored `Runnable`
print `"Chosen: Carol"` (the last name the loop saw), or does each one
print the name it was actually built with? Run it. Expected output:

```
Chosen: Alice
Chosen: Bob
Chosen: Carol
```

Each one remembers its own — not the last value, not a shared one.
This works because Java's enhanced `for`-each loop creates a genuinely
*new* `name` variable on every single pass, not one reused variable
overwritten each time; each lambda captures whichever `name` existed
at the exact moment it was built, and that variable is never touched
again afterward. **Name this mechanism plainly:** this is called
**effectively final capture** — the reason a variable can be captured
by a lambda at all in Java is that the compiler can prove it's never
reassigned after that point, and a fresh per-iteration variable
satisfies that proof trivially, on every iteration, independently.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — this lesson
restructures this project's own existing code (Lesson 10's connection
logic) rather than porting from any external source.

**Files affected:** `activity_main.xml` (a new empty container
replacing the fixed single-purpose views this lesson doesn't need);
`MainActivity.java` — Lesson 10's connection code is extracted into a
reusable method, and this lesson's list-building code replaces the
automatic connection attempt Lesson 10 originally ran on startup.

**Change type:** refactor (Lesson 10's automatic connect becomes a
callable method, no longer run automatically) and add (the device
list itself).

**Location:** `activity_main.xml` gets one new `LinearLayout` inside a
`ScrollView`. `MainActivity.java`'s `onCreate` no longer calls Lesson
10's connection logic directly — it calls this lesson's new
list-building method instead, which is what actually triggers a
connection now, once a person taps a specific device.

**Dependencies:** Lesson 10's `SPP_UUID` field and its socket/stream
code, restructured, not duplicated.

Layout addition — a scrollable container for however many devices
turn out to be paired:

```xml
<ScrollView
    android:layout_width="0dp"
    android:layout_height="0dp"
    app:layout_constraintTop_toBottomOf="@id/setNameButton"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent">                             <!-- new -->

    <LinearLayout
        android:id="@+id/deviceListContainer"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="vertical" />                                  <!-- new -->

</ScrollView>
```

First, Lesson 10's own connection code, extracted into a method that
takes the target device as a real parameter instead of picking one
itself:

```java
private void connectToDevice(BluetoothDevice target) {                    // <- new (was inline in Lesson 10)
    Log.d("BtSocket", "Connecting to " + target.getName());

    new Thread(() -> {
        bluetoothAdapter.cancelDiscovery();
        try (BluetoothSocket socket =
                     target.createRfcommSocketToServiceRecord(SPP_UUID)) {
            socket.connect();
            Log.d("BtSocket", "Connected");

            OutputStream out = socket.getOutputStream();
            out.write("Hello from Android\n".getBytes());

            InputStream in = socket.getInputStream();
            byte[] buffer = new byte[1024];
            int bytesRead = in.read(buffer);
            String response = new String(buffer, 0, bytesRead);
            Log.d("BtSocket", "Received: " + response);

        } catch (IOException e) {
            Log.d("BtSocket", "Connection failed: " + e.getMessage());
        }
    }).start();
}
```

Now, in `onCreate` — where Lesson 10 once called this logic
automatically, this lesson instead builds the list:

```java
if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {
    Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();
    LinearLayout deviceListContainer = findViewById(R.id.deviceListContainer); // <- new

    if (bondedDevices.isEmpty()) {
        Log.d("BtSocket", "No paired devices — pair one in system Bluetooth settings first");
    } else {
        for (BluetoothDevice device : bondedDevices) {                     // <- new
            Button deviceButton = new Button(this);                       // <- new
            deviceButton.setText(device.getName());                       // <- new
            deviceButton.setOnClickListener(v -> connectToDevice(device)); // <- new
            deviceListContainer.addView(deviceButton);                    // <- new
        }                                                                  // <- new
    }
}
```

### Mechanical Walkthrough

- `<ScrollView>` / `<LinearLayout android:orientation="vertical">` —
  **first appearance of both tags in this series' XML.** `ScrollView`
  lets its one child grow taller than the screen and still be
  reachable by scrolling; the inner `LinearLayout`, set to `vertical`,
  stacks whatever children it's given top to bottom — here, starting
  with none, per its own XML declaration, all added later from code.
- `findViewById(R.id.deviceListContainer)` — **reappearing, already
  established since Lesson 01.**
- `for (BluetoothDevice device : bondedDevices)` — **reappearing loop
  shape (already used with this exact `Set` type in Lesson 10);
  its `device` variable's capture behavior is this lesson's real, new
  subject**, per Step 1's isolated proof above.
- `new Button(this)` — **first appearance**, full treatment above.
  `this` satisfies the `Context` parameter — the same object already
  passed to `getSystemService` and `ContextCompat.checkSelfPermission`
  throughout this series, reused here in a constructor instead of a
  method call.
- `deviceButton.setText(device.getName())` — **first appearance of
  `setText` on a programmatically built view; `device.getName()`
  reappearing from Lesson 09.** Sets the button's visible label —
  meaningfully readable now, specifically because Lesson 12 exists and
  a real person can set a real device name instead of leaving a
  factory default.
- `deviceButton.setOnClickListener(v -> connectToDevice(device))` —
  **reappearing `setOnClickListener` shape from Lesson 12; the
  captured `device` is this lesson's actual new content**, per Step
  1's proof — each button, built on a separate pass through this same
  loop, closes over its *own* `device`, not whichever one the loop
  happened to be on when this line is read as source code.
- `deviceListContainer.addView(deviceButton)` — **first
  appearance**, full treatment above.
- `connectToDevice(BluetoothDevice target)` — **reappearing body from
  Lesson 10, restructured, not new.** Every line inside it is Lesson
  10's own already-taught code; only its *shape* changed — from
  automatic, on startup, targeting whatever `iterator().next()`
  happened to return, to callable, on demand, targeting whatever
  device the tapped button actually represents.

### Execution Trace

**Same honesty note as the rest of this arc:** predicted output,
verified against Android's real documentation and this project's own
prior lessons, not a captured run.

1. `onCreate` runs. For each paired device, one `Button` is created,
   labeled with that device's real name (Lesson 12's own feature,
   paying off here), and added to the visible, scrollable list.
   Predict, for a phone with two paired devices: two real, tappable
   buttons appear on screen, labeled with their real chosen names.
2. Nothing else happens automatically — unlike Lesson 10's original
   behavior, no connection attempt starts on its own. The user is now
   in control of *when* and *to whom*.
3. The user taps one specific button. Predict `connectToDevice` runs
   with exactly that button's own `device` — confirmed by Step 1's
   isolated proof that each closure captured its own loop value, not
   the list's last one.
4. From here, predict the exact same connect/write/read sequence
   Lesson 10 already traced — this lesson changed *how* the target
   device is chosen, not what happens once a target is chosen.

### CS Lens

**A closure capturing a per-iteration value, not a shared mutable
one, is what makes event-driven UI code with a variable number of
handlers correct at all** — recognized far beyond this one lesson:
building one HTTP route handler per registered endpoint in a web
framework, one test case per row in a table-driven test suite, one
timer callback per scheduled event — in every case, code inside a loop
builds several independent callbacks, and each one has to remember
*its own* data, not whatever the loop variable happened to hold last.
Getting this wrong (which older-style, indexed loops in several
languages made easy to do by reusing one mutable loop variable) is a
well-known, recurring bug family; Java's enhanced `for`-each loop's
per-iteration variable is a specific, deliberate design choice that
prevents it structurally.

### SE Lens

**Why turn Lesson 10's automatic, startup-triggered connection into a
user-triggered one at all — what's the real cost of Lesson 10's
original simplicity?** Automatic, "just connect to something" code is
genuinely simpler to write and to read — Lesson 10 was honest that
`iterator().next()` was a deliberate simplification, not a real
design. The real cost of that simplicity showed up immediately in
Lesson 11: two phones running identical automatic code can't agree on
who calls whom. Moving the decision to a real person, via a real list,
doesn't just add a feature — it removes an entire class of ambiguity
this series had no other way to resolve. The honest tradeoff still
standing: this lesson's list only shows *paired* devices, not
everything Lesson 09 can discover nearby; reaching a brand-new,
not-yet-paired device from this same list is a real, separate gap,
left open rather than quietly assumed away.

---

## Connect the Pieces

Lesson 10's own connection logic, unchanged in its body, is now a
method taking a real parameter instead of a hardcoded choice. A loop
over Lesson 10's `getBondedDevices()` builds one real `Button` per
device, each labeled with the real name Lesson 12 made settable, each
one wired to call that method with *its own* device — correct, per
Step 1's isolated proof, because Java's `for`-each loop hands each
lambda a genuinely separate variable, not one shared, overwritten
value. The result: tapping a specific name on screen is what decides
who this phone actually talks to, replacing both Lesson 10's guess and
Lesson 11's race with an actual choice.

## What Breaks Without This

Reintroduce a shared, reused variable on purpose, the way an
old-style indexed loop naturally would, instead of relying on the
`for`-each loop's own per-iteration variable:

```java
BluetoothDevice[] devicesArray = bondedDevices.toArray(new BluetoothDevice[0]);
BluetoothDevice sharedDevice = null;                                     // <- one shared variable, reused
for (int i = 0; i < devicesArray.length; i++) {
    sharedDevice = devicesArray[i];                                       // <- reassigned every iteration
    Button deviceButton = new Button(this);
    deviceButton.setText(sharedDevice.getName());
    BluetoothDevice finalDevice = sharedDevice;                           // <- forced copy, defeats the point
    deviceButton.setOnClickListener(v -> connectToDevice(finalDevice));
    deviceListContainer.addView(deviceButton);
}
```

Java's compiler actually *refuses* to capture `sharedDevice` directly
in the lambda here — it isn't effectively final, since it's reassigned
every iteration — which is exactly why the extra `finalDevice` copy
was forced in on the line above it, just to make this compile at all.
Predicted result of removing that forced copy and capturing
`sharedDevice` directly: a real compile error, not a runtime bug —
confirm this for yourself, then delete this whole broken block and
restore the original `for`-each version, which never needed a forced
copy because each iteration's `device` was already its own variable.

## Exercises

1. Log `bondedDevices.size()` before the loop runs, and confirm the
   real number of buttons that actually appear on screen matches it
   exactly.
2. Tap two different device buttons in a row, one after the other,
   without restarting the app. Confirm for yourself, from real Logcat
   output, that two separate `connectToDevice` calls ran, each
   targeting the device that was actually tapped, not the same one
   twice.
3. Using this lesson's own What Breaks Without This block, remove
   *only* the `finalDevice` line and try to compile. Read the real
   compiler error Java produces, and connect its wording back to
   "effectively final" by name.

## Definition of Done

- [ ] You ran Step 1's scratch file, predicted the output before
      running it, and confirmed each stored `Runnable` really did
      remember its own name.
- [ ] You ran the real Step 2 code and saw one real button per real
      paired device, each correctly labeled.
- [ ] You tapped at least two different buttons, on two different
      runs or in sequence, and confirmed each one connected to the
      device it actually named, not to whichever device happened to
      be first or last.
- [ ] You can explain, without looking, why Java's `for`-each loop
      lets a lambda safely capture its loop variable while an
      old-style indexed loop reusing one variable would not.
- [ ] You triggered the real compile error from What Breaks Without
      This, read it, and connected it back to "effectively final."
- [ ] You can state, in your own words, what this lesson actually
      fixed that Lesson 11 left open, and what gap (unpaired,
      discovered-only devices) is still honestly open after this
      lesson.
- [ ] Commit: the layout change, the extracted `connectToDevice`
      method, and the device-list code in `MainActivity.java`.

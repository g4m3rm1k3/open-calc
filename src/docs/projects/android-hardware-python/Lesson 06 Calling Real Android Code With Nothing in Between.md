# Lesson 06: Calling Real Android Code With Nothing in Between

**What you will build:** the phone's real `BluetoothAdapter` — checked
for existence, checked for whether it's on, and prompted to turn on if
it isn't — using none of Plyer. The transferable problem, stated
honestly up front: Plyer's own `bluetooth` facade, as of this writing,
is an unfinished stub — its own source contains a literal `# todo:
will be extended to allow bluetooth connections etc.` comment. Nothing
in this series has hit a wall like this before. The fix isn't to wait
for Plyer to catch up — it's to call Android's own real Java Bluetooth
classes directly, the same classes any Java or Kotlin Android app
would call, through a real bridge instead of a facade.

**What you need to know first:** Lesson 05 in full (the
`BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT` permissions, already granted by
the time this lesson's own code runs).

**Terms introduced in this lesson:**
- **Java interop bridge** — a mechanism letting Python code call real,
  unmodified Java classes and methods directly, as if they were Python
  objects. Nothing about the Java class itself changes or gets
  reimplemented — the bridge translates each call across the
  language boundary, live, every time.
- **Casting (in this bridge's sense)** — telling the bridge to treat
  a Java object reference as a specific class or interface, when the
  bridge's own automatic type detection isn't enough to know which
  method you mean — a real, necessary step this lesson hits directly,
  not a theoretical aside.

**Objects and methods this lesson uses:**
- **`jnius.autoclass(name)`** (Pyjnius)
  - *What it is:* loads a real Java class by its full name and hands
    back a Python-usable reference to it.
  - *Implementation:* takes one string — the class's fully-qualified
    Java name (`"android.bluetooth.BluetoothAdapter"`, exactly as it
    would appear in a Java `import`) — and returns something Python
    code can call static methods on directly, or construct, the same
    way an ordinary Python class reference works.
  - *Its use:* every single Android class this lesson touches is
    loaded this exact way, first.
- **`jnius.cast(classname, instance)`**
  - *What it is:* re-types an existing Java object reference as a
    specific class or interface.
  - *Implementation:* takes the target class's name and the object to
    re-type; returns the same underlying Java object, now usable as
    that type.
  - *Its use:* `PythonActivity.mActivity`, below, needs this before
    `.startActivity(...)` can be called on it — covered fully in the
    Mechanical Walkthrough.
- **`BluetoothAdapter.getDefaultAdapter()`**
  - *What it is:* a static method returning this device's one
    `BluetoothAdapter`, or `None` on hardware with no Bluetooth radio.
  - *Implementation:* called on the class itself, not on an instance —
    no object needs to exist first.
  - *Its use:* this lesson's actual starting point — chosen
    specifically because it's a plain static call, one of the more
    reliable shapes to call through a Java interop bridge, as opposed
    to a method requiring the bridge to resolve between several
    overloaded versions of the same name.
- **`PythonActivity.mActivity`**
  - *What it is:* a static field holding a live reference to this
    app's own currently-running Android `Activity`.
  - *Implementation:* `PythonActivity` itself is the specific Java
    class `python-for-android`'s own bootstrap provides as this app's
    real entry point — `mActivity` is a `public static` field on it,
    set once, automatically, when the app starts.
  - *Its use:* the one piece of real Android `Context` this lesson
    needs, to start a real system screen from Python.

---

## Concept Unit: A Facade That Isn't Finished, and the Real Bridge Underneath It

### The Problem

Every hardware access so far in this series went through Plyer — one
consistent, simplified Python-first API, regardless of what Android
actually does underneath. Bluetooth breaks that pattern: Plyer's own
facade for it does almost nothing yet. Two real choices exist from
here — wait for a library to be finished, or reach one level lower, to
the real interop bridge Plyer itself is built on, and call Android's
own real classes directly. This project takes the second path,
deliberately.

### Introduce the Concept in Isolation — Step 1: A Bridge, Proven With a Class That Already Exists Everywhere

**Pyjnius, like `android.permissions`, only exists inside a real,
packaged Android app** — there is no desktop equivalent to test this
against first. This isolation instead uses the smallest possible real
call — loading a completely ordinary Java class every Android app
already has loaded, `java.lang.String` — to prove the bridge itself
works, before asking it to reach into Bluetooth specifically.

```python
from jnius import autoclass

JavaString = autoclass('java.lang.String')
greeting = JavaString("Hello from real Java")
print(greeting.toUpperCase())
print(greeting.length())
```

Run this inside a real Android build (a throwaway addition to
`build()`, removed once confirmed). Expected output — real Java
methods, called from Python, on a real Java object:

```
HELLO FROM REAL JAVA
21
```

`greeting` is not a Python string with extra features bolted on — it
is a genuine `java.lang.String` instance, and `.toUpperCase()` and
`.length()` are its own real Java methods, called exactly as Java code
would call them. This is the entire mechanism the real code below
relies on, proven first against a class with no permissions, no
hardware, and no ambiguity involved at all.

**Discard this scratch addition.**

### The Real Thing

**Reference Source:** no reference counterpart — Pyjnius' own API and
the `BluetoothAdapter`/`PythonActivity` classes it loads are confirmed
against Pyjnius' current documentation and real-world usage examples,
fetched and cross-checked this session.

**Files affected:** `main.py`.

**Change type:** add — a new method, called once Lesson 05's
permission flow reaches `on_bluetooth_ready`.

**Location:** replaces the placeholder comment Lesson 05 left inside
`on_bluetooth_ready`.

**Dependencies:** Lesson 05's granted `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`
permissions.

```python
from jnius import autoclass, cast                                        # <- new
from kivy.logger import Logger

BluetoothAdapter = autoclass('android.bluetooth.BluetoothAdapter')       # <- new
PythonActivity = autoclass('org.kivy.android.PythonActivity')            # <- new
Intent = autoclass('android.content.Intent')                              # <- new
Activity = autoclass('android.app.Activity')                              # <- new

# (inside MyApp, replacing Lesson 05's placeholder comment)

def on_bluetooth_ready(self):                                              # <- changed from Lesson 05
    self.bluetooth_adapter = BluetoothAdapter.getDefaultAdapter()          # <- new
    if self.bluetooth_adapter is None:                                    # <- new
        Logger.info("MyApp: no Bluetooth hardware on this device")        # <- new
        return                                                             # <- new

    if not self.bluetooth_adapter.isEnabled():                             # <- new
        Logger.info("MyApp: Bluetooth is off — asking the user to enable it") # <- new
        enable_intent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)     # <- new
        current_activity = cast('android.app.Activity', PythonActivity.mActivity) # <- new
        current_activity.startActivity(enable_intent)                      # <- new
    else:                                                                  # <- new
        Logger.info("MyApp: Bluetooth already on")                        # <- new
```

### Mechanical Walkthrough

- `from jnius import autoclass, cast` — **first appearance**, full
  treatment above (Terms and Objects).
- `BluetoothAdapter = autoclass('android.bluetooth.BluetoothAdapter')` —
  **first appearance of loading a specific, real Android class this
  way.** From this line on, `BluetoothAdapter` behaves like an
  ordinary Python reference to that real Java class.
- `PythonActivity = autoclass('org.kivy.android.PythonActivity')` —
  **first appearance**, full treatment above.
- `Intent = autoclass('android.content.Intent')` — **first appearance
  of `Intent` in this project.** A real, ordinary Android class,
  loaded here through the interop bridge instead of imported directly
  the way Java code would.
- `BluetoothAdapter.getDefaultAdapter()` — **first appearance**, full
  treatment above (Objects and methods).
- `if self.bluetooth_adapter is None:` — **ordinary Python `None`
  check, already assumed knowledge — worth noting only that Pyjnius
  translates a Java `null` return into Python's own `None`
  automatically**, with no special handling required on the Python
  side.
- `self.bluetooth_adapter.isEnabled()` — **first appearance of calling
  a real instance method, through the bridge, on an object the bridge
  itself produced** (`getDefaultAdapter()`'s own return value) —
  contrasted with the static call above it.
- `Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)` — **first
  appearance of constructing a real Java object through the bridge.**
  `BluetoothAdapter.ACTION_REQUEST_ENABLE` is a real `static final`
  `String` field on the Java class, read the same way a static method
  was called above it — a field access, not a method call, despite the
  similar-looking syntax.
- `cast('android.app.Activity', PythonActivity.mActivity)` — **first
  appearance**, full treatment above (Terms and Objects). Needed
  specifically because `PythonActivity.mActivity`'s own declared type,
  as far as the bridge can tell without help, isn't enough to resolve
  `.startActivity(...)` unambiguously — `Activity` is the real Java
  class that method is actually declared on.
- `current_activity.startActivity(enable_intent)` — **first appearance
  of `startActivity`.** Genuinely fire-and-forget from this project's
  own code's point of view — it launches Android's real, built-in
  "allow this app to turn on Bluetooth?" screen and returns
  immediately; this lesson does not capture or react to the user's
  real answer, a real, deliberately named limitation covered in this
  lesson's own SE Lens.

### Execution Trace

**Same honesty note as this whole project, and this lesson has no
desktop fallback to sanity-check against at all — every prediction
here rests entirely on real Java/Android documentation, cross-checked,
not run.**

1. `on_bluetooth_ready` runs. Predict `getDefaultAdapter()` returns a
   real, non-`None` adapter on essentially any real phone.
2. Predict `isEnabled()` returns `False` on a device where Bluetooth
   was never turned on.
3. Predict the real "Allow Bluetooth?" system screen appears,
   launched by `startActivity`, and this method's own Python code has
   already returned and finished before the user answers anything at
   all.
4. The user taps "Allow." Predict nothing in *this* lesson's own code
   reacts to that answer directly — the real Bluetooth radio does turn
   on, but this method has no way to know that happened without
   checking `isEnabled()` again later, which it doesn't yet do.

### CS Lens

**A language interop bridge — code in one language calling real,
unmodified code written in another, live, at runtime — is a real,
general technique recognized well beyond Python and Java**:
JNI itself (the lower-level mechanism Pyjnius is built on), Python's
own `ctypes` calling into C libraries, JavaScript engines exposing
native browser APIs to script code, .NET's interop layer calling into
native Windows libraries. The shared shape every one of these has:
the calling language's own code never sees the other language's real
source — only a live, translated view of its already-compiled
classes or functions.

### SE Lens

**Why does this lesson deliberately not try to capture the user's real
enable/deny answer?** Capturing a real activity result from
Pyjnius requires subclassing `PythonActivity` itself in real Java
source and overriding `onActivityResult` there — genuine, deeper
native-Android-project work this series hasn't built up to yet, well
beyond "call an existing class through the bridge." The honest choice
made here: fire the request, and leave *knowing whether it worked* to
whatever code needs Bluetooth next, checking `isEnabled()` again at
that point — a real, named simplification, not a hidden one. Lesson
07 inherits this gap directly, and checks `isEnabled()` itself before
trusting Bluetooth is actually ready.

---

## Connect the Pieces

`autoclass`, proven in Step 1 against a completely ordinary Java class
with nothing hardware-related about it, is the one mechanism behind
every real Android class this lesson touches —
`BluetoothAdapter`, `PythonActivity`, `Intent`, `Activity` — each
loaded the identical way. `getDefaultAdapter()`'s static call and
`isEnabled()`'s instance call are the two existence-then-state
checks any real Bluetooth work needs before proceeding;
`cast(...)`, needed once, resolves the one
real ambiguity the bridge itself couldn't infer on its own, so that a
real Android system screen can be launched directly from Python.

## What Breaks Without This

Skip the `cast(...)` call and try to use `PythonActivity.mActivity`
directly:

```python
PythonActivity.mActivity.startActivity(enable_intent)   # <- no cast first
```

Predicted result: a real error at this exact line — Pyjnius' own
automatic type inference, based on `mActivity`'s declared field type,
does not expose `startActivity` as callable without first being told,
explicitly, to treat the object as a real `Activity`. Restore the
`cast(...)` call, and confirm for yourself that the same object,
merely re-typed, exposes the method the un-cast version did not.

## Exercises

1. Log `self.bluetooth_adapter.getName()` right after obtaining the
   adapter, and confirm it reports this phone's own real Bluetooth
   name — a real, settable value, though this lesson only reads it.
2. Deliberately misspell a class name passed to `autoclass` (e.g.
   `'android.bluetooth.BluetoothAdaptr'`) and read the real error
   Pyjnius produces — confirm it fails at the `autoclass` call itself,
   before any real Bluetooth code runs at all.
3. After `startActivity` launches the real enable screen, manually
   check `self.bluetooth_adapter.isEnabled()` again a few seconds
   later (a quick, temporary `Clock.schedule_once`) and confirm for
   yourself, firsthand, that this really is the only way this lesson's
   own code can currently learn the real outcome.

## Definition of Done

- [ ] You ran Step 1's throwaway addition inside a real Android build
      and saw real Java method calls — `.toUpperCase()`, `.length()` —
      run successfully from Python.
- [ ] You ran the real Step 2 code and saw the real "Allow Bluetooth?"
      system screen appear.
- [ ] You can explain, without looking, why `getDefaultAdapter()` was
      chosen over a `Context.getSystemService`-based approach for this
      lesson specifically.
- [ ] You can explain what `cast(...)` actually does, and reproduced
      the real error that happens without it.
- [ ] You can state, in your own words, why this lesson doesn't know
      whether the user actually enabled Bluetooth, and what a real fix
      would require.
- [ ] Commit: the updated `main.py`.

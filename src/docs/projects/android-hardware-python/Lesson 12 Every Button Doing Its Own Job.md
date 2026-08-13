# Lesson 12: Every Button Doing Its Own Job

**What you will build:** a real, scrollable list of every bonded and
newly discovered device, each as its own tappable button — replacing
Lesson 09's hardcoded "always connect to `devices[0]`" with the user's
own real choice. The transferable problem, and this lesson's actual
core subject: building several buttons inside a loop, each meant to
act on a *different* value, runs into one of Python's own real,
well-known gotchas — one this lesson proves and fixes in plain Python
first, entirely before Kivy or Bluetooth ever enter the picture.

**What you need to know first:** Lesson 09's `connect_to_first_device`
(renamed and generalized here) and Lesson 11's `BoxLayout`/`add_widget`.

**Terms introduced in this lesson:**
- **Late binding (in a closure)** — when a function created inside a
  loop refers to a loop variable by name, it doesn't capture that
  variable's value at creation time — it looks the name up again, for
  real, every time it's actually called, by which point the loop has
  usually already finished and the variable holds whatever its very
  last value was.

**Objects and methods this lesson uses:**
- **`kivy.uix.scrollview.ScrollView`**
  - *What it is:* a container that lets its single child be larger
    than the visible screen, scrollable by a real touch drag.
  - *Implementation:* holds exactly one child; that child needs its
    own height set explicitly — a `ScrollView` doesn't shrink or grow
    its content, only lets the user scroll through however tall it
    already is.
  - *Its use:* wraps this lesson's own growing list of device buttons,
    which could easily exceed the screen once several devices are
    found.
- **`Widget.setter(property_name)`**
  - *What it is:* returns a real, callable function that sets one
    specific property on a widget — used together with `.bind(...)`
    to keep two properties in sync automatically.
  - *Implementation:* `layout.bind(minimum_height=layout.setter('height'))`
    means: whenever `minimum_height` changes, call
    `layout.height = <the new value>`, automatically, from then on.
  - *Its use:* makes the scrollable list's own layout grow exactly as
    tall as its buttons actually need, covered fully in the Mechanical
    Walkthrough.

---

## Concept Unit: A Variable a Loop Already Moved Past

### The Problem

Lesson 09 connected to exactly one, hardcoded device —
`devices[0]` — because building a real button *per* device, each
correctly wired to *that* device and no other, runs into a real,
common Python trap: a `lambda` created inside a `for` loop, referring
to the loop variable directly, doesn't remember that variable's value
at the moment the `lambda` was created — every single button ends up
referring to whatever the loop variable holds by the time any button
is actually pressed, which, after the loop has finished, is always the
same, final value.

### Introduce the Concept in Isolation — Step 1: Proving the Trap, Then Proving the Fix, With No Kivy At All

**Ordinary, desktop Python — no Kivy, no Android, no Bluetooth
involved.** Run this first, broken, version exactly as written:

```python
callbacks = []
for i in range(3):
    callbacks.append(lambda: print("i is", i))

for cb in callbacks:
    cb()
```

Expected output — **the same value, three times**, not `0`, `1`, `2`
as a first read might expect:

```
i is 2
i is 2
i is 2
```

All three `lambda`s share the exact same `i` — the loop's own single
variable, not a fresh copy per iteration — and by the time any of them
actually runs, the loop has already finished, leaving `i` at its final
value, `2`. Now the fix — giving each `lambda` its own default
argument, evaluated immediately, at creation time, not looked up later:

```python
callbacks = []
for i in range(3):
    callbacks.append(lambda i=i: print("i is", i))

for cb in callbacks:
    cb()
```

Expected output this time — each one genuinely different:

```
i is 0
i is 1
i is 2
```

`lambda i=i: ...` — the parameter name and the outer variable share a
name on purpose, but they are not the same variable: a default
argument's value is computed once, immediately, when the `lambda`
itself is created, and stored on that specific function from then on —
exactly the fix the real device buttons below depend on.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Kivy's `ScrollView`
and `.setter(...)` mechanism are confirmed against Kivy's own current
official documentation, fetched this session; the closure/late-binding
behavior above is ordinary, well-documented Python, not
Kivy-or-Android-specific at all.

**Files affected:** `main.py`.

**Change type:** modify `build()` (adds the scrollable list);
modify `list_bonded_devices` and `on_device_found` (both now add a
button per device instead of, or alongside, only logging); rename
`connect_to_first_device` to `connect_to_device` and generalize it;
add one new method.

**Location:** inside `MyApp`.

**Dependencies:** Lesson 09's `_connect_worker`/`threading` (reused
unchanged); Lesson 11's `BoxLayout`/`add_widget`; Lesson 08's
`on_device_found`.

```python
from kivy.uix.scrollview import ScrollView                                # <- new

# (inside build(), after name_button is added to layout)

self.device_list_layout = BoxLayout(orientation="vertical", size_hint_y=None) # <- new
self.device_list_layout.bind(                                              # <- new
    minimum_height=self.device_list_layout.setter("height")                # <- new
)                                                                          # <- new
device_scroll = ScrollView()                                               # <- new
device_scroll.add_widget(self.device_list_layout)                          # <- new
layout.add_widget(device_scroll)                                           # <- new

# (rest of MyApp)

def list_bonded_devices(self):
    bonded = self.bluetooth_adapter.getBondedDevices()
    devices = bonded.toArray()
    if len(devices) == 0:
        Logger.info("MyApp: no bonded devices — pair one in Android's own Bluetooth settings first")
    else:
        for device in devices:
            Logger.info(f"MyApp: bonded device — {device.getName()} ({device.getAddress()})")
            self.add_device_button(device)                                 # <- new
    self.start_discovery()

def on_device_found(self, context, intent):
    device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
    device = cast('android.bluetooth.BluetoothDevice', device)
    Logger.info(f"MyApp: found — {device.getName()} ({device.getAddress()})")
    self.add_device_button(device)                                         # <- new

def add_device_button(self, device):                                       # <- new
    button = Button(                                                      # <- new
        text=f"{device.getName()} ({device.getAddress()})",                # <- new
        size_hint_y=None, height=80,                                      # <- new
    )                                                                     # <- new
    button.bind(                                                          # <- new
        on_press=lambda instance, device=device: self.connect_to_device(device) # <- new
    )                                                                     # <- new
    self.device_list_layout.add_widget(button)                             # <- new

def connect_to_device(self, device):                                       # <- renamed from connect_to_first_device
    threading.Thread(
        target=self._connect_worker, args=(device,), daemon=True
    ).start()
```

### Mechanical Walkthrough

- `from kivy.uix.scrollview import ScrollView` — **first appearance**,
  full treatment above (Objects and methods).
- `self.device_list_layout = BoxLayout(orientation="vertical", size_hint_y=None)`
  — **reappearing `BoxLayout` from Lesson 11, new property:**
  `size_hint_y=None` turns off this layout's default "share available
  space proportionally" behavior for its own height specifically — a
  required first step before that height can instead be driven by its
  own content, next.
- `self.device_list_layout.bind(minimum_height=self.device_list_layout.setter("height"))`
  — **first appearance**, full treatment above (Objects and methods).
  Without this line, adding buttons later would grow the layout's
  *content* without ever growing the layout's own `height` to match,
  and everything past the first couple of buttons would simply be
  invisible.
- `device_scroll = ScrollView()` / `device_scroll.add_widget(self.device_list_layout)`
  — **first real `ScrollView`**, full treatment above; `add_widget`
  itself **reappearing exactly from Lesson 11**.
- `layout.add_widget(device_scroll)` — **reappearing exact mechanism**,
  extending the same top-level `BoxLayout` from Lesson 11 with a
  fourth child.
- `self.add_device_button(device)` (added inside both
  `list_bonded_devices` and `on_device_found`) — one new call site in
  each of two existing methods, so every device this project ever
  learns about — already-paired or freshly discovered — gets a real
  button the same way, regardless of which path found it.
- `def add_device_button(self, device):` — **first appearance of this
  method.** Builds one real `Button` per call, using **reappearing
  `Button`/`.bind()` mechanics from Lesson 11**, with one new detail:
- `lambda instance, device=device: self.connect_to_device(device)` —
  **first real, non-isolated use of the exact fix Step 1 just proved.**
  `device=device` — the outer `device` (this call's own loop-free
  parameter, freshly bound for this specific button) is evaluated
  immediately and stored as this one `lambda`'s own default, the
  identical mechanism as Step 1's `i=i`; without it, every button
  created here would end up connecting to whichever device happened to
  be added to the list *last*.
- `self.device_list_layout.add_widget(button)` — **reappearing exact
  mechanism**, adding this one new button to the scrollable list.
- `def connect_to_device(self, device):` — **renamed and generalized
  from Lesson 09's `connect_to_first_device`, body unchanged.** Lesson
  09 always called this with `devices[0]`; from this lesson on, it's
  called with whichever real device the user actually tapped.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Kivy's own current documentation and ordinary,
well-documented Python closure behavior, not a captured run.

1. `build()` runs. Predict a real, initially empty scrollable region
   appears below the name-setting controls from Lesson 11.
2. `list_bonded_devices` runs. Predict one real button appears per
   bonded device, each correctly labeled with that specific device's
   own name and address — not all showing the same, last one.
3. As discovery finds new devices over the next several seconds,
   predict `on_device_found` adds a further real button for each,
   appended to the bottom of the same scrollable list, growing it
   past the visible screen if enough are found — scrollable by a real
   touch drag from that point on.
4. The user taps a specific button, not necessarily the first or the
   last one added. Predict `connect_to_device` runs with exactly that
   button's own device — direct, real proof the closure fix worked,
   not merely trusted to have.

### CS Lens

**Loop variables captured by reference instead of by value is a real,
well-known gotcha recognized well beyond Python** — JavaScript's own
notorious `var` in a `for` loop, before `let` existed specifically to
fix it; C#'s own foreach-variable-capture semantics, which the
language itself changed between versions for this exact reason. The
shared root cause, everywhere it appears: a closure remembers a
*variable*, not a *value*, unless something explicit — a default
argument here, a new block-scoped binding elsewhere — forces a real,
separate value to be captured per iteration instead.

### SE Lens

**Why does `add_device_button` exist as its own separate method,
rather than building each button's `lambda` directly inline inside
`list_bonded_devices`'s own loop?** Two real call sites —
`list_bonded_devices` and `on_device_found` — both need to add a
button the identical way; writing the closure-safe `lambda` construction
once, in one shared method, means the fix from Step 1 only has to be
gotten right in one place, not reproduced correctly twice. A subtle
correctness detail like this specific closure fix is exactly the kind
of logic worth centralizing, even though the method itself is short.

---

## Connect the Pieces

Step 1's own two short loops, proven with nothing but `print` and no
UI at all, are the entire reason `add_device_button`'s `lambda`
includes `device=device` — the identical fix, applied for the first
time to something real: a specific, tappable button that must stay
correctly wired to the one device it was built for, even after the
loop that built it has long since moved on. `ScrollView`,
`size_hint_y=None`, and `.setter("height")` together solve a
different, unrelated problem — making room for however many buttons
that turns out to be — and `connect_to_device`, Lesson 09's own
thread-and-socket mechanism, needs no change at all once it's finally
given a real, user-chosen device instead of a hardcoded one.

## What Breaks Without This

Remove `device=device` from the `lambda`, reverting to the broken
shape Step 1 first demonstrated:

```python
button.bind(
    on_press=lambda instance: self.connect_to_device(device)  # <- wrong: device captured by reference
)
```

Predicted result: every button still appears correctly labeled with
its own, distinct device's real name — the *labels* were never the
problem, since `text=f"..."` is evaluated immediately, per button,
regardless. But tap any button at all, including the very first one
added, and predict every single one connects to the *same* device —
whichever one happened to be the last one added to the list — the
identical real bug Step 1 already proved in isolation, now hiding
behind a UI that looks completely correct until actually tapped.
Restore `device=device`, and confirm for yourself, by tapping several
different buttons in turn, that each now reaches its own, correct
device.

## Exercises

1. Log `device.getAddress()` from inside the `lambda` itself
   (temporarily), tap several different buttons in turn, and confirm
   each one logs a different, correct address matching its own label.
2. Deliberately reintroduce the broken version from What Breaks
   Without This, and confirm for yourself, by tapping the *first*
   button added rather than the last, that it still connects to the
   wrong (last) device — direct, physical proof this isn't about which
   button you press, but about when the loop finished.
3. Add a small visual change — disabling a button
   (`instance.disabled = True`) the moment it's tapped — so a user
   can't accidentally trigger two simultaneous connection attempts to
   the same device by tapping twice quickly.

## Definition of Done

- [ ] You ran Step 1's two scratch loops on the desktop and saw the
      real, wrong `2, 2, 2` output, then the real, correct `0, 1, 2`
      output from the fixed version.
- [ ] You ran the real Step 2 code on a real Android build and saw a
      real, scrollable list of distinct, correctly labeled device
      buttons.
- [ ] You tapped at least two different buttons in separate attempts
      and confirmed, via real `logcat` output, that each one connected
      to its own correct device.
- [ ] You reproduced What Breaks Without This for yourself and can
      explain, without looking, exactly why the labels stayed correct
      while the actual connections did not.
- [ ] You can state, in your own words, what `device=device` in the
      `lambda`'s own argument list actually does, in terms of when
      it's evaluated.
- [ ] Commit: the updated `main.py`.

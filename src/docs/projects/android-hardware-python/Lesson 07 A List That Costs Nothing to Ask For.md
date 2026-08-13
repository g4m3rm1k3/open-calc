# Lesson 07: A List That Costs Nothing to Ask For

**What you will build:** a real log listing every Bluetooth device this
phone has already paired with, through Android's own Bluetooth
settings, independent of this app entirely — and, alongside it, a real
fix for a gap this series named honestly and left open on purpose:
Lesson 06's `startActivity` call had no way to know when the user
actually finished turning Bluetooth on. This lesson closes that gap
with a real polling check, then uses the now-confirmed-on adapter to
ask the cheapest possible real question: not "what's out there right
now" (that costs time and battery, next lesson's subject), but "what
does this phone already know about."

**What you need to know first:** Lesson 06 in full — the
`BluetoothAdapter`, `getDefaultAdapter()`, and the named, open gap in
knowing when enabling finishes.

**Terms introduced in this lesson:**
- **Bonded (paired) device** — a device the user has already paired
  with this phone at some point, through Android's own system
  Bluetooth settings screen — a real, persistent list Android itself
  maintains, entirely independent of any one app, including this one.
  Pairing itself is not something this lesson's own code performs or
  needs to.

**Objects and methods this lesson uses:**
- **`BluetoothAdapter.getBondedDevices()`**
  - *What it is:* returns every device this phone is currently paired
    with.
  - *Implementation:* an instance method, called on a real, enabled
    adapter; returns a real Java `Set` of `BluetoothDevice` objects —
    unordered, exactly like Python's own `set`.
  - *Its use:* this lesson's actual starting point for the list.
- **`.toArray()`**
  - *What it is:* converts a Java collection into a plain Java array.
  - *Implementation:* takes no arguments in this lesson's use; the
    bridge exposes the result as something Python can already `len()`,
    index, and `for`-loop over directly, the same as a Python list.
  - *Its use:* the actual mechanism this lesson's own code loops over,
    covered proven first in Step 1 below.
- **`BluetoothDevice.getName()` / `.getAddress()`**
  - *What they are:* real instance methods on each paired device —
    its user-visible name, and its permanent hardware MAC address.
  - *Implementation:* no arguments; both return plain Java strings,
    which the bridge hands back as ordinary Python strings.
  - *Their use:* what this lesson actually logs for each bonded
    device.

---

## Concept Unit: A Question Android Already Has the Answer To

### The Problem

Lesson 06 left two real things unfinished. First, its own named gap:
`startActivity(enable_intent)` fires the real "turn on Bluetooth?"
screen and returns immediately, with no way for this project's own
code to know what the user actually chose. Second, unstated until now:
even once Bluetooth is confirmed on, *scanning* for nearby devices —
next lesson's subject — takes real time and real battery, every time
it runs. Before reaching for that, a cheaper, already-answered
question exists: which devices has this phone paired with before,
through Android's own settings, at some point in the past? Android
already keeps that list. Asking for it costs nothing but a method
call.

### Introduce the Concept in Isolation — Step 1: Proving a Java Collection Really Loops Like a Python One

Same real constraint as every Pyjnius-based lesson so far — no desktop
equivalent exists. This isolation proves `.toArray()`'s own bridging
behavior using a plain `HashSet`, matching `getBondedDevices()`'s own
return shape exactly, with nothing Bluetooth-specific involved yet:

```python
from jnius import autoclass

HashSet = autoclass('java.util.HashSet')
JavaString = autoclass('java.lang.String')

fruits = HashSet()
fruits.add(JavaString("apple"))
fruits.add(JavaString("banana"))

items = fruits.toArray()
print("count:", len(items))
for item in items:
    print("-", item)
```

Run this as a throwaway addition inside a real Android build. Expected
output — the exact two items, in **no guaranteed order**, since a
`HashSet` (Java's, same as Python's own `set`) never promises one:

```
count: 2
- apple
- banana
```

`len(items)` and `for item in items:` both work exactly the way they
would on a real Python list — the bridge exposes a converted Java
array through Python's own sequence protocol, with no special syntax
needed on this project's own side at all. This is the entire mechanism
the real bonded-devices list below depends on.

**Discard this scratch addition.**

### The Real Thing

**Reference Source:** no reference counterpart — `BluetoothAdapter`'s
bonded-devices API is confirmed against Android's own official
documentation, and the array-bridging behavior of `.toArray()` through
Pyjnius is confirmed against real, working community usage examples,
both fetched and cross-checked this session.

**Files affected:** `main.py`.

**Change type:** modify `on_bluetooth_ready` (closes Lesson 06's named
gap); add two new methods.

**Location:** inside `MyApp`, alongside Lesson 06's Bluetooth methods.

**Dependencies:** Lesson 06's `self.bluetooth_adapter` and the
`Clock`/`Logger` imports already present from earlier lessons.

```python
def on_bluetooth_ready(self):
    self.bluetooth_adapter = BluetoothAdapter.getDefaultAdapter()
    if self.bluetooth_adapter is None:
        Logger.info("MyApp: no Bluetooth hardware on this device")
        return

    if not self.bluetooth_adapter.isEnabled():
        Logger.info("MyApp: Bluetooth is off — asking the user to enable it")
        enable_intent = Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE)
        current_activity = cast('android.app.Activity', PythonActivity.mActivity)
        current_activity.startActivity(enable_intent)

    Clock.schedule_interval(self.check_bluetooth_enabled, 1.0)          # <- new

def check_bluetooth_enabled(self, dt):                                   # <- new
    if self.bluetooth_adapter.isEnabled():                              # <- new
        Clock.unschedule(self.check_bluetooth_enabled)                  # <- new
        Logger.info("MyApp: Bluetooth confirmed on")                    # <- new
        self.list_bonded_devices()                                      # <- new

def list_bonded_devices(self):                                           # <- new
    bonded = self.bluetooth_adapter.getBondedDevices()                  # <- new
    devices = bonded.toArray()                                          # <- new
    if len(devices) == 0:                                               # <- new
        Logger.info("MyApp: no bonded devices — pair one in Android's own Bluetooth settings first") # <- new
        return                                                          # <- new
    for device in devices:                                              # <- new
        Logger.info(f"MyApp: bonded device — {device.getName()} ({device.getAddress()})") # <- new
```

### Mechanical Walkthrough

- `Clock.schedule_interval(self.check_bluetooth_enabled, 1.0)` (inside
  `on_bluetooth_ready`) — **reappearing mechanism from Lessons 02/04,
  new purpose.** Not polling a sensor this time — polling a single
  real yes/no fact (`isEnabled()`) once a second until it's finally
  true, the direct, named fix for Lesson 06's own left-open gap. Runs
  every time this method runs, even if Bluetooth was already on — the
  very next check confirms that instantly, rather than special-casing
  the already-on case separately.
- `def check_bluetooth_enabled(self, dt):` — **first appearance of
  this specific method, ordinary scheduled-callback shape already
  established in Lesson 02** (accepts `dt`, doesn't use it).
- `self.bluetooth_adapter.isEnabled()` — **reappearing exactly from
  Lesson 06**, called again here, repeatedly, instead of the single
  check Lesson 06 made.
- `Clock.unschedule(self.check_bluetooth_enabled)` — **reappearing
  exactly from Lesson 04's own treatment**, same method, stopping this
  new polling loop the instant its one real question is answered.
- `self.list_bonded_devices()` — first call to the new method defined
  right below; ordinary Python method call, already assumed knowledge.
- `self.bluetooth_adapter.getBondedDevices()` — **first appearance**,
  full treatment above (Objects and methods).
- `bonded.toArray()` — **first appearance of the real call**, full
  mechanism already proven in Step 1.
- `if len(devices) == 0:` — **first appearance of Python's own `len()`
  applied to a Pyjnius-bridged Java array**, proven safe in Step 1;
  handles the real, ordinary case of a phone with nothing paired yet.
- `for device in devices:` — **reappearing exactly from Step 1's own
  proof**, now looping over real `BluetoothDevice` objects instead of
  Java strings.
- `device.getName()` / `device.getAddress()` — **first appearance**,
  full treatment above (Objects and methods).

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against real Android documentation and real community usage
patterns, not a captured run.

1. `on_bluetooth_ready` runs, exactly as Lesson 06 left it, through
   `startActivity` if Bluetooth was off. Predict the new
   `check_bluetooth_enabled` polling loop now starts immediately after,
   regardless of whether Bluetooth was already on or not.
2. If Bluetooth was already on: predict the very first check, roughly
   one second later, finds `isEnabled()` already `True`, unschedules
   itself, and `list_bonded_devices()` runs almost immediately.
3. If Bluetooth was off and the user is still looking at the real
   system "Allow Bluetooth?" screen: predict repeated, silent
   `isEnabled()` checks, once a second, producing no log output at all
   until the user actually answers.
4. Once confirmed on: predict a real `Logger.info` line for every
   currently bonded device, each showing a real name and real MAC
   address — or, on a phone with nothing paired, predict exactly one
   line naming that fact instead.

### CS Lens

**Polling a single fact on a fixed interval, until it finally becomes
true, is a real, general fallback technique — used specifically when a
system has no direct way to be notified the moment something actually
changes.** Older hardware drivers, before interrupts existed, polled a
status register in a loop to learn when an operation finished; many
webpages, before WebSockets existed, polled a server on a timer to
learn about new data. The shared reasoning matches this lesson's own
exactly: a real event *did* happen — the user answered a real system
dialog — but the code asking about it has no direct channel to be told
the instant it did, so it asks again, repeatedly, until the answer it
wants finally comes back true.

### SE Lens

**Why does this lesson always start the one-second poll, even in the
common case where Bluetooth was already on and `startActivity` never
even ran?** A second, faster path — check once, immediately, skip the
loop entirely if already `True` — would shave a real, up-to-one-second
delay off the common case. This lesson deliberately keeps one single
path instead: less code, one fewer branch to reason about, at the
honest cost of a small, real, worst-case one-second delay even when
nothing needed enabling at all. A production app chasing that last
second of responsiveness would likely special-case it; this lesson's
own priority is a simpler, single mechanism doing the whole job.

---

## Connect the Pieces

`Clock.schedule_interval`/`Clock.unschedule`, proven back in Lessons
02 and 04 against a fake counter and a real sensor, now close a real
gap this project's own Lesson 06 named honestly rather than hid —
turning Lesson 06's fire-and-forget `startActivity` into something
this code can actually react to. `.toArray()`, proven in Step 1
against a plain `HashSet` with nothing hardware-related in it, is the
exact same mechanism `getBondedDevices()`'s own real result loops
through moments later, with nothing new needed to make it work a
second time.

## What Breaks Without This

Call `list_bonded_devices()` directly from `on_bluetooth_ready`,
immediately, with no polling loop at all — skipping the fix this
lesson makes:

```python
def on_bluetooth_ready(self):
    self.bluetooth_adapter = BluetoothAdapter.getDefaultAdapter()
    # ...startActivity(...) as before...
    self.list_bonded_devices()   # <- wrong: called before Bluetooth is confirmed on
```

Predicted result: on a phone where Bluetooth was already on, this
still happens to work — the real risk is invisible until the one case
that matters. On a phone where Bluetooth was actually off,
`getBondedDevices()` is called while the adapter is still disabled,
before the user has even seen the real enable screen — predict either
an empty result or a real Java exception, depending on the exact
Android version, neither of which reflects this phone's real paired
devices at all. Restore the polling loop, and confirm for yourself
that `list_bonded_devices()` now only ever runs once Bluetooth is
genuinely, confirmedly on.

## Exercises

1. Turn Bluetooth off entirely before opening the app, then watch real
   `logcat` output and time, roughly, how long the silent polling
   period lasts before you answer the real system prompt yourself.
2. Log `check_bluetooth_enabled`'s own call count (a simple counter
   field, similar to Lesson 02's) and confirm, firsthand, how many real
   times it actually ran before unscheduling itself.
3. Pair a second device with this phone through Android's own
   Bluetooth settings, without changing any code, and confirm the real
   log output now lists both — proving this lesson's own code reads
   Android's real, live paired-device list, not a cached or
   app-specific one.

## Definition of Done

- [ ] You ran Step 1's scratch addition inside a real Android build
      and saw a real Java `HashSet`, converted with `.toArray()`, loop
      correctly through plain Python `len()` and `for`.
- [ ] You ran the real Step 2 code with Bluetooth already on, and saw
      bonded devices logged almost immediately.
- [ ] You also ran it with Bluetooth off, watched the real enable
      screen, and confirmed the log output waits for your real answer
      before listing anything.
- [ ] You can explain, without looking, why this lesson polls even in
      the case where Bluetooth was already on, instead of checking
      once and branching.
- [ ] You can state, in your own words, what a bonded device actually
      is, and why pairing itself isn't something this lesson's code
      performs.
- [ ] Commit: the updated `main.py`.

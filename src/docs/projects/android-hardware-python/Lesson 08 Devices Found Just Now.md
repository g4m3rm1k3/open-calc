# Lesson 08: Devices Found Just Now

**What you will build:** a real, live scan for nearby Bluetooth
devices — ones this phone has never paired with — using a real,
time-limited discovery burst and a real Android broadcast receiver to
catch each device the instant it's found. The transferable problem:
Lesson 07's bonded list only ever shows devices already known about;
finding something genuinely new requires actively asking the radio to
go look, and reacting to a real, ongoing stream of system-level events
this project's own code did not choose the timing of.

**What you need to know first:** Lesson 07 in full — the confirmed-on
`BluetoothAdapter`, and the `Clock`/`on_pause` mechanisms this lesson
reuses.

**Terms introduced in this lesson:**
- **Discovery (Bluetooth)** — a real, active scan for nearby
  Bluetooth devices, on or off pairing entirely. Real, time-limited
  (about twelve real seconds), and a real, ongoing battery cost for as
  long as it runs — distinct from Lesson 07's bonded list, which costs
  nothing because it asks for something already known.
- **Broadcast (Android)** — a system-wide announcement Android itself
  sends out, that any app can choose to listen for, about something
  that just happened — a device found during a scan, a battery level
  changing, a headset plugged in. This project's own code never
  triggers a broadcast directly; it only ever reacts to one.
- **Parcelable** — Android's own format for an object that can travel
  attached to an `Intent`, across Android's own internal boundaries —
  `BluetoothDevice` is one, which is the only reason a found device can
  ride along inside a broadcast's own data at all.

**Objects and methods this lesson uses:**
- **`BluetoothAdapter.startDiscovery()` / `.cancelDiscovery()`**
  - *What they are:* start and stop a real, active scan for nearby
    devices.
  - *Implementation:* `startDiscovery()` takes no arguments, returns
    immediately, and runs for roughly twelve real seconds unless
    cancelled first; `cancelDiscovery()` stops an in-progress scan
    early.
  - *Their use:* what actually turns the radio's own scanning on and
    off.
- **`android.broadcast.BroadcastReceiver`** (python-for-android's own
  helper class, not Pyjnius itself)
  - *What it is:* a ready-made Python wrapper around Android's real
    broadcast-receiver mechanism — built by python-for-android
    specifically so real Python code doesn't have to hand-write the
    lower-level Pyjnius plumbing a raw receiver would otherwise need.
  - *Implementation:* constructed with a callback function and a list
    of action strings to listen for; exposes `.start()`/`.stop()` to
    register and unregister it with Android.
  - *Its use:* what actually catches each found device, the instant
    Android announces one.
- **`BroadcastReceiver(callback, actions=[...])`**
  - *What it is:* the constructor above, expanded.
  - *Implementation:* `callback` must accept exactly two arguments,
    `(context, intent)`; each string in `actions` is either a full,
    dotted action name used exactly as given, or a short name this
    class tries to expand automatically by looking for a matching
    `ACTION_*` field on Android's own `Intent` class specifically —
    which only works for actions `Intent` itself defines, covered
    directly in the Mechanical Walkthrough below.
  - *Its use:* this lesson passes the full, dotted Bluetooth action
    name, on purpose, rather than relying on that automatic expansion.
- **`intent.getParcelableExtra(name)`**
  - *What it is:* reads a `Parcelable`-typed value out of a broadcast's
    own attached data.
  - *Implementation:* takes the extra's key name as a string; returns
    the attached object, generically typed until cast to something
    more specific.
  - *Its use:* how this lesson actually pulls the found
    `BluetoothDevice` out of each broadcast.
- **`BluetoothDevice.EXTRA_DEVICE`**
  - *What it is:* the real, fixed key name Android uses for the found
    device inside a discovery broadcast's own extras.
  - *Implementation:* a `static final String` field, read the same way
    `BluetoothAdapter.ACTION_REQUEST_ENABLE` was read in Lesson 06.
  - *Its use:* the exact key passed to `getParcelableExtra`, above.

---

## Concept Unit: Reacting to Something You Didn't Ask to Be Told Yet

### The Problem

Every lesson so far in this arc *asked* Android a direct question and
got a direct answer back — `isEnabled()`, `getBondedDevices()`. A live
scan doesn't work that way: `startDiscovery()` starts the radio
scanning and returns immediately, with **no return value at all**
describing what it finds — devices turn up one at a time, over the
next several real seconds, each announced through a real Android
broadcast this project's own code has to already be listening for
*before* it happens, not after.

### Introduce the Concept in Isolation — Step 1: Proving a Broadcast Receiver Really Catches Something Real, With Nothing Bluetooth-Specific Yet

No desktop equivalent exists here either. This isolation reaches for a
real, ordinary Android broadcast that needs no discovery, no scanning,
and no user action at all to prove itself: the phone's own current
battery state, announced automatically the instant anything registers
for it.

```python
from kivy.app import App
from kivy.uix.widget import Widget
from kivy.clock import Clock
from android.broadcast import BroadcastReceiver


class ReceiverApp(App):
    def build(self):
        self.receiver = BroadcastReceiver(self.on_battery, actions=['battery_changed'])
        self.receiver.start()
        Clock.schedule_once(lambda dt: self.stop(), 5)
        return Widget()

    def on_battery(self, context, intent):
        level = intent.getIntExtra('level', -1)
        print("Battery level:", level)


ReceiverApp().run()
```

Run this as a throwaway addition inside a real Android build. Expected
output — one real line, almost immediately, since Android delivers
this particular broadcast's current state the instant anything
registers for it, with no waiting required:

```
Battery level: 76
```

(A second line would appear only if the real battery percentage
changes within the five real seconds this scratch app stays open —
plausible, but not expected on every run.) `'battery_changed'` worked
as a short name here specifically because `android.content.Intent`
itself defines `Intent.ACTION_BATTERY_CHANGED` — this exact detail
matters directly for the real code below.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — `BluetoothAdapter`'s
discovery API and `BluetoothDevice`'s broadcast extras are confirmed
against Android's own official developer documentation, fetched this
session; `android.broadcast.BroadcastReceiver`'s own real source is
read directly from the python-for-android project this session.

**Files affected:** `main.py`.

**Change type:** modify `list_bonded_devices` (calls the new method at
its end); modify `on_pause`; add two new methods.

**Location:** inside `MyApp`, alongside Lesson 07's Bluetooth methods.

**Dependencies:** Lesson 07's confirmed-enabled `self.bluetooth_adapter`;
Lesson 04's `on_pause`.

```python
from android.broadcast import BroadcastReceiver                          # <- new

BluetoothDevice = autoclass('android.bluetooth.BluetoothDevice')          # <- new

# (inside MyApp)

def list_bonded_devices(self):
    bonded = self.bluetooth_adapter.getBondedDevices()
    devices = bonded.toArray()
    if len(devices) == 0:
        Logger.info("MyApp: no bonded devices — pair one in Android's own Bluetooth settings first")
    else:
        for device in devices:
            Logger.info(f"MyApp: bonded device — {device.getName()} ({device.getAddress()})")
    self.start_discovery()                                                # <- new

def start_discovery(self):                                                 # <- new
    self.discovery_receiver = BroadcastReceiver(                          # <- new
        self.on_device_found,                                            # <- new
        actions=['android.bluetooth.device.action.FOUND'],                # <- new
    )                                                                     # <- new
    self.discovery_receiver.start()                                      # <- new
    self.bluetooth_adapter.startDiscovery()                               # <- new
    Logger.info("MyApp: discovery started")                              # <- new

def on_device_found(self, context, intent):                                # <- new
    device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)      # <- new
    device = cast('android.bluetooth.BluetoothDevice', device)            # <- new
    Logger.info(f"MyApp: found — {device.getName()} ({device.getAddress()})") # <- new

def on_pause(self):
    Clock.unschedule(self.update_label)
    accelerometer.disable()
    if hasattr(self, 'discovery_receiver'):                               # <- new
        self.discovery_receiver.stop()                                   # <- new
        self.bluetooth_adapter.cancelDiscovery()                          # <- new
        Logger.info("MyApp: paused — discovery cancelled")               # <- new
    Logger.info("MyApp: paused — accelerometer disabled")
    return True
```

### Mechanical Walkthrough

- `from android.broadcast import BroadcastReceiver` — **first
  appearance**, full treatment above (Objects and methods).
- `BluetoothDevice = autoclass('android.bluetooth.BluetoothDevice')` —
  **reappearing exact mechanism from Lesson 06**, loading a different
  real class this time.
- `self.start_discovery()` (added to the end of `list_bonded_devices`)
  — deliberate ordering: the cheap, already-known list finishes first,
  and only then does the more expensive live scan begin.
- `BroadcastReceiver(self.on_device_found, actions=['android.bluetooth.device.action.FOUND'])`
  — **first real appearance**, full treatment above. The action string
  is passed in its complete, dotted form on purpose — Step 1's own
  `'battery_changed'` only worked as a short name because `Intent`
  itself defines `ACTION_BATTERY_CHANGED`; `ACTION_FOUND` is defined on
  `BluetoothDevice` instead, which this class's own automatic
  expansion never checks, confirmed directly from its real source.
  Passing the full name sidesteps that limitation entirely, rather
  than working around it.
- `self.discovery_receiver.start()` — **first appearance of this
  method**, full treatment above; registers the receiver with Android
  before scanning begins, deliberately in that order, so no found
  device can be missed in the gap between starting the scan and
  starting the receiver.
- `self.bluetooth_adapter.startDiscovery()` — **first appearance**,
  full treatment above (Objects and methods).
- `def on_device_found(self, context, intent):` — **reappearing exact
  callback shape from Step 1's own `on_battery`**, same two required
  parameters, different real content inside.
- `intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)` — **first
  appearance**, full treatment above (Objects and methods).
- `device = cast('android.bluetooth.BluetoothDevice', device)` — **
  reappearing exact mechanism from Lesson 06, new reason for needing
  it.** `getParcelableExtra` hands back a generically typed object —
  the same real ambiguity `PythonActivity.mActivity` had in Lesson 06
  — resolved the identical way, by naming the real, specific class the
  bridge should treat it as, before `.getName()`/`.getAddress()` are
  reachable on it. Contrast this with Lesson 07's `toArray()` result,
  where no cast was needed at all — there, each array element's real,
  concrete runtime class was already `BluetoothDevice`, and Pyjnius
  resolved it without help; here, the extra arrives typed only as the
  generic `Parcelable` interface until told otherwise.
- `if hasattr(self, 'discovery_receiver'):` (inside `on_pause`) —
  **ordinary Python, already assumed knowledge — worth noting only
  because it's a real, necessary guard**, not defensive padding: a
  user could pause the app before ever reaching `start_discovery` at
  all — mid-permission-request, or mid-enable-screen — and this
  guard is what keeps `on_pause` from failing in exactly that real,
  already-demonstrated-possible case.
- `self.discovery_receiver.stop()` / `self.bluetooth_adapter.cancelDiscovery()`
  — **first real appearances**, full treatment above; stopping both the
  listener and the scan itself, independently, the same two-part
  shutdown shape Lesson 04 already established for `Clock.unschedule`
  and `accelerometer.disable()`.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against real Android documentation and this class's own real
source, not a captured run.

1. `list_bonded_devices` finishes logging whatever was already paired,
   then calls `start_discovery`. Predict a real `Logger.info` line
   confirming discovery started, followed immediately by
   `startDiscovery()`'s own real scan beginning.
2. Over the next several real seconds, predict a separate
   `Logger.info` line for every real, distinct nearby device
   discovered — order and timing entirely determined by real radio
   conditions, not by this project's own code.
3. Predict the scan ends on its own after roughly twelve real seconds,
   with no further `on_device_found` calls after that, unless this
   project's own `on_pause` cancels it earlier.
4. The user presses Home mid-scan. Predict `on_pause` runs: the
   `hasattr` guard finds `discovery_receiver` does exist this time,
   stops it, cancels the in-progress scan, and logs that fact —
   contrasted directly with the earlier, still-possible case where
   pausing happens before discovery ever started, and the guard skips
   this block entirely instead.

### CS Lens

**Registering a listener *before* triggering the action that produces
what it's listening for is a real, general ordering requirement —
recognized well beyond Android broadcasts**: a message queue
subscriber that must connect before a publisher starts sending, an
event listener in a browser attached before the event it's meant to
catch can fire, a database trigger created before the writes it's
meant to react to happen. Miss the order in any of these, including
this lesson's own `.start()`-before-`startDiscovery()` sequence, and
whatever happened in that gap is simply gone — there is no way to ask
for it again after the fact.

### SE Lens

**Why does `on_pause` cancel an in-progress scan, but deliberately not
restart one automatically in `on_resume`, the way the accelerometer
does?** The accelerometer is cheap, continuous, and meaningless to
show stale — restarting it every time the app becomes visible again is
the whole point. Discovery is different: a real, one-shot, roughly
twelve-second burst the user chose to begin once — silently
re-triggering it on every single resume would mean real, repeated
battery cost the user never asked for a second time. This lesson's own
honest choice: pausing always stops an in-flight scan cleanly, but
starting a new one again is left as something the user (or a later
lesson's own UI) decides deliberately, not something `on_resume`
assumes on their behalf.

---

## Connect the Pieces

`android.broadcast.BroadcastReceiver`, proven in Step 1 against a
real, always-available battery broadcast with no Bluetooth involved at
all, is the exact same mechanism the real discovery code depends on —
only the action string and the callback's own real content change.
`cast(...)`, first needed in Lesson 06 for an ambiguous `Activity`
reference, is needed again here for the identical reason on a
`Parcelable` extra — contrasted directly against Lesson 07's
`toArray()`, which needed no cast at all, so that the *pattern* behind
when casting is and isn't required stays visible rather than
memorized case by case. `on_pause`'s own two-part shutdown shape,
established back in Lesson 04 for the accelerometer, extends here to a
second, independent resource — the receiver and the scan, stopped
together, for the same underlying reason.

## What Breaks Without This

Swap the order of the last two lines in `start_discovery`, starting
the scan before the receiver is registered:

```python
def start_discovery(self):
    self.discovery_receiver = BroadcastReceiver(
        self.on_device_found,
        actions=['android.bluetooth.device.action.FOUND'],
    )
    self.bluetooth_adapter.startDiscovery()    # <- wrong: scan starts first
    self.discovery_receiver.start()            # <- registered too late
```

Predicted result: nothing crashes, and the scan runs exactly as
before — the real danger is silent. Any device found in the real gap
between these two now-swapped lines, however small that gap actually
is in practice, produces a real broadcast this project's own code was
not yet listening for — and that specific announcement is gone
permanently, with no way to ask Android to resend it. Restore the
original order, and treat this as confirmation of the CS Lens point
above, not something you can observe directly by watching a log.

## Exercises

1. Change the action string back to the short form, `'found'`, run it,
   and read the real exception this class's own source raises —
   confirm for yourself that it names `ACTION_FOUND` specifically as a
   field it couldn't find on `Intent`.
2. Log `context` itself (not just `intent`) inside `on_device_found`
   and confirm it's the same real Activity object Lesson 06's
   `PythonActivity.mActivity` already named.
3. Remove the `cast(...)` call and confirm, firsthand, that
   `device.getName()` fails without it — the identical real error
   shape Lesson 06's own "What Breaks Without This" already predicted
   for a different object entirely.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw a real battery percentage
      logged almost immediately after registering the receiver.
- [ ] You ran the real Step 2 code near at least one other
      Bluetooth-discoverable device and saw it logged by
      `on_device_found`.
- [ ] You paused the app mid-scan and confirmed, via real `logcat`
      output, that discovery actually stopped rather than continuing
      silently in the background.
- [ ] You can explain, without looking, why the action string had to
      be passed in its full, dotted form instead of the short form
      Step 1 used.
- [ ] You can state, in your own words, why this lesson's `cast(...)`
      call is necessary here but wasn't in Lesson 07's `toArray()`
      loop.
- [ ] Commit: the updated `main.py`.

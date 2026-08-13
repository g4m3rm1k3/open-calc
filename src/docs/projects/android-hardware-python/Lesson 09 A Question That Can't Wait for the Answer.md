# Lesson 09: A Question That Can't Wait for the Answer

**What you will build:** a real connection to one of the devices
Lesson 07 already found bonded, over a real RFCOMM socket — and a real
message written across it — without ever freezing the app while the
connection attempt itself is in progress. The transferable problem:
every hardware call this series has made so far returned close to
instantly; opening a real Bluetooth socket can take real, unpredictable
time — sometimes over a second, sometimes it never succeeds at all —
and Kivy's own event loop, established all the way back in Lesson 02,
still cannot be blocked while that's happening.

**What you need to know first:** Lesson 07 in full — the bonded device
list this lesson connects to the first entry of. Lesson 02's own CS
Lens, about why a blocking call inside `build()` freezes the whole app
— this lesson is that exact problem's real fix.

**Terms introduced in this lesson:**
- **Background thread** — a second, independent line of execution
  running alongside the main one, specifically so a slow or blocking
  call on it doesn't stop anything running on the main thread —
  including Kivy's own event loop — from continuing normally at the
  same time.
- **RFCOMM / SPP (Serial Port Profile)** — the specific Bluetooth
  protocol this lesson connects over: a simple, ordered stream of
  bytes between two paired devices, functioning much like a classic
  serial cable, identified by a fixed, standard UUID every device
  supporting it recognizes.

**Objects and methods this lesson uses:**
- **`threading.Thread(target, args, daemon)`**
  - *What it is:* Python's own standard-library mechanism for running
    a function on a separate thread.
  - *Implementation:* `target` is the function to run; `args` is a
    tuple of arguments passed to it; `daemon=True` means this thread
    will not stop the whole app process from exiting even if it's
    still running (or stuck) when everything else has finished —
    covered directly in this lesson's own SE Lens.
  - *Its use:* what actually keeps the connection attempt below off
    Kivy's own main thread.
- **`BluetoothDevice.createRfcommSocketToServiceRecord(uuid)`**
  - *What it is:* creates a real, not-yet-connected socket for talking
    to one specific paired device over RFCOMM.
  - *Implementation:* takes a real `java.util.UUID` identifying the
    service to connect to; returns a `BluetoothSocket`, still
    unconnected until `.connect()` is called on it.
  - *Its use:* the first real step in reaching a chosen device.
- **`BluetoothSocket.connect()`**
  - *What it is:* actually opens the connection.
  - *Implementation:* a real, genuinely blocking call — it does not
    return until the connection either succeeds or fails, which is
    exactly why this lesson runs it on a background thread rather than
    directly.
  - *Its use:* what turns an unconnected socket into a real, open one.
- **`BluetoothSocket.getOutputStream()` / `OutputStream.write(bytes)`**
  - *What they are:* the real channel used to send data once
    connected, and the method that actually sends it.
  - *Implementation:* `getOutputStream()` takes no arguments; `write`
    takes a Java `byte[]` — Pyjnius converts an ordinary Python
    `bytes` object into one automatically, with no manual conversion
    needed on this project's own side.
  - *Their use:* how this lesson's own real message actually reaches
    the other device.

---

## Concept Unit: Work That Refuses to Be Quick

### The Problem

Lesson 02 already proved, with a fake `for`/`sleep` loop, that anything
slow placed directly inside a Kivy callback freezes the entire app
until it finishes. `BluetoothSocket.connect()` is a real version of
that exact same danger — a genuine, occasionally slow, sometimes
outright hanging network-style call — and it cannot simply be avoided
the way Lesson 02's fake version could. The real fix isn't to make the
call faster; it's to run it somewhere Kivy's own event loop was never
waiting on in the first place.

### Introduce the Concept in Isolation — Step 1: Proving a Background Thread Really Doesn't Freeze Anything

**Unlike every Pyjnius-based lesson so far, this one needs no Android
build at all to prove itself** — `threading` and `time` are ordinary
Python, and Kivy itself runs on the desktop exactly as it did in
Lesson 01. Run this directly with `python main.py`:

```python
from kivy.app import App
from kivy.uix.label import Label
from kivy.clock import Clock
import threading
import time


class ThreadApp(App):
    def build(self):
        self.label = Label(text="0")
        self.count = 0
        Clock.schedule_interval(self.tick, 0.1)
        threading.Thread(target=self.slow_task, daemon=True).start()
        return self.label

    def tick(self, dt):
        self.count += 1
        self.label.text = str(self.count)

    def slow_task(self):
        print("slow_task: starting a real 3-second sleep")
        time.sleep(3)
        print("slow_task: finished")


ThreadApp().run()
```

Watch the real window while this runs. Expected: the on-screen number
keeps counting up smoothly, roughly ten times a second, the entire
time — proving the main thread, and Kivy's own event loop with it,
never stopped — while the terminal prints its two lines a real three
seconds apart, overlapping with the counting the whole time:

```
slow_task: starting a real 3-second sleep
[... label counts smoothly on screen for 3 real seconds ...]
slow_task: finished
```

Compare this directly against Lesson 02's own "What Breaks Without
This" — the same kind of slow work, but this time genuinely not
freezing anything, because it never runs on the thread Kivy's own
drawing depends on.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — `BluetoothSocket`'s
real API and Pyjnius' automatic `bytes`-to-`byte[]` conversion are
confirmed against Android's own official documentation and real,
working community usage examples, both fetched and cross-checked this
session.

**Files affected:** `main.py`.

**Change type:** modify `list_bonded_devices` (calls the new method at
its end, when at least one bonded device exists); add two new methods.

**Location:** inside `MyApp`, alongside Lesson 07's Bluetooth methods.

**Dependencies:** Lesson 07's `devices` array; Lesson 06's `cast`
import (unused by this lesson, already present).

```python
import threading                                                          # <- new

UUID = autoclass('java.util.UUID')                                        # <- new

# (inside MyApp, replacing list_bonded_devices' old ending)

def list_bonded_devices(self):
    bonded = self.bluetooth_adapter.getBondedDevices()
    devices = bonded.toArray()
    if len(devices) == 0:
        Logger.info("MyApp: no bonded devices — pair one in Android's own Bluetooth settings first")
    else:
        for device in devices:
            Logger.info(f"MyApp: bonded device — {device.getName()} ({device.getAddress()})")
        self.connect_to_first_device(devices[0])                          # <- new
    self.start_discovery()

def connect_to_first_device(self, device):                                 # <- new
    threading.Thread(                                                    # <- new
        target=self._connect_worker, args=(device,), daemon=True         # <- new
    ).start()                                                            # <- new

def _connect_worker(self, device):                                         # <- new
    try:                                                                 # <- new
        service_uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") # <- new
        socket = device.createRfcommSocketToServiceRecord(service_uuid)   # <- new
        socket.connect()                                                 # <- new
        Logger.info(f"MyApp: connected to {device.getName()}")           # <- new
        output_stream = socket.getOutputStream()                          # <- new
        output_stream.write("hello from Python\n".encode("utf-8"))       # <- new
        self.bluetooth_socket = socket                                    # <- new
    except Exception as e:                                                 # <- new
        Logger.info(f"MyApp: connection to {device.getName()} failed — {e}") # <- new
```

### Mechanical Walkthrough

- `import threading` — **first appearance in this series** — Python's
  own standard library, not Android- or Pyjnius-specific at all.
- `UUID = autoclass('java.util.UUID')` — **reappearing exact mechanism
  from Lesson 06**, loading a plain Java utility class this time, not
  an Android-specific one.
- `self.connect_to_first_device(devices[0])` — **added inside
  `list_bonded_devices`, only when at least one bonded device exists**
  — `devices[0]`, ordinary Python indexing into the same
  Pyjnius-bridged array Lesson 07 already proved behaves like a plain
  Python sequence.
- `threading.Thread(target=self._connect_worker, args=(device,), daemon=True)`
  — **first appearance**, full treatment above (Objects and methods).
  `args=(device,)` — a one-element tuple, the required shape for a
  single argument, passed through to `_connect_worker` when the thread
  actually starts.
- `.start()` (on the `Thread`) — **new object, same method name as
  `BroadcastReceiver.start()`/`Clock.schedule_interval` conceptually
  "start" things elsewhere in this series, but this is Python's own
  `threading.Thread.start()`, unrelated to either.** Begins running
  `_connect_worker` on its own, separate thread, immediately, without
  blocking the line that called it.
- `def _connect_worker(self, device):` — **first appearance of a
  method meant to run entirely off the main thread.** Everything
  inside it, including every real Bluetooth call, now executes on the
  background thread `.start()` just created — not on the thread
  `build()` or any `Clock`-scheduled callback runs on.
- `try:` / `except Exception as e:` — **first real try/except in this
  series, deliberately here and not elsewhere.** A real connection
  attempt has real, expected failure modes — no device listening, a
  device that moved out of range mid-attempt — genuinely different
  from every previous lesson's calls, which either always succeed
  given valid input or already had their own explicit `None`/empty
  checks instead.
- `UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")` — **first
  appearance of `UUID.fromString`.** The exact string is not arbitrary
  — it's the standard, fixed UUID identifying the Serial Port Profile,
  recognized by any device offering it, not something this project
  invented.
- `device.createRfcommSocketToServiceRecord(service_uuid)` — **first
  appearance**, full treatment above (Objects and methods).
- `socket.connect()` — **first appearance**, full treatment above —
  the real, genuinely blocking call this entire lesson exists to keep
  off the main thread.
- `Logger.info(f"MyApp: connected to {device.getName()}")` —
  **reappearing `.getName()` from Lesson 07**, called again here after
  a successful connection specifically.
- `socket.getOutputStream()` / `output_stream.write(...)` — **first
  appearances**, full treatment above (Objects and methods).
- `"hello from Python\n".encode("utf-8")` — **ordinary Python, already
  assumed knowledge — worth noting only because this is the exact step
  producing the real `bytes` object `write(...)` then converts to a
  Java `byte[]` automatically**, the boundary between this project's
  own Python string and the real bytes that actually cross the
  Bluetooth link.
- `self.bluetooth_socket = socket` — stored for a later lesson to
  reuse, not read again anywhere in this lesson's own code.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against real Android documentation, this project's own
Pyjnius verification, and a real, documented failure mode confirmed
this session — not a captured run.

1. `list_bonded_devices` finishes logging, then starts a real
   background thread and immediately continues to `start_discovery` —
   predict no delay at all on the main thread, regardless of how long
   the connection attempt itself ends up taking.
2. On the background thread, predict `socket.connect()` blocks for
   some real, variable amount of time — often under a second for a
   device already in range and actively listening.
3. **If another device is genuinely running a matching Bluetooth
   server and accepting the connection:** predict a real "connected"
   log line, followed immediately by the real message being sent.
4. **If nothing is listening on the other end** (the common real
   case if this is run with no server present at all): predict
   `connect()` itself raises a real exception — a genuine, commonly
   reported failure shape when nothing accepts the connection or the
   attempt times out — caught by this lesson's own `except` block and
   logged, rather than crashing the app or silently hanging forever.
5. The entire time, predict the app's own UI — whatever Lesson 03's
   accelerometer label is currently showing — keeps updating normally,
   completely unaffected by whichever of the two outcomes above is
   currently playing out on the background thread.

### CS Lens

**Moving a blocking operation onto a separate thread so a framework's
own main loop stays responsive is a real, general pattern — recognized
across essentially every GUI and interactive system**: never blocking
a browser's own JavaScript main thread with slow synchronous work,
never blocking a desktop GUI toolkit's own event-dispatch thread with
network calls, a game engine reserving its own render thread strictly
for drawing while I/O happens elsewhere. The shared reasoning is
identical every time, including this lesson's own: the thread
responsible for keeping something visibly alive and responsive must
never be the same thread doing something that might take an
unpredictable, possibly unbounded amount of real time.

### SE Lens

**Why `daemon=True`, specifically?** A non-daemon thread genuinely
keeps the whole Python process alive until it finishes — meaning a
`connect()` call that hangs indefinitely (a real, possible outcome
with no device responding at all) would prevent this app from ever
fully exiting, even after the user closes it. Marking the thread a
daemon tells Python it's acceptable to end this thread abruptly the
moment the rest of the app is done, rather than waiting on it — the
right real choice for a background attempt whose result, if it never
arrives, this project has already decided not to wait on forever.

---

## Connect the Pieces

Step 1's own `threading.Thread`, proven on the desktop with nothing
but a `Label` and a `time.sleep`, is the identical mechanism the real
connection attempt runs on — only the work inside the thread changed,
from a harmless sleep to a real, genuinely blocking `socket.connect()`
call. Lesson 07's `devices` array, proven safe to index and loop over
already, supplies the one device this lesson actually tries to reach.
The `try`/`except` around it is this lesson's own honest
acknowledgment that, unlike every earlier lesson's hardware calls, a
real network-style connection has real, expected ways to fail — caught
here, rather than assumed away.

## What Breaks Without This

Call `socket.connect()` directly inside `list_bonded_devices`, with no
thread at all:

```python
def list_bonded_devices(self):
    # ...logging as before...
    socket = devices[0].createRfcommSocketToServiceRecord(service_uuid)
    socket.connect()   # <- wrong: blocking call, directly on the main thread
```

Predicted result: the exact same freeze Lesson 02's own "What Breaks
Without This" already demonstrated with a fake `sleep` loop — except
this time the freeze's real length isn't fixed at all; it lasts as
long as the real connection attempt itself takes, which could be
under a second, several real seconds, or effectively forever if
nothing ever answers. The accelerometer label stops updating, the
window stops responding to touch, for exactly that unpredictable
length of real time. Restore the background thread, and confirm for
yourself that the same connection attempt, run the identical way, no
longer freezes anything at all.

## Exercises

1. Deliberately connect to a device that's out of Bluetooth range (or
   simply not listening) and confirm, via real `logcat` output, both
   that the real exception gets caught and logged, and that the app's
   own UI never froze while waiting to find that out.
2. Remove `daemon=True` and, using a device you know won't accept the
   connection, close the app while the thread is still hanging.
   Observe, firsthand, whether the app process actually exits or not.
3. Log `threading.current_thread().name` from inside both
   `_connect_worker` and `update_label`, and confirm the two really do
   report different thread names — direct, real proof they're running
   on genuinely separate threads, not merely assumed to be.

## Definition of Done

- [ ] You ran Step 1 on the desktop and watched the label count
      smoothly for a full three real seconds while the background
      thread slept.
- [ ] You ran the real Step 2 code against a real, listening Bluetooth
      server and saw a real "connected" log line.
- [ ] You also ran it with nothing listening, and confirmed the real
      failure is caught and logged rather than freezing the app or
      crashing it.
- [ ] You can explain, without looking, why `socket.connect()`
      specifically has to run off the main thread, in terms of Lesson
      02's own event-loop explanation.
- [ ] You can state, in your own words, what `daemon=True` actually
      changes, and reproduced the real difference in Exercise 2.
- [ ] Commit: the updated `main.py`.

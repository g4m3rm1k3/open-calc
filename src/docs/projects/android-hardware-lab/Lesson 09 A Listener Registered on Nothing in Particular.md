# Lesson 09: A Listener Registered on Nothing in Particular

**What you will build:** real nearby Bluetooth devices, discovered and
logged by name and address. Lesson 08 got the adapter ready and on;
this lesson asks it to actually look for something. The transferable
problem: every listener this series has built so far — the clipboard
listener, the sensor listener — was registered directly on the one
object producing the events (`clipboard.addPrimaryClipChangedListener`,
`sensorManager.registerListener`). Discovery results don't work that
way. They arrive as a **broadcast** — a message sent out to the whole
system, not delivered to one specific object you're holding a
reference to — and receiving one needs a different kind of listener
entirely.

**What you need to know first:** Lesson 03 (listeners, the Observer
pattern), Lesson 07 and 08 in full (permissions, the adapter, enabling
Bluetooth).

**Terms introduced in this lesson:**
- **Broadcast** — a message the Android system (or another app) sends
  out generally, to any app that has expressed interest, rather than
  to one specific object. Unlike every listener so far, nothing about
  registering for a broadcast requires holding a reference to whatever
  produced it.
- **`BroadcastReceiver`** — the base class for code that reacts to
  broadcasts. Structurally a listener — the Observer pattern, Lesson
  03's term, reappearing — but registered with a `Context` and an
  `IntentFilter` describing *which* broadcasts to receive, not with
  the object that sends them.
- **`IntentFilter`** — a small object listing which broadcast(s) a
  `BroadcastReceiver` cares about, by action name (a `String`
  constant, the same shape as `Context.CLIPBOARD_SERVICE` or
  `Sensor.TYPE_LIGHT` — a name identifying one specific thing among
  many possible).
- **Exported receiver** — a `BroadcastReceiver` that Android allows to
  receive broadcasts sent by *other* apps or by privileged system
  components (Bluetooth's own stack is one), as opposed to only
  broadcasts this same app sent itself. Declared explicitly, per
  Mechanical Walkthrough below — Android has required this be stated
  outright, one way or the other, since Android 13.

**Objects and methods this lesson uses:**
- **`ContextCompat.registerReceiver(Context, BroadcastReceiver, IntentFilter, int)`**
  - *What it is:* the AndroidX-provided, version-safe way to register
    a `BroadcastReceiver`.
  - *Implementation:* a `static` method in AndroidX's `core` library —
    the same "Compat" naming pattern as Lesson 07's
    `ContextCompat.checkSelfPermission`, existing specifically to
    paper over a behavior difference between old and new Android
    versions.
  - *Its use:* registering this lesson's receiver so that it behaves
    correctly whether the app is running on an old or current Android
    version, without this lesson's own code needing to branch on
    `Build.VERSION.SDK_INT` itself.
- **`BluetoothDevice`**
  - *What it is:* one specific, real, nearby Bluetooth device that was
    found.
  - *Implementation:* handed to this lesson's receiver inside the
    broadcast `Intent`, extracted via `EXTRA_DEVICE`; exposes
    `getName()` and `getAddress()`, used below.
  - *Its use:* this lesson's actual payoff — the object identifying
    something Lesson 10 will eventually try to connect to.

---

## Concept Unit: Registered With a Description, Not a Reference

### The Problem

`bluetoothAdapter.startDiscovery()` returns almost immediately — a
`boolean` saying only whether the search *started*, per Android's own
documentation, not what it found. The actual devices show up
asynchronously, one at a time, over the following several seconds. But
there's no object here shaped like `clipboard` or `sensorManager` to
register a listener *on* — discovery isn't owned by one object; it's
the whole Bluetooth stack telling the whole system "found one," and
any app that's said it cares gets told.

### Introduce the Concept in Isolation — Step 1: A Board, Not a Phone Call

Scratch file, no Android:

```java
Map<String, List<Runnable>> broadcastBoard = new HashMap<>();

// "Register" for a specific kind of announcement, by name — not by
// holding a reference to whatever will eventually post one.
broadcastBoard.computeIfAbsent("DEVICE_FOUND", k -> new ArrayList<>())
        .add(() -> System.out.println("Got one!"));

// Something elsewhere "broadcasts" — it doesn't know or care who's listening.
for (Runnable r : broadcastBoard.getOrDefault("DEVICE_FOUND", List.of())) {
    r.run();
}
```

Run it. Expected output:

```
Got one!
```

The registering code never touched, called, or received a reference
to whatever eventually looped over `broadcastBoard` and ran the
callbacks — it only posted a name, "DEVICE_FOUND," into a shared
board. Compare this to Lesson 03's `clipboard.addPrimaryClipChangedListener(listener)`:
that call *needed* the `clipboard` object in hand. This one needed
only a string.

**Discard this scratch file.**

### Introduce the Concept in Isolation — Step 2: The Real Thing

**Reference Source:** no reference counterpart — `BroadcastReceiver`
registration, the discovery broadcast actions, and the
`RECEIVER_EXPORTED` requirement are Android platform facts, confirmed
against Android's current developer documentation and current
(Android 13/14) behavior-change documentation this session.

**Files affected:** `MainActivity.java` only.

**Change type:** add, inside `onCreate` (receiver setup) and
`onResume`/`onPause` (starting discovery, tied to focus — the same
pairing Lesson 05 already established, reused here rather than
re-derived).

**Location:** a new field for the receiver; new lines in `onCreate`
after Lesson 08's adapter setup; new lines in the existing
`onResume`/`onPause`.

**Dependencies:** Lesson 08's `bluetoothAdapter`, confirmed non-`null`
and enabled.

A new field, and the receiver itself:

```java
private final BroadcastReceiver deviceFoundReceiver = new BroadcastReceiver() { // <- new
    @Override                                                             // <- new
    public void onReceive(Context context, Intent intent) {               // <- new
        if (BluetoothDevice.ACTION_FOUND.equals(intent.getAction())) {    // <- new
            BluetoothDevice device;                                       // <- new
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {  // <- new
                device = intent.getParcelableExtra(                        // <- new
                        BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class); // <- new
            } else {                                                       // <- new
                device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE); // <- new
            }                                                              // <- new
            if (device != null) {                                         // <- new
                Log.d("BtDiscovery", "Found: " + device.getName()          // <- new
                        + " (" + device.getAddress() + ")");               // <- new
            }                                                              // <- new
        }                                                                  // <- new
    }                                                                      // <- new
};                                                                          // <- new
```

Registered in `onCreate`, after Lesson 08's adapter setup:

```java
IntentFilter discoveryFilter = new IntentFilter(BluetoothDevice.ACTION_FOUND); // <- new
ContextCompat.registerReceiver(                                            // <- new
        this, deviceFoundReceiver, discoveryFilter,                        // <- new
        ContextCompat.RECEIVER_EXPORTED);                                  // <- new
```

Discovery itself starts and stops with focus — the exact
`onResume`/`onPause` pairing Lesson 05 already built for the sensors,
one more pair of calls added to each, not a new pattern:

```java
@Override
protected void onResume() {
    super.onResume();
    if (lightSensor != null) {
        sensorManager.registerListener(
                sensorListener, lightSensor, SensorManager.SENSOR_DELAY_NORMAL);
        Log.d("SensorSetup", "Registered light sensor listener");
    }
    if (accelerometer != null) {
        sensorManager.registerListener(
                sensorListener, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
        Log.d("SensorSetup", "Registered accelerometer listener");
    }
    if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {        // <- new
        bluetoothAdapter.startDiscovery();                                 // <- new
        Log.d("BtDiscovery", "Discovery started");                        // <- new
    }                                                                      // <- new
}

@Override
protected void onPause() {
    super.onPause();
    if (sensorManager != null) {
        sensorManager.unregisterListener(sensorListener);
    }
    Log.d("SensorSetup", "Unregistered sensor listener");
    if (bluetoothAdapter != null && bluetoothAdapter.isDiscovering()) {    // <- new
        bluetoothAdapter.cancelDiscovery();                                // <- new
        Log.d("BtDiscovery", "Discovery cancelled");                      // <- new
    }                                                                      // <- new
}
```

### Mechanical Walkthrough

- `new BroadcastReceiver() { ... }` — **first appearance**, full
  treatment above. An anonymous class — Lesson 03's term, reappearing
  — same as every listener this series has built so far.
- `onReceive(Context context, Intent intent)` — **first appearance.**
  `BroadcastReceiver`'s one required method — every broadcast this
  receiver is registered for arrives here, as an `Intent`, the same
  `Intent` type Lesson 03 first introduced.
- `BluetoothDevice.ACTION_FOUND.equals(intent.getAction())` —
  **first appearance of the pattern, `Intent` reappearing.** One
  `IntentFilter` can technically list more than one action; checking
  which one actually arrived, inside `onReceive`, is what makes it
  safe to register for several kinds of broadcast on the same
  receiver later without them being confused for each other — not
  needed with only one action registered here, but the reason the
  `if` exists at all rather than assuming.
- `Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU` — **first
  appearance of any API-level check in this series.** `SDK_INT` is the
  real, running device's Android version, as an `int`;
  `Build.VERSION_CODES.TIRAMISU` is a named constant for API level 33,
  more readable than the bare number. Needed here because
  `getParcelableExtra(String, Class)` — the safer, type-checked
  overload — does not exist at all on API levels below 33; calling it
  on an older device would fail to even compile against, let alone
  run correctly on, that device.
- `intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice.class)` —
  **first appearance (API 33+ branch).** The `Class` argument lets the
  method check, at runtime, that what's actually inside the `Intent`
  really is a `BluetoothDevice`, instead of trusting a cast.
- `intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)` — **first
  appearance (pre-33 branch).** The older, single-argument overload —
  functionally the same result on an older device, without the
  runtime type check the newer overload adds.
- `device.getName()`, `device.getAddress()` — **first appearance**,
  full treatment above (Objects and methods).
- `IntentFilter(BluetoothDevice.ACTION_FOUND)` — **first appearance**,
  full treatment above (Terms).
- `ContextCompat.registerReceiver(this, deviceFoundReceiver, discoveryFilter, ContextCompat.RECEIVER_EXPORTED)` —
  **first appearance**, full treatment above. `RECEIVER_EXPORTED`
  specifically — not `RECEIVER_NOT_EXPORTED` — because `ACTION_FOUND`
  is broadcast by Android's own Bluetooth stack, a privileged system
  component outside this app entirely; `RECEIVER_NOT_EXPORTED` would
  block exactly the broadcast this lesson exists to receive.
- `bluetoothAdapter.startDiscovery()` — **first appearance.** Returns
  `boolean` (not checked here, though Exercise 1 asks you to check
  it), takes about 12 seconds per Android's own documentation, and
  triggers zero or more later `ACTION_FOUND` broadcasts — this line
  does not, itself, deliver any device.
- `bluetoothAdapter.isDiscovering()`, `.cancelDiscovery()` — **first
  appearance.** The same existence-then-action shape Lesson 08's
  `isEnabled()` check already established — confirm a scan is actually
  running before cancelling one, rather than assuming.

### Execution Trace

**Same honesty note as every hardware lesson so far:** predicted
output, verified against Android's current documentation, not a real
captured run.

1. `onCreate` runs. The receiver is registered — no broadcasts
   received yet, nothing about registering triggers a scan.
2. The Activity gains focus. `onResume` runs Lesson 05's sensor
   registration, unchanged, then this lesson's new
   `startDiscovery()`. Predicted log: `"Discovery started"`.
3. Over roughly the next 12 seconds, each nearby, discoverable
   Bluetooth device triggers its own separate `ACTION_FOUND`
   broadcast. Predict one `Log.d` line per device, e.g.: `"Found: Mike's
   Headphones (AA:BB:CC:11:22:33)"` — a real MAC address, real device
   name, once per device actually found, not once total.
4. The user presses Home. `onPause` runs. Predict
   `bluetoothAdapter.isDiscovering()` returns `true` if the 12-second
   window hasn't finished yet, so `cancelDiscovery()` runs and logs
   `"Discovery cancelled"` — or `false`, if discovery had already
   finished naturally, in which case nothing further happens here.
5. Reopening the app repeats step 2 — a fresh discovery, following the
   same on/off-tied-to-focus shape Lesson 05 already proved, applied
   here to a second, unrelated kind of hardware.

### CS Lens

**A broadcast is the publish-subscribe pattern** — Lesson 03's
Observer pattern, generalized one step further: Observer ties
listeners directly to the one subject producing events; publish-
subscribe adds a layer of indirection (a named channel — here, the
action string `ACTION_FOUND`) so publishers and subscribers never need
a reference to each other at all, only agreement on the channel's
name. Also recognized in: message queues like Kafka or RabbitMQ (a
topic name in place of a direct method call), JavaScript's own
`window.dispatchEvent`/`addEventListener`, a newsletter (subscribers
never call the publisher; the publisher doesn't hold subscriber
references either, only a mailing list keyed by nothing more specific
than "wants this newsletter").

### SE Lens

**Why does Android require `RECEIVER_EXPORTED`/`RECEIVER_NOT_EXPORTED`
to be stated explicitly at all, starting with Android 13?** Before
this requirement existed, a `BroadcastReceiver` registered at runtime
was exported by default — any other app on the device could send it a
crafted `Intent` claiming to be `ACTION_FOUND`, and this receiver had
no way to tell a forged broadcast from a real one without adding its
own defensive checks. Forcing every registration to state its
intention outright — "yes, other apps/the system may send me this" or
"no, only my own app" — moved a real security decision that used to be
an invisible default into something every developer has to actively
choose. The cost: exactly this lesson's own new atom, an API-level
branch that didn't exist in this series before Bluetooth needed it.

---

## Connect the Pieces

`startDiscovery()`, called from `onResume` alongside Lesson 05's
already-established sensor registration, kicks off a search whose
results arrive nowhere near the call site — instead, through a
`BroadcastReceiver` registered ahead of time with only a channel name
(`ACTION_FOUND`), not a reference to the Bluetooth stack itself,
exactly as Step 1's bare `Map` proved was possible before any real
Android API was involved. `RECEIVER_EXPORTED` says this app is willing
to hear from a privileged system source; the API-level branch inside
`onReceive` is the one piece of code needed only because Android's own
type-safety improvements arrived after this project's minimum
supported version did.

## What Breaks Without This

Register the receiver with `RECEIVER_NOT_EXPORTED` instead of
`RECEIVER_EXPORTED`:

```java
ContextCompat.registerReceiver(
        this, deviceFoundReceiver, discoveryFilter,
        ContextCompat.RECEIVER_NOT_EXPORTED); // <- wrong for this broadcast's source
```

Run it, start discovery near another real Bluetooth device. Predicted
result: no crash, no exception — `startDiscovery()` still returns
`true`, the scan still genuinely happens at the hardware level — but
`onReceive` never runs, and no `"Found: ..."` lines ever appear,
because Android silently withholds an exported system broadcast from
a receiver that declared itself unwilling to receive one. Silent,
wrong-by-omission behavior, not a crash — worth confirming for
yourself, then restoring `RECEIVER_EXPORTED`.

## Exercises

1. Check `startDiscovery()`'s own returned `boolean` and log it.
   Trigger a `false` on purpose by calling it twice in a row, back to
   back, without a real gap — confirm for yourself what Android
   actually does when discovery is requested while already running.
2. Add a `HashSet<String>` field tracking MAC addresses already
   logged, and skip logging a device whose address has already been
   seen this session. Real discovery frequently reports the same
   nearby device more than once within one 12-second window; confirm
   this for yourself before adding the check, then again after.
3. Comment out the entire API-level `if`/`else` branch and replace it
   with only the newer `getParcelableExtra(String, Class)` call. If
   your project's `minSdkVersion` (in `build.gradle`) is below 33,
   predict what happens when this runs on an emulator set to an older
   API level, then confirm it for yourself and restore the branch.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw a callback run with no
      reference ever passed to whatever triggered it.
- [ ] You ran the real Step 2 code near at least one other real
      Bluetooth device (a phone, headphones, anything discoverable)
      and saw a real `"Found: ..."` log line with a real name and MAC
      address.
- [ ] You can explain, without looking, why this lesson's receiver
      needed `RECEIVER_EXPORTED` specifically, not
      `RECEIVER_NOT_EXPORTED`.
- [ ] You can explain why `onReceive` checks `intent.getAction()`
      before extracting a device, even with only one action currently
      registered.
- [ ] You broke it with `RECEIVER_NOT_EXPORTED` on purpose, confirmed
      the silent (not crashing) failure, and restored the correct flag.
- [ ] You can state, in your own words, how this lesson's
      publish-subscribe shape differs from Lesson 03's direct listener
      registration.
- [ ] Commit: the receiver, registration, and discovery start/stop
      code in `MainActivity.java`.

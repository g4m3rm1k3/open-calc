# Lesson 10: A Two-Way Pipe to One Specific Device

**What you will build:** a real, two-way byte connection to one
already-paired Bluetooth device — a message sent, a response read
back. This is the lesson every prior Bluetooth lesson in this series
has been building toward: Lesson 07 opened the permission gate,
Lesson 08 got the adapter on, Lesson 09 found devices nearby. None of
those three moved a single byte of your own data anywhere. This one
does, and it introduces the one thing this entire series has managed
to avoid needing until now: a second thread.

**What you need to know first:** Lessons 07, 08, and 09 in full.
Ordinary Java `try`/`catch`, lambdas (Lesson 03).

**Terms introduced in this lesson:**
- **Bonded (paired) device** — a device the user has already gone
  through Android's own Bluetooth pairing process with, once, via
  system settings — distinct from a merely *discovered* device
  (Lesson 09), which the OS has only seen advertise itself nearby.
  Reliable two-way data connections are made to bonded devices; this
  lesson assumes the target device is already paired, not just found.
- **Socket** — a live, two-way, open connection between two devices,
  once established. Not a broadcast (Lesson 09), not a one-shot
  request — a standing pipe that both sides can write to and read
  from until either side closes it.
- **Blocking call** — a method call that does not return until its
  work is fully done, however long that takes. `BluetoothSocket.connect()`,
  used below, is one — it can take real seconds, and the calling code
  simply waits, frozen, for the entire duration.
- **Thread** — a second, independent sequence of execution running
  alongside the app's main one. Everything in this series so far has
  run on the single, default **main thread** — the same thread that
  draws the screen and responds to taps. A blocking call running there
  would freeze the entire UI for however long it blocks.

**Objects and methods this lesson uses:**
- **`BluetoothAdapter.getBondedDevices()`**
  - *What it is:* the set of devices already paired with this phone,
    independent of whether any of them are nearby or discoverable
    right now.
  - *Implementation:* returns `Set<BluetoothDevice>` — the same
    `BluetoothDevice` type Lesson 09 already extracted from a
    discovery broadcast.
  - *Its use:* this lesson's starting point — picking one already-known
    device to open a connection to, rather than depending on a fresh
    discovery broadcast arriving first.
- **`BluetoothDevice.createRfcommSocketToServiceRecord(UUID)`**
  - *What it is:* prepares (but does not yet open) a socket to one
    specific device, for one specific *kind* of Bluetooth service.
  - *Implementation:* takes a `UUID` identifying the service; returns
    a `BluetoothSocket`. Both sides of a connection must agree on the
    same UUID — this lesson uses the standard, publicly registered
    Serial Port Profile UUID, `00001101-0000-1000-8000-00805F9B34FB`,
    the conventional choice for a simple, generic two-way byte stream
    with a non-phone device (an Arduino, a Raspberry Pi running a
    matching Bluetooth server).
  - *Its use:* the first step toward a real connection, in Step 2
    below.
- **`BluetoothSocket.connect()`**
  - *What it is:* actually opens the connection prepared above.
  - *Implementation:* a **blocking call**, per Terms — Android's own
    documentation states it can take on the order of 12 seconds before
    giving up and throwing `IOException`.
  - *Its use:* the exact call this lesson's new Thread exists to run
    off of the main thread.
- **`Thread`**
  - *What it is:* Java's own built-in class for running code on a
    second thread.
  - *Implementation:* constructed with a `Runnable` (a lambda, per
    Lesson 03, satisfies this); `.start()` begins running it
    concurrently; the calling code continues immediately, without
    waiting.
  - *Its use:* wraps this lesson's entire connect-write-read sequence,
    so none of it can freeze the main thread.
- **`InputStream` / `OutputStream`**
  - *What they are:* Java's standard, generic two-way byte-pipe types
    — not Bluetooth-specific at all.
  - *Implementation:* obtained via `socket.getInputStream()` /
    `socket.getOutputStream()`; `OutputStream.write(byte[])` sends
    bytes, `InputStream.read(byte[])` blocks until at least one byte
    arrives and returns how many bytes were actually read.
  - *Its use:* the actual data transfer, once the socket itself is
    open.

---

## Concept Unit: A Call That Waits, Run Somewhere That Isn't the Screen

### The Problem

Every call this series has made so far — `getSystemService`,
`registerListener`, even `startDiscovery()` — returns quickly, doing
its real work later, asynchronously, through a callback. `connect()`
is different in kind: it does its real work *during* the call itself,
and does not return until that work finishes, one way or another. Call
it directly from `onCreate`, and the entire app — every pixel, every
touch — freezes for however long the real Bluetooth handshake with
another device actually takes.

### Introduce the Concept in Isolation — Step 1: A Slow Call, Felt Directly

Scratch file, no Android, no Bluetooth:

```java
System.out.println("Before");
try {
    Thread.sleep(3000); // stands in for any slow, blocking call
} catch (InterruptedException e) {
    throw new RuntimeException(e);
}
System.out.println("After");
```

Run it. Expected output: `"Before"` prints immediately, then a real,
felt three-second pause — nothing else this program could do during
that time — then `"After"`. `Thread.sleep` isn't Bluetooth, isn't
Android, isn't even I/O — it's the simplest possible way to make a
call that blocks for a real, measurable amount of time, on purpose,
so the *feeling* of a blocking call is unmistakable before a real
socket is involved at all.

**Discard this scratch file.**

### Introduce the Concept in Isolation — Step 2: The Same Slow Call, Moved Off to the Side

New scratch file:

```java
System.out.println("Before");
new Thread(() -> {
    try {
        Thread.sleep(3000);
    } catch (InterruptedException e) {
        throw new RuntimeException(e);
    }
    System.out.println("Finished on a second thread");
}).start();
System.out.println("After — printed immediately, not 3 seconds later");
```

Run it. Expected output: `"Before"`, then `"After — printed
immediately, not 3 seconds later"` — genuinely immediately, with no
pause — and only *then*, roughly three seconds later, `"Finished on a
second thread"`. The exact same three-second delay still happens
somewhere — moving it onto a `Thread` doesn't make it faster — but it
no longer blocks whatever called it. This is the entire fix Step 3
applies to the real `connect()` call.

**Discard this scratch file too.**

### Introduce the Concept in Isolation — Step 3: The Real Thing

**Reference Source:** no reference counterpart — the socket API, the
SPP UUID, and the recommendation to run `connect()` off the main
thread are Android platform facts, confirmed against Android's current
developer documentation this session.

**Files affected:** `MainActivity.java` only.

**Change type:** add, inside `onCreate`, after Lesson 08's adapter
setup. Not tied to `onResume`/`onPause` — the SE Lens below explains
why this lesson deliberately breaks from the pattern Lesson 05 and
Lesson 09 both followed.

**Location:** a new `UUID` constant near the top of the class; new
lines at the end of `onCreate`.

**Dependencies:** a real, already-paired Bluetooth device for this to
connect to anything — see Exercises for what happens with none paired.

```java
private static final UUID SPP_UUID =                                    // <- new
        UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");        // <- new
```

At the end of `onCreate`, after the adapter and discovery setup from
Lessons 08 and 09:

```java
if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {                     // <- new
    Set<BluetoothDevice> bondedDevices = bluetoothAdapter.getBondedDevices();       // <- new
    if (bondedDevices.isEmpty()) {                                                  // <- new
        Log.d("BtSocket", "No paired devices — pair one in system Bluetooth settings first"); // <- new
    } else {                                                                        // <- new
        BluetoothDevice target = bondedDevices.iterator().next();                   // <- new
        Log.d("BtSocket", "Connecting to " + target.getName());                     // <- new

        new Thread(() -> {                                                          // <- new
            bluetoothAdapter.cancelDiscovery();                                     // <- new
            try (BluetoothSocket socket =                                           // <- new
                         target.createRfcommSocketToServiceRecord(SPP_UUID)) {      // <- new
                socket.connect();                                                    // <- new
                Log.d("BtSocket", "Connected");                                     // <- new

                OutputStream out = socket.getOutputStream();                        // <- new
                out.write("Hello from Android\n".getBytes());                       // <- new

                InputStream in = socket.getInputStream();                           // <- new
                byte[] buffer = new byte[1024];                                     // <- new
                int bytesRead = in.read(buffer);                                     // <- new
                String response = new String(buffer, 0, bytesRead);                 // <- new
                Log.d("BtSocket", "Received: " + response);                         // <- new

            } catch (IOException e) {                                              // <- new
                Log.d("BtSocket", "Connection failed: " + e.getMessage());          // <- new
            }                                                                       // <- new
        }).start();                                                                 // <- new
    }                                                                               // <- new
}                                                                                    // <- new
```

### Mechanical Walkthrough

- `UUID.fromString("00001101-...")` — **first appearance.** `UUID` is
  ordinary Java (`java.util.UUID`), not Android-specific; this
  particular value is the standard, publicly registered constant for
  Serial Port Profile, per Objects and methods above — not something
  this project invented.
- `bluetoothAdapter.getBondedDevices()` — **first appearance**, full
  treatment above.
- `bondedDevices.isEmpty()`, `.iterator().next()` — **reappearing
  `Set` methods, already ordinary Java by this point in the series.**
  `.iterator().next()` grabs one arbitrary element — real production
  code would instead search by name or address for one specific
  device; grabbing the first is this lesson's deliberate
  simplification, named honestly rather than hidden.
- `new Thread(() -> {...}).start()` — **first appearance**, full
  treatment above. The lambda here is a `Runnable` — Lesson 03's
  functional-interface term, reappearing, satisfied by a
  zero-argument, `void`-returning lambda body, the same shape
  `Thread`'s constructor has always accepted.
- `bluetoothAdapter.cancelDiscovery()` — **reappearing from Lesson 09,
  brief reminder only, new reason for calling it.** Lesson 09 called
  this to stop an active scan on `onPause`; here it's called
  defensively, unconditionally, right before connecting, because
  Android's own guidance states discovery — running or not — measurably
  slows down a connection attempt.
- `try (BluetoothSocket socket = ...) { ... }` — **first appearance of
  try-with-resources in this series.** A `BluetoothSocket` is
  `Closeable`; this syntax guarantees `socket.close()` runs
  automatically once the block ends, success or failure alike —
  covered fully in What Breaks Without This, below.
- `target.createRfcommSocketToServiceRecord(SPP_UUID)` — **first
  appearance**, full treatment above.
- `socket.connect()` — **first appearance**, full treatment above
  (Terms and Objects).
- `socket.getOutputStream()`, `out.write(...)` — **first appearance**,
  full treatment above. `"Hello from Android\n".getBytes()` converts a
  Java `String` into the raw `byte[]` any `OutputStream` actually
  transmits — text is never sent directly, only bytes, a fact Java
  strings normally hide.
- `socket.getInputStream()`, `in.read(buffer)` — **first appearance**,
  full treatment above. `read` is itself a second blocking call —
  already safely inside this lesson's background `Thread`, not the
  main one — and returns the *count* of bytes actually placed into
  `buffer`, which is why that count, not `buffer.length`, is used to
  build the resulting `String`.
- `new String(buffer, 0, bytesRead)` — **first appearance of this
  constructor overload.** Builds a `String` from only the first
  `bytesRead` bytes of `buffer` — using the full array here would
  include leftover, meaningless bytes from previous reads or the
  buffer's initial zeroed state.
- `catch (IOException e)` — **reappearing exception-handling shape,
  already established since Lesson 01's `ClassCastException` example;
  new exception type.** `IOException` is what every method in this
  block can throw — a failed connection, a device that disconnects
  mid-read — covered generically here rather than per-method.

### Execution Trace

**Same honesty note as every hardware lesson in this series:**
predicted output, verified against Android's current documentation,
not a real captured run.

1. `onCreate` runs. Bonded devices are checked. Predict, for a phone
   with at least one previously-paired device: `"Connecting to
   <real device name>"` logs immediately, on the main thread.
2. `new Thread(...).start()` returns immediately — predict `onCreate`
   finishes and the UI is fully interactive well before the
   connection attempt itself resolves, exactly as Step 2 proved.
3. On the new thread: `cancelDiscovery()` runs, then `connect()`
   blocks — predict this thread, and only this thread, pauses here,
   anywhere from under a second to several seconds, depending on real
   Bluetooth conditions.
4. Success case: predict `"Connected"`, then `"Received: <whatever the
   other device sent back>"` — the exact response text depends
   entirely on what's listening on the other end, which this lesson's
   code has no control over.
5. Failure case (device out of range, other side not listening on this
   UUID, etc.): predict `connect()` throws `IOException` after roughly
   12 seconds, caught by this block's own `catch`, logging
   `"Connection failed: ..."` — no crash, and critically, per the
   `try`-with-resources syntax, `socket.close()` still runs even
   though `connect()` itself failed.

### CS Lens

**Concurrency — running more than one sequence of instructions "at
once"** — is the actual, formal name for what `Thread` does here.
Also recognized in: a web server handling many requests
simultaneously instead of one at a time; a video game's render loop
running independently of its physics or audio loop; any GUI
application, on any platform, keeping its interface responsive while
a file loads or a network request completes in the background —
exactly this lesson's own motivating problem, general to every kind
of application with a screen, not unique to Android or to Bluetooth.

### SE Lens

**Why does this lesson break the `onResume`/`onPause` pairing Lesson
05 and Lesson 09 both established, instead of reusing it a third
time?** A sensor listener and a discovery scan are both cheap to
start and stop repeatedly — registering again on every `onResume` costs
almost nothing. A socket connection is not: opening one is the
expensive, multi-second operation this entire lesson exists to handle
carefully, and tearing it down and reopening it every time the user
glances at a notification and returns would be wasteful and slow in a
way the earlier pattern was never designed to absorb. The real
tradeoff this lesson leaves open, on purpose, as a boundary rather
than a flaw: a connection opened once in `onCreate` and never reopened
also never recovers automatically if it drops — production code needs
real reconnection logic this lesson doesn't attempt, precisely because
grafting it on here would hide the lifecycle-pairing lesson under a
second, unrelated one.

---

## Connect the Pieces

`getBondedDevices()` picks one already-known device — deliberately not
depending on Lesson 09's discovery broadcast having fired recently.
`createRfcommSocketToServiceRecord`, using the standard SPP `UUID`
both sides must agree on, prepares a socket; `connect()` — a genuine
blocking call, proven costly in Step 1 before any Android API was
involved — actually opens it, safely off the main thread inside a
`Thread` built the same way Step 2 proved keeps the UI responsive
regardless of how long the real handshake takes. Once open,
`OutputStream`/`InputStream` — ordinary Java, nothing Bluetooth-specific
about either type itself — move real bytes in both directions, and
try-with-resources guarantees the socket closes no matter how the
block actually ends.

## What Breaks Without This

Remove `try`-with-resources and call `connect()` directly, letting an
exception skip past any cleanup:

```java
BluetoothSocket socket = target.createRfcommSocketToServiceRecord(SPP_UUID); // <- no try-with-resources
socket.connect(); // <- if this throws, socket.close() never runs
```

Force a failure — attempt this against a device that's paired but
currently powered off or out of range. Predicted result: `connect()`
throws `IOException` as expected, but because nothing closes `socket`
on the way out, the underlying native Bluetooth resource stays
allocated. One or two leaked sockets rarely matter; a real app that
retries a failed connection in a loop, leaking one socket per attempt,
will eventually exhaust a real, limited OS resource and start failing
in ways that have nothing to do with Bluetooth itself. Restore
try-with-resources when done.

## Exercises

1. With zero devices paired, run this lesson's real code and confirm
   the `"No paired devices..."` branch — the one Definition of Done
   below asks you to have actually seen, not just read about.
2. Change `bondedDevices.iterator().next()` to search for a specific
   device by `target.getName().contains("...")`, matching a real
   device name from your own paired list. Confirm this connects to
   the one you intended, not merely "whichever one happened to be
   returned first."
3. Comment out `bluetoothAdapter.cancelDiscovery()` and start a
   discovery scan (reuse Lesson 09's own trigger) immediately before
   this lesson's connection attempt runs. Time roughly how long
   `connect()` takes with discovery actively running versus without
   it, and compare the two — Android's own documentation claims a
   real difference; confirm it for yourself rather than trusting the
   claim blindly.

## Definition of Done

- [ ] You ran Step 1 and felt the real three-second freeze yourself,
      with nothing else able to run during it.
- [ ] You ran Step 2 and confirmed the immediate `"After"` line,
      proving the same delay no longer blocks the caller once moved
      onto a `Thread`.
- [ ] You ran the real Step 3 code against at least one real paired
      device and saw either a real `"Connected"`/`"Received: ..."`
      pair or a real, non-crashing `"Connection failed: ..."` — and
      recorded whichever actually happened, replacing this file's
      predictions.
- [ ] You saw the `"No paired devices"` branch at least once, with
      Bluetooth pairings temporarily removed or on a fresh
      environment.
- [ ] You can explain, without looking, why `connect()` specifically
      — and not `getBondedDevices()` or `createRfcommSocketToServiceRecord`
      — is the one call in this lesson that had to move off the main
      thread.
- [ ] You can explain what try-with-resources guarantees, and why a
      failed `connect()` still needs `close()` to run.
- [ ] You can state, in your own words, why this lesson didn't reuse
      the `onResume`/`onPause` pairing from Lessons 05 and 09.
- [ ] Commit: the socket connection code in `MainActivity.java`. This
      closes out the Bluetooth arc — Lesson 07 through here.

# Lesson 11: The Other Half of a Connection

**What you will build:** the half of a Bluetooth connection Lesson 10
never touched — listening for an incoming connection, instead of
reaching out to make one. With only Lesson 10's code, two phones both
running this app would each try to *call*, and neither would ever
*answer* — this lesson is the answering half. With both lessons
present in the same app, two phones can genuinely reach each other.

**What you need to know first:** Lesson 10 in full. This lesson
reuses its central idea — a blocking call needs to run off the main
thread — without re-proving it; if that's shaky, Lesson 10's Steps 1
and 2 are where it was actually built and proven, not here.

**Terms introduced in this lesson:**
- **Server socket** — an object that doesn't represent a connection
  itself, only the *act of waiting* for one. A `BluetoothServerSocket`
  never sends or receives a single byte of your data; its only job is
  producing a real, connected `BluetoothSocket` — Lesson 10's type —
  once some other device successfully connects to it.
- **Accept** — the specific act of a listening side agreeing to a
  connection a client side initiated. `connect()` (Lesson 10) is the
  client half of that handshake; `accept()`, this lesson's subject, is
  the server half.

**Objects and methods this lesson uses:**
- **`BluetoothAdapter.listenUsingRfcommWithServiceRecord(String, UUID)`**
  - *What it is:* starts advertising this device as willing to accept
    a connection for one specific service.
  - *Implementation:* the `String` is an arbitrary, human-readable
    service name (used for the system's internal service-discovery
    record, not shown to the user in this lesson); the `UUID` must be
    the *same* value the connecting side uses — this project reuses
    Lesson 10's own `SPP_UUID` constant, unchanged. Returns a
    `BluetoothServerSocket`.
  - *Its use:* the first line of this lesson's real code — opens the
    listening state itself.
- **`BluetoothServerSocket.accept()`**
  - *What it is:* waits for exactly one incoming connection.
  - *Implementation:* a **blocking call** — Lesson 10's term,
    reappearing — that returns a real, connected `BluetoothSocket`
    once some other device connects, or throws `IOException` if
    listening is cancelled or fails.
  - *Its use:* this lesson's own central call, run off the main thread
    for the exact reason Lesson 10 already proved in isolation.
- **`BluetoothServerSocket.close()`**
  - *What it is:* stops listening.
  - *Implementation:* per Android's own documentation, RFCOMM allows
    only one connected client per channel at a time — once a
    connection is accepted, there's nothing further for the *server*
    socket itself to do, so closing it immediately after a successful
    `accept()` is the documented, normal pattern, not an optional
    cleanup step.
  - *Its use:* called right after `accept()` succeeds, in this
    lesson's real code below.

---

## Concept Unit: Waiting Is Not the Same Problem as Calling, But It's the Same Fix

### The Problem

Lesson 10 proved, with `Thread.sleep`, that a blocking call left on
the main thread freezes the whole app — and fixed it by moving
`connect()` onto a `Thread`. `accept()` is a *second*, different
blocking call, with the same real consequence: it can wait
indefinitely, however long it takes for another device to actually
connect, and calling it directly from `onCreate` would freeze the app
just as completely as an unguarded `connect()` did. This lesson does
not re-isolate that fix — Lesson 10's Steps 1 and 2 already built and
proved it, with `Thread.sleep` standing in for exactly this kind of
call — it applies the same, already-proven fix to a new call.

### The Real Thing

**Reference Source:** no reference counterpart — `BluetoothServerSocket`,
`listenUsingRfcommWithServiceRecord`, and `accept()` are Android
platform facts, confirmed against Android's current developer
documentation this session, including its own verbatim `AcceptThread`
example.

**Files affected:** `MainActivity.java` only.

**Change type:** add, alongside Lesson 10's connection-attempt code —
not replacing it. Both run.

**Location:** new code at the end of `onCreate`, after Lesson 10's
block; reuses Lesson 10's `SPP_UUID` field unchanged.

**Dependencies:** Lesson 10's `SPP_UUID` constant, `bluetoothAdapter`.

```java
if (bluetoothAdapter != null && bluetoothAdapter.isEnabled()) {              // <- new
    new Thread(() -> {                                                       // <- new
        BluetoothServerSocket serverSocket = null;                           // <- new
        try {                                                                // <- new
            serverSocket = bluetoothAdapter.listenUsingRfcommWithServiceRecord( // <- new
                    "MainApp", SPP_UUID);                                    // <- new
            Log.d("BtSocket", "Listening for an incoming connection");       // <- new

            BluetoothSocket socket = serverSocket.accept();                   // <- new
            Log.d("BtSocket", "Accepted a connection");                      // <- new
            serverSocket.close();                                            // <- new

            InputStream in = socket.getInputStream();                        // <- new
            byte[] buffer = new byte[1024];                                  // <- new
            int bytesRead = in.read(buffer);                                  // <- new
            String received = new String(buffer, 0, bytesRead);              // <- new
            Log.d("BtSocket", "Received: " + received);                     // <- new

            OutputStream out = socket.getOutputStream();                     // <- new
            out.write("Hello back from Android\n".getBytes());               // <- new

        } catch (IOException e) {                                            // <- new
            Log.d("BtSocket", "Listening failed: " + e.getMessage());        // <- new
        }                                                                     // <- new
    }).start();                                                              // <- new
}                                                                              // <- new
```

### Mechanical Walkthrough

- `bluetoothAdapter.listenUsingRfcommWithServiceRecord("MainApp", SPP_UUID)` —
  **first appearance**, full treatment above. Reuses `SPP_UUID` — the
  exact same field Lesson 10 declared — because both sides of one
  connection must agree on it; a mismatched UUID here would mean this
  listener never matches the other phone's `connect()` attempt at all.
- `BluetoothServerSocket serverSocket` — **first appearance**, full
  treatment above.
- `serverSocket.accept()` — **first appearance**, full treatment
  above. Notice what this call does *not* need: no target device, no
  address, nothing identifying who might connect — unlike Lesson 10's
  `createRfcommSocketToServiceRecord(SPP_UUID)`, which needed a
  specific `BluetoothDevice` to reach *toward*, this call simply waits
  for whoever arrives.
- `serverSocket.close()` — **first appearance**, full treatment above.
  Called immediately after a successful `accept()`, per Android's own
  documented reasoning — not a generic "clean up when you're done"
  reflex, a specific consequence of RFCOMM allowing only one connected
  client per channel.
- `socket.getInputStream()`, `in.read(buffer)`, `new String(buffer, 0, bytesRead)`,
  `socket.getOutputStream()`, `out.write(...)` — **all reappearing from
  Lesson 10, brief reminder only.** Identical calls, identical shapes
  — the only thing that changed is which side of the handshake
  produced `socket` in the first place.
- `new Thread(() -> {...}).start()` — **reappearing from Lesson 10, no
  new treatment owed** — the exact fix Lesson 10 already proved,
  applied here to `accept()` instead of `connect()`.
- `catch (IOException e)` — **reappearing exception type, already
  established.**

### Execution Trace

**Same honesty note as every lesson in this arc:** predicted output,
verified against Android's real, current documentation (including its
own verbatim code sample), not a captured run.

1. `onCreate` runs. Lesson 10's connection-attempt thread starts.
   This lesson's listening thread also starts, independently, on its
   own `Thread`. Neither blocks the other or the main thread.
2. This lesson's thread calls `listenUsingRfcommWithServiceRecord`,
   predicted to return quickly, then blocks on `accept()` — predict
   this can wait indefinitely, with no 12-second timeout the way
   `connect()` had one.
3. **On a second phone**, running this same app, Lesson 10's thread
   attempts `connect()` to the first phone (assuming the two are
   already paired with each other). Predict the first phone's blocked
   `accept()` call returns at roughly this moment, producing a real,
   connected `BluetoothSocket`.
4. Predict, on the accepting (first) phone: `"Accepted a connection"`,
   then `"Received: Hello from Android"` — Lesson 10's own hardcoded
   message, arriving here as the *received* side of the exact
   `out.write(...)` call Lesson 10's code performs.
5. Predict, back on the connecting (second) phone, Lesson 10's own
   `in.read(buffer)` call — which had been waiting since Lesson 10's
   own `"Connected"` log line — now returns too, logging `"Received:
   Hello back from Android"`, this lesson's own reply.

### CS Lens

**Client and server are roles, not properties of a device or a piece
of hardware.** The same physical phone, the same Bluetooth radio,
plays the server role in this lesson (`accept()`, waiting) and the
client role in Lesson 10 (`connect()`, initiating) — both, in the same
app, at the same time, on two different threads. This exact
asymmetry — one side waits and answers, the other side initiates and
asks — is the same shape underlying HTTP (a web server `accept()`s;
a browser `connect()`s), and underlying every socket-based protocol
built on TCP or, here, RFCOMM.

### SE Lens

**With both lessons' code present, which phone ends up as the
"caller" and which as the "listener"?** Honestly: it isn't fully
controlled. Both phones run identical code, so both simultaneously
attempt to listen *and* attempt to connect. In practice, one phone's
`connect()` typically reaches the other's `accept()` first, and that
pairing wins — but a real production chat app doesn't leave this to
chance the way this lesson does. The real fix — letting a person
choose, from a list of paired devices, which specific connection to
initiate, rather than every device blindly dialing every bonded
device it can reach — needs real UI, which this series hasn't built
yet and this lesson doesn't attempt. Worth stating outright as this
lesson's own honest limitation, not silently papered over: this gets
two phones talking, but "which one calls" is not yet a decision your
code makes on purpose.

---

## Connect the Pieces

Lesson 10 proved a phone can reach *out*; this lesson proves the same
phone can be reached. `listenUsingRfcommWithServiceRecord`, matched to
the exact same `SPP_UUID` Lesson 10's `connect()` targets, is what
makes the two sides compatible at all — a mismatched UUID on either
side would mean `accept()` simply never fires for that attempt.
`accept()`, run off the main thread for the identical reason
`connect()` was in Lesson 10, is the server's own blocking wait; once
it returns, the resulting `BluetoothSocket` behaves exactly like
Lesson 10's — same `InputStream`/`OutputStream`, same read/write
calls, because at that point, both sides are simply looking at two
ends of the one same pipe.

## What Breaks Without This

Skip `serverSocket.close()` after a successful `accept()`:

```java
BluetoothSocket socket = serverSocket.accept();
// serverSocket.close() intentionally omitted here
```

Have a first device connect and disconnect, then have a **second**
device attempt to connect to the same phone using the same UUID.
Predicted result, per Android's own documented RFCOMM channel
limitation: the second connection attempt fails or hangs unexpectedly
— the still-open server socket is holding a channel resource that was
never released, even though the first, already-accepted connection no
longer needs it. Restore `serverSocket.close()` when done.

## Exercises

1. Run this lesson's code on two real, already-paired phones at the
   same time. Record what actually happened — which phone's message
   appeared on which screen — and compare it honestly to this
   lesson's predictions.
2. Change the listening phone's reply message to include
   `Build.MODEL` (a real `android.os.Build` field naming the specific
   device model) instead of a fixed string, so the connecting phone's
   Logcat shows real evidence of which physical device it actually
   reached.
3. Predict, then test: what happens if the *same* phone runs both
   `connect()` (Lesson 10) and this lesson's `accept()` at once, with
   no second phone involved at all, and no other bonded device
   available for `connect()` to reach? Confirm which of the two paths
   actually produces output and which one simply waits or fails.

## Definition of Done

- [ ] You can explain, without looking, why this lesson didn't repeat
      Lesson 10's `Thread.sleep` isolation, and where that proof
      actually lives.
- [ ] You ran this lesson's real code on two real, paired phones and
      saw a genuine two-way exchange — one phone's `"Hello from
      Android"` received by the other, and that other phone's `"Hello
      back from Android"` received in return.
- [ ] You can explain the difference between what `connect()` needs to
      be given (Lesson 10) and what `accept()` needs to be given
      (this lesson) — and why that difference exists.
- [ ] You broke the missing-`close()` case on purpose, saw a second
      connection attempt fail or hang, and restored the fix.
- [ ] You can state, honestly, in your own words, why this lesson's
      approach doesn't fully control which phone ends up calling and
      which ends up listening — and what a real fix would need that
      this lesson doesn't build.
- [ ] Commit: the server-socket/accept code in `MainActivity.java`.

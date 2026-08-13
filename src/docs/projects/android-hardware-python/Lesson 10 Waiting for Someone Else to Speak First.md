# Lesson 10: Waiting for Someone Else to Speak First

**What you will build:** the other half of Lesson 09's connection — a
real server socket that sits waiting, on its own background thread,
for some other device to connect to *this* phone, then reads back
whatever real text message arrives. Run this same app on two paired
phones and, in principle, each one's Lesson 09 client can reach the
other's Lesson 10 server. The transferable problem: everything opened
so far in this arc, this project's own code initiated — a discovery
scan, a client connection. A server is the opposite shape entirely: it
opens once, then genuinely waits, for an amount of real time nobody
can predict, for someone else to act first.

**What you need to know first:** Lesson 09 in full — the background
thread pattern this lesson reuses without re-proving, and the same
RFCOMM/SPP UUID.

**Terms introduced in this lesson:**
- **Server socket** — a socket that doesn't connect to anyone;
  instead, it listens, and hands back a real, ordinary connected
  socket only once someone else connects to it — a fundamentally
  different real role than the client socket Lesson 09 built, even
  though both end up reading and writing bytes the same way once
  connected.

**Objects and methods this lesson uses:**
- **`BluetoothAdapter.listenUsingRfcommWithServiceRecord(name, uuid)`**
  - *What it is:* opens a real server socket, advertising this phone
    as available for RFCOMM connections matching the given UUID.
  - *Implementation:* `name` is a human-readable label for this
    service (not shown to the user directly in this lesson); `uuid`
    must match whatever UUID a connecting client uses — the exact same
    UUID Lesson 09 already used. Returns a `BluetoothServerSocket`
    immediately, without waiting for anyone to connect.
  - *Its use:* this lesson's actual starting point.
- **`BluetoothServerSocket.accept()`**
  - *What it is:* waits for a real incoming connection.
  - *Implementation:* a genuinely blocking call, with no fixed limit
    on how long it may block — returns a real, connected
    `BluetoothSocket` once someone connects, exactly like the one
    Lesson 09's own client held.
  - *Its use:* what this lesson's background thread spends most of its
    time inside of.
- **`BluetoothSocket.getRemoteDevice()`**
  - *What it is:* identifies who just connected.
  - *Implementation:* no arguments; returns the real, connected
    `BluetoothDevice` on the other end.
  - *Its use:* lets this lesson log a real name for whoever connected,
    the same `.getName()` Lesson 07 already established.
- **`java.io.BufferedReader` / `java.io.InputStreamReader`**
  - *What they are:* two real, plain Java classes — not Bluetooth- or
    Android-specific at all — that together turn a raw byte stream
    into something that can be read one whole line of text at a time.
  - *Implementation:* `InputStreamReader` wraps a raw `InputStream`
    and decodes its bytes as text; `BufferedReader` wraps an
    `InputStreamReader` and adds `.readLine()`, which blocks until a
    full line — ending in the same `\n` Lesson 09's own client
    included — has actually arrived.
  - *Their use:* how this lesson actually reads the real message
    Lesson 09 sends.

---

## Concept Unit: A Call That Waits for Someone Else's Move

### The Problem

Lesson 09's `socket.connect()` was blocking, but it was still *this
project's own code* initiating things — the wait had a clear cause
this code controlled. `accept()` is a different kind of wait entirely:
nothing this project's own code does can make it return any sooner —
it depends entirely on some other, separate device choosing to connect,
whenever that happens, if it ever does. The exact same danger from
Lesson 09 still applies — this cannot run on the main thread — but the
*reason* to isolate it first is different: proving the reading
mechanism works before wiring it to something that might not respond
for a real, unknown length of time.

### Introduce the Concept in Isolation — Step 1: Proving Line-by-Line Reading Works, With No Bluetooth or Blocking Involved

**This isolation needs no Android build at all** — `ByteArrayInputStream`,
like `String` in Lesson 06's own isolation, is a completely ordinary
Java class with nothing hardware- or Android-specific about it,
available through Pyjnius the moment any Kivy app is running:

```python
from jnius import autoclass

ByteArrayInputStream = autoclass('java.io.ByteArrayInputStream')
InputStreamReader = autoclass('java.io.InputStreamReader')
BufferedReader = autoclass('java.io.BufferedReader')

fake_data = "hello from a fake stream\n".encode("utf-8")
raw_stream = ByteArrayInputStream(fake_data)
reader = BufferedReader(InputStreamReader(raw_stream))
print(reader.readLine())
```

Run this as a throwaway addition. Expected output — the same real
`bytes`-to-`byte[]` conversion Lesson 09 already proved for `write`,
now working the identical way for a constructor argument, followed by
the exact text read back, with the trailing `\n` itself stripped by
`readLine()`:

```
hello from a fake stream
```

Nothing here connects to anything, blocks, or touches Bluetooth at
all — it proves only the reading mechanism, on a fake, already-fully-
available stream instead of a real, waiting Bluetooth one, so the real
code below only has to add the actual waiting, not both ideas at once.

**Discard this scratch addition.**

### The Real Thing

**Reference Source:** no reference counterpart — `BluetoothServerSocket`'s
real API is confirmed against Android's own official developer
documentation, including its documented, intentional behavior when
`close()` is called from another thread while `accept()` is blocked,
fetched this session.

**Files affected:** `main.py`.

**Change type:** modify `check_bluetooth_enabled` (calls the new
method once); modify `on_pause`; add two new methods.

**Location:** inside `MyApp`, alongside Lesson 09's client-connection
methods.

**Dependencies:** Lesson 09's `threading` import and `UUID` reference;
Lesson 04's `on_pause`.

```python
InputStreamReader = autoclass('java.io.InputStreamReader')                # <- new
BufferedReader = autoclass('java.io.BufferedReader')                      # <- new

# (inside MyApp)

def check_bluetooth_enabled(self, dt):
    if self.bluetooth_adapter.isEnabled():
        Clock.unschedule(self.check_bluetooth_enabled)
        Logger.info("MyApp: Bluetooth confirmed on")
        self.list_bonded_devices()
        self.start_server()                                               # <- new

def start_server(self):                                                    # <- new
    threading.Thread(target=self._server_worker, daemon=True).start()     # <- new

def _server_worker(self):                                                  # <- new
    service_uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB") # <- new
    self.server_socket = self.bluetooth_adapter.listenUsingRfcommWithServiceRecord( # <- new
        "MyKivyApp", service_uuid                                         # <- new
    )                                                                     # <- new
    Logger.info("MyApp: server listening — waiting for a connection")     # <- new
    try:                                                                   # <- new
        client_socket = self.server_socket.accept()                       # <- new
        remote_name = client_socket.getRemoteDevice().getName()            # <- new
        Logger.info(f"MyApp: incoming connection from {remote_name}")      # <- new
        reader = BufferedReader(InputStreamReader(client_socket.getInputStream())) # <- new
        message = reader.readLine()                                       # <- new
        Logger.info(f"MyApp: received — {message}")                       # <- new
    except Exception as e:                                                 # <- new
        Logger.info(f"MyApp: server stopped — {e}")                       # <- new
    finally:                                                               # <- new
        self.server_socket.close()                                        # <- new

def on_pause(self):
    Clock.unschedule(self.update_label)
    accelerometer.disable()
    if hasattr(self, 'discovery_receiver'):
        self.discovery_receiver.stop()
        self.bluetooth_adapter.cancelDiscovery()
        Logger.info("MyApp: paused — discovery cancelled")
    if hasattr(self, 'server_socket'):                                     # <- new
        self.server_socket.close()                                        # <- new
        Logger.info("MyApp: paused — server socket closed")               # <- new
    Logger.info("MyApp: paused — accelerometer disabled")
    return True
```

### Mechanical Walkthrough

- `InputStreamReader = autoclass(...)` / `BufferedReader = autoclass(...)`
  — **reappearing exact mechanism from Lesson 06**, loading two more
  plain Java classes, already proven in Step 1.
- `self.start_server()` (added inside `check_bluetooth_enabled`) —
  called once, right after `list_bonded_devices`, the moment
  Bluetooth is confirmed on — the server begins listening immediately,
  independent of whatever Lesson 09's client thread is doing at the
  same time.
- `threading.Thread(target=self._server_worker, daemon=True).start()`
  — **reappearing exact mechanism from Lesson 09**, no new argument
  shape needed since `_server_worker` takes no extra arguments beyond
  `self`.
- `self.bluetooth_adapter.listenUsingRfcommWithServiceRecord("MyKivyApp", service_uuid)`
  — **first appearance**, full treatment above (Objects and methods).
  Uses the identical `service_uuid` value Lesson 09's client already
  used — required, not a coincidence: a client connecting with a
  different UUID would never be matched to this server at all.
- `self.server_socket.accept()` — **first appearance**, full treatment
  above — the real, unboundedly blocking call this lesson's own thread
  exists specifically to isolate.
- `client_socket.getRemoteDevice().getName()` — **first appearance of
  `getRemoteDevice()`**, full treatment above; `.getName()` itself
  **reappearing exactly from Lesson 07**.
- `BufferedReader(InputStreamReader(client_socket.getInputStream()))` —
  **reappearing exact construction from Step 1**, now wrapping a real
  Bluetooth socket's input stream instead of a fake `ByteArrayInputStream`.
- `reader.readLine()` — **reappearing exactly from Step 1**, now
  genuinely blocking until Lesson 09's real `\n`-terminated message
  actually arrives over the air, instead of returning instantly from
  an already-full fake stream.
- `except Exception as e:` / `finally:` — **first appearance of
  `finally` in this series.** The `except` here catches a real,
  expected case Step 1 never had to consider: `self.server_socket.close()`,
  called from `on_pause` below, is documented Android behavior for
  interrupting a thread stuck inside `accept()` — and interrupting it
  that way raises a real exception here, deliberately caught rather
  than treated as a crash. `finally` guarantees `close()` still runs
  even if a real connection succeeded and finished normally, so the
  server socket is never left open by accident either way.
- `if hasattr(self, 'server_socket'):` (inside `on_pause`) —
  **reappearing exact defensive shape from Lesson 08's own
  `discovery_receiver` guard**, for the identical real reason: the
  server thread might not have reached `self.server_socket = ...` yet
  if the app is paused early enough.
- `self.server_socket.close()` (inside `on_pause`) — **first
  appearance of this specific, intentional use** — not merely
  cleanup, but the actual, documented mechanism for making a thread
  stuck inside `accept()` return, covered fully above.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Android's own official documentation, not a captured
run.

1. The moment Bluetooth is confirmed on, predict both
   `connect_to_first_device` (Lesson 09) and `start_server` (this
   lesson) begin, each on its own separate background thread,
   independent of each other.
2. Predict a real "server listening" log line appears almost
   immediately, then **nothing further from this thread specifically**
   for however long it takes someone else to actually connect — which
   could be seconds, minutes, or never, entirely outside this
   project's own control.
3. **If this same app is run on a second, already-paired phone, and
   that phone's own Lesson 09 client happens to target this one:**
   predict `accept()` returns, a real "incoming connection" line logs
   the caller's real name, and shortly after, the real message Lesson
   09 sent is logged in full.
4. The user presses Home before anyone connects. Predict `on_pause`
   runs, finds `server_socket` does exist, and calls `.close()` on it
   — predict this causes the still-blocked `accept()` call to raise
   immediately, caught by the `except` block, logging that the server
   stopped, and `finally` then closes the socket a second, harmless
   time.

### CS Lens

**A thread that spends most of its life blocked, waiting for someone
else to initiate contact, is the real, general shape behind essentially
every server, at any scale** — a web server's own accept loop waiting
for the next incoming HTTP connection, a chat app's own socket waiting
for a message, a hardware device's own listener waiting for a command
over a wire. The shared shape, including this lesson's own: the
waiting thread does nothing wrong by waiting — the real design problem
is only ever making sure something *else* — this project's own
`on_pause`, in this lesson's case — has a real way to end that wait on
purpose, rather than leaving it blocked forever with no way out.

### SE Lens

**Why does this lesson's server accept exactly one connection and then
close, instead of looping to accept more?** A real, always-listening
server would wrap `accept()` in its own loop, spawning a fresh handler
for each new connection while immediately calling `accept()` again for
the next one. This lesson deliberately keeps the simpler, one-shot
version — proving the mechanism clearly, without also having to manage
multiple simultaneous connections' worth of state at once. A real
project reaching for genuinely repeated connections would restructure
`_server_worker` around a loop; this lesson's own honest scope stops
short of that, on purpose.

---

## Connect the Pieces

`threading.Thread`, proven on the desktop in Lesson 09, again keeps
this lesson's own unboundedly blocking `accept()` off the main thread,
with no new proof needed. `BufferedReader`/`InputStreamReader`, proven
in Step 1 against a fake, already-full stream with no Bluetooth
involved, is the exact same mechanism that reads Lesson 09's real
message once a real connection actually arrives. `on_pause`'s own
two-part shutdown shape, already extended once in Lesson 08 for
discovery, extends a second time here — closing the server socket is
not just cleanup, but the real, documented way to end a thread that
might otherwise be blocked in `accept()` indefinitely.

## What Breaks Without This

Remove the `on_pause` addition — the server socket, and the thread
blocked inside `accept()`, both left completely alone when the app
pauses:

```python
def on_pause(self):
    Clock.unschedule(self.update_label)
    accelerometer.disable()
    # server_socket.close() removed  <- wrong: nothing ever stops accept()
    return True
```

Predicted result: nothing crashes, and nothing about the app's visible
pause behavior changes at all — which is exactly the same invisible
danger Lesson 04's own "What Breaks Without This" already warned
about, now applied to a blocked thread instead of a polling sensor.
The background thread stays alive, genuinely blocked inside `accept()`,
for as long as the app remains paused — potentially the entire time,
since nothing will ever call `.close()` to interrupt it. Restore the
`on_pause` addition, and confirm for yourself, using Exercise 3 below,
that the thread really does end when expected, and really doesn't
without it.

## Exercises

1. Run this app on two paired phones at once, and confirm the real
   end-to-end path: phone A's Lesson 09 client connects to phone B,
   phone B's Lesson 10 server accepts it, and phone B's own log shows
   the exact message phone A sent.
2. Comment out `self.server_socket.close()` inside `on_pause`
   specifically (leaving the rest intact), pause the app before any
   connection arrives, and use Exercise 3's own thread-naming trick
   from Lesson 09 to confirm the server thread really is still alive
   and blocked, minutes later.
3. Change the UUID string used by `start_server` (but not
   `connect_to_first_device`) by a single character, and confirm that
   a real connection attempt from a matching client now fails or is
   never accepted at all — direct, real proof the UUID has to match
   exactly, not merely be "a valid-looking UUID."

## Definition of Done

- [ ] You ran Step 1's scratch addition and saw a real line of text
      read back through `BufferedReader`/`InputStreamReader`, with no
      Bluetooth or blocking involved at all.
- [ ] You ran the real Step 2 code on two paired phones and confirmed
      a real message actually crossed from one to the other.
- [ ] You confirmed, via Exercise 2, that `on_pause`'s `.close()` call
      is genuinely load-bearing — that without it, a blocked `accept()`
      thread really does outlive the pause.
- [ ] You can explain, without looking, why `accept()` is a
      fundamentally different kind of wait than `connect()`, even
      though both had to move off the main thread for the same
      underlying reason.
- [ ] You can state, in your own words, why this lesson's server only
      accepts one connection, and what would need to change to accept
      more.
- [ ] Commit: the updated `main.py`.

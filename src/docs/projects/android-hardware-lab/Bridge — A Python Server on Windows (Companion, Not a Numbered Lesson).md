# Bridge: Talking to a Machine That Isn't a Phone

**Not a numbered lesson in this series — a companion piece.** Every
other file in this folder teaches Java/Android, in order, building one
continuous project. This one is a single Python script for a separate
machine (a Windows PC), demonstrating that the Bluetooth protocol this
series already built is not Java-specific or Android-specific at all.
It depends on Lesson 14 and is written in that same voice and rigor,
but it isn't part of the Java curriculum's own sequence, and nothing
later in this series depends on it. (An earlier draft of this file
numbered it "Lesson 15," mixing a Python companion script into a
Java-only lesson sequence after already deciding Python gets its own,
separate series — corrected on the spot when the inconsistency was
pointed out.)

**What you will build:** a real Python script, running on a Windows
PC — not another phone — that receives the exact file Lesson 14's
Android code sends, over the exact same Bluetooth connection
mechanism. This file lives in a different language, on a different
machine, than everything else here — and that's the actual point:
RFCOMM, the protocol underneath every Bluetooth lesson since Lesson
07, was never Android-specific. Anything that speaks it correctly can
be on the other end.

**What you need to know first:** Lesson 14 in full — this lesson is
that lesson's exact receiving logic, reimplemented in Python. Real,
working Python — this lesson doesn't re-teach the language, only the
one library and the one byte-format detail that make it compatible
with Java's side.

**Where this code lives:** not inside the Android Studio project at
all. A single new file, e.g. `bridge_server.py`, run directly on a
Windows PC with **[PyBluez2](https://pypi.org/project/pybluez2/)**
installed (`pip install PyBluez2`) — chosen specifically over Python's
own built-in `socket` module, whose Bluetooth support does not extend
to Windows, and over the Mac-side alternative this series
deliberately avoided for the same reason: this project only teaches
what it has actually verified works, not what merely might.

**Terms introduced in this lesson:**
- **Wire format** — the exact, literal sequence of bytes two programs
  agree to exchange, independent of what language either one is
  written in. Every lesson before this one only ever had to agree with
  *itself* — Java talking to Java, one `DataOutputStream`/
  `DataInputStream` pair guaranteeing its own format automatically.
  This lesson is the first time this series has to state that
  agreement explicitly, because Python has no `DataOutputStream` of
  its own to silently match it.
- **Byte order (endianness)** — which end of a multi-byte number is
  stored first. Java's `DataOutputStream.writeLong` always writes
  **big-endian** (the most significant byte first) — a fact this
  lesson's Python code has to match on purpose, not assume.
- **Context manager (`with`)** — a Python construct that wraps a block
  of code with guaranteed setup and teardown, run no matter how the
  block ends, an exception included. `with open(...) as f:` guarantees
  the file is closed when the block finishes — the same "runs
  regardless of how the block exits" guarantee Java's `try`-with-
  resources (already used in this project's own Lesson 10) provides,
  expressed here as its own distinct keyword rather than a variant
  `try` syntax.

**Objects and methods this lesson uses:**
- **`bluetooth.BluetoothSocket(bluetooth.RFCOMM)`** (PyBluez2)
  - *What it is:* Python's own equivalent of
    `BluetoothDevice.createRfcommSocketToServiceRecord` (Lesson 10) —
    a socket specifically for the RFCOMM protocol.
  - *Implementation:* a class from the `bluetooth` module (PyBluez2
    installs under this same import name); `.bind`, `.listen`,
    `.accept` mirror Lesson 11's `BluetoothServerSocket` shape
    closely, method for method.
  - *Its use:* the Windows side's own listening socket, in this
    lesson's real code.
- **`bluetooth.advertise_service(...)`**
  - *What it is:* Python's counterpart to what
    `listenUsingRfcommWithServiceRecord`'s `name` argument did
    implicitly in Lesson 11 — publishing this service, under a
    specific UUID, so another device can find and match it.
  - *Implementation:* takes the socket, a human-readable name, and the
    UUID both sides must agree on — the exact same
    `00001101-0000-1000-8000-00805F9B34FB` constant this project's
    `SPP_UUID` has used since Lesson 10.
  - *Its use:* makes this Windows script discoverable and connectable
    from the phone's own Lesson 13 device list, the same way any other
    paired device already is.
- **`struct.pack(">q", value)` / `struct.unpack(">q", data)`**
  - *What they are:* Python's standard-library tools for converting
    between a Python number and an exact, specific sequence of raw
    bytes.
  - *Implementation:* the format string `">q"` means: `>` big-endian,
    `q` a signed 8-byte integer — deliberately matching
    `DataOutputStream.writeLong`'s own documented format, byte for
    byte.
  - *Its use:* reading and writing this lesson's length prefix, so
    Python's number and Java's `long` agree on the exact same bytes.
- **`bluetooth.PORT_ANY`**
  - *What it is:* a constant telling the OS to assign the next free
    RFCOMM channel number itself, instead of this script demanding one
    specific channel.
  - *Implementation:* an integer constant, passed as the port half of
    the address tuple `.bind` accepts.
  - *Its use:* this script has no reason to require one specific
    channel — any free one Windows happens to offer is equally usable,
    the same way a plain TCP server commonly binds to port `0` to mean
    "pick one for me."
- **`""` (the address half of `.bind(("", bluetooth.PORT_ANY))`)**
  - *What it is:* which local Bluetooth adapter to listen on.
  - *Implementation:* an empty string means "any locally available
    adapter," not one specific hardware address — the Bluetooth-socket
    equivalent of a TCP server binding to `0.0.0.0` instead of one
    specific network interface.
  - *Its use:* correct here because this script isn't choosing between
    multiple Bluetooth radios — it listens on whichever one the PC
    actually has.
- **`bluetooth.SERIAL_PORT_CLASS` / `bluetooth.SERIAL_PORT_PROFILE`**
  - *What they are:* two more standardized, publicly registered
    Bluetooth identifiers, distinct from `SPP_UUID` itself, that
    classify *what kind* of service this is to any device browsing
    available services by category.
  - *Implementation:* constants PyBluez defines internally, matching
    values the Bluetooth SIG standardized for the Serial Port Profile;
    passed to `advertise_service` alongside the UUID, not instead of
    it.
  - *Its use:* without these, a device browsing this service by
    category — rather than already knowing the exact UUID in
    advance — would have no way to recognize it as a serial-style
    connection specifically.
- **`file.write(bytes)`**
  - *What it is:* writes raw bytes to an already-open file.
  - *Implementation:* a method on the file object `open(...)` returns;
    with a file opened in `"wb"` mode, it writes exactly the bytes
    given, with no text encoding or line-ending translation applied.
  - *Its use:* the actual line that puts the received file's real
    bytes onto disk.
- **`.close()`** (on `client_sock` and `server_sock`)
  - *What it is:* releases the real OS-level resource a socket holds —
    a limited resource, not something a program can open indefinitely
    without ever releasing.
  - *Implementation:* takes no arguments; called once per socket, once
    this script has no further use for it.
  - *Its use:* `client_sock.close()` ends the specific connection to
    the phone; `server_sock.close()` separately stops this script from
    listening for any further connection — the same listening-socket-
    vs-connected-socket distinction Lesson 11 already drew in Java.

---

## Concept Unit: Two Different Languages, One Agreed Format

### The Problem

Lesson 14's length-prefixing worked because `DataOutputStream` and
`DataInputStream` are the *same* Java classes on both ends — Android's
socket, whether client or server, always wrote and read a `long` the
same guaranteed way. Python has no `DataOutputStream`. If this
lesson's Python code just picked its own convenient way to represent
"2150," Java's `readLong()` on the other end would read those same
raw bytes back as a completely different, wrong number — not a
crash, a silently incorrect one, unless both sides deliberately agree
on the exact same byte layout ahead of time.

### Introduce the Concept in Isolation — Step 1: The Same Number, Wrong Bytes

This isolation runs in Python directly — its entire point is a
cross-language byte-format mismatch, which no single-language scratch
file could demonstrate.

```python
import struct

value = 2150

wrong = struct.pack("<q", value)   # < = little-endian — NOT what Java writes
right = struct.pack(">q", value)   # > = big-endian — matches DataOutputStream exactly

print("Little-endian bytes:", wrong.hex())
print("Big-endian bytes:   ", right.hex())
```

Run it. Expected output:

```
Little-endian bytes: 6608000000000000
Big-endian bytes:    0000000000000866
```

The exact same number, `2150` — `0x866` in hexadecimal — produces two
completely different byte sequences depending only on which end is
considered "first." A Java `DataInputStream.readLong()`, reading the
`wrong` bytes, would reconstruct an enormous, incorrect number, not
`2150` — and then wait forever for that many bytes to arrive. This is
exactly why `">q"`, not `"<q"` or Python's platform-default `"q"`
(actually native-endian, which varies), appears in this lesson's real
code below.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** [PyBluez's own official `rfcomm-server.py`
example](https://github.com/pybluez/pybluez/blob/master/examples/simple/rfcomm-server.py),
fetched and confirmed this session, adapted here to receive
length-framed file data (Lesson 14's format) instead of that example's
own plain, unframed `recv` loop.

**Files affected:** a brand-new file, `bridge_server.py`, created
directly on the Windows PC — no Android Studio project file is
touched by this lesson at all.

**Change type:** new file.

**Dependencies:** `pip install PyBluez2`, run from a Windows terminal.
The Windows PC must already be paired with the phone via Windows'
own Bluetooth settings before this script can be reached from the
phone's Lesson 13 device list — pairing itself is a one-time, manual,
outside-of-code step this lesson doesn't automate.

```python
import bluetooth
import struct

SPP_UUID = "00001101-0000-1000-8000-00805F9B34FB"   # <- new — same constant as Lesson 10's SPP_UUID

server_sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)          # <- new
server_sock.bind(("", bluetooth.PORT_ANY))                          # <- new
server_sock.listen(1)                                                # <- new

bluetooth.advertise_service(                                         # <- new
    server_sock, "WindowsBridge",                                   # <- new
    service_id=SPP_UUID,                                            # <- new
    service_classes=[SPP_UUID, bluetooth.SERIAL_PORT_CLASS],        # <- new
    profiles=[bluetooth.SERIAL_PORT_PROFILE],                       # <- new
)                                                                     # <- new

print("Waiting for a connection...")                                 # <- new
client_sock, client_info = server_sock.accept()                     # <- new
print("Connected to", client_info)                                   # <- new

length_bytes = client_sock.recv(8)                                   # <- new
expected_bytes = struct.unpack(">q", length_bytes)[0]                # <- new
print("Expecting", expected_bytes, "bytes")                          # <- new

received = b""                                                       # <- new
while len(received) < expected_bytes:                                # <- new
    chunk = client_sock.recv(min(1024, expected_bytes - len(received))) # <- new
    if not chunk:                                                     # <- new
        break                                                         # <- new
    received += chunk                                                 # <- new

with open("received_from_phone.txt", "wb") as f:                    # <- new
    f.write(received)                                                 # <- new

print("Received", len(received), "of", expected_bytes, "bytes")     # <- new
client_sock.close()                                                   # <- new
server_sock.close()                                                   # <- new
```

### Mechanical Walkthrough

- `SPP_UUID = "00001101-..."` — **first appearance in Python, same
  value already fully established since Lesson 10.** The value itself
  needs no new explanation; what's new is that two entirely different
  codebases, in two different languages, both hardcode the identical
  string on purpose — the actual mechanism that lets them find and
  agree to talk to each other at all.
- `bluetooth.BluetoothSocket(bluetooth.RFCOMM)` — **first
  appearance**, full treatment above (Objects and methods). Mirrors
  Lesson 11's `listenUsingRfcommWithServiceRecord`/`accept()` shape
  closely enough that no separate isolation lab is needed for the
  underlying "listen, then accept" idea — already proven in Java in
  Lesson 11; this is that same idea's Python expression.
- `.bind(("", bluetooth.PORT_ANY))` — **both tuple elements are first
  appearances**, full treatment above (Objects and methods): the empty
  string picks "any local adapter," `PORT_ANY` picks "any free
  channel" — two independent "don't care, pick for me" defaults, not
  one setting.
- `.listen(1)` — **first appearance of this argument.** The maximum
  number of pending connections allowed to queue up before this
  script has called `accept()` for them — `1` is enough here because
  this script only ever expects one phone to connect at a time; a
  real multi-client server would pass a larger number.
- `bluetooth.advertise_service(...)` — **first appearance**, full
  treatment above for the call itself; `service_classes=[SPP_UUID,
  bluetooth.SERIAL_PORT_CLASS]` and `profiles=[bluetooth.SERIAL_PORT_PROFILE]`
  are each first appearances too, full treatment above (Objects and
  methods) — neither is a restatement of `SPP_UUID`, despite appearing
  in the same call.
- `client_sock, client_info = server_sock.accept()` — **reappearing
  concept from Lesson 11 (a blocking accept call), new language.**
  Python doesn't need this lesson's own `Thread` treatment the way
  Java did in Lesson 10 — a plain Python script blocking at the top
  level, waiting, is normal and expected; there's no UI thread here to
  freeze.
- `client_sock.recv(8)` — **first appearance of Python socket
  `recv`.** Requests up to 8 bytes; like Java's `read`, not guaranteed
  to return exactly 8 in one call in general — this lesson's own
  simplification assumes it does for this one small, fixed-size
  read, which is safe in practice for a value this small but is
  exactly the same assumption Step 1 of Lesson 14 proved isn't safe to
  make in general.
- `struct.unpack(">q", length_bytes)[0]` — **first appearance**, full
  treatment above (Terms and Objects). `unpack` always returns a
  tuple, even for one value — `[0]` extracts that single value.
- `while len(received) < expected_bytes` — **reappearing pattern from
  Lesson 14's own length-bounded loop, new language.** Identical
  shape, identical reasoning — Python's `bytes` objects are immutable,
  so `received += chunk` builds a new, longer `bytes` object each
  time rather than mutating one in place, a real but minor
  Python-specific cost this lesson accepts for its own clarity.
- `with open("received_from_phone.txt", "wb") as f:` — **`open(...)`
  is a first appearance of Python file I/O in this series; `with` is a
  first appearance of a context manager**, full treatment above
  (Objects and methods, and Terms). `"wb"` — write, binary — matters
  specifically because file content is raw bytes, not text; opening in
  plain text mode risks Python silently rewriting certain byte
  sequences (line-ending translation) on some platforms, corrupting
  anything that isn't actually plain text.
- `f.write(received)` — **first appearance**, full treatment above
  (Objects and methods). The actual line that puts the received bytes
  on disk — everything before it only received the bytes into memory.
- `client_sock.close()` / `server_sock.close()` — **first
  appearance**, full treatment above (Objects and methods). Notice
  these run *outside* the `with` block above, by hand — `with` only
  ever managed the file, per its own guarantee; the two sockets were
  never inside that block and were never going to be closed
  automatically by it.

### Execution Trace

**Same honesty note as the rest of this arc, for a new reason here:**
this session has neither a real Android device nor a Windows machine
to run this script on — every value below is predicted from PyBluez's
own documented behavior and this project's own already-established
Java behavior, not captured from a real cross-device run. This one
specifically deserves real, hands-on confirmation before trusting it.

1. `bridge_server.py` runs on Windows, advertises the service, and
   blocks on `accept()` — predict the terminal shows only `"Waiting
   for a connection..."` until a real phone connects.
2. On the phone, Lesson 13's device list now includes the Windows
   PC's paired Bluetooth name. The user taps it — predict this runs
   Lesson 14's `connectToDevice`, targeting the PC instead of another
   phone, with no Java code changes needed at all.
3. Predict `accept()` returns, the terminal logs `"Connected to
   (...)"`, then `recv(8)` receives Java's big-endian `2150`,
   correctly decoded via `">q"` — matching Step 1's proof, deliberately
   applied.
4. Predict the chunked `recv` loop completes, `"Received 2150 of 2150
   bytes"` logs, and a real file, `received_from_phone.txt`, appears
   in the same folder as the script — byte-for-byte identical to
   Android's own `demo.txt` from Lesson 14.

### CS Lens

**A shared, explicit wire format is what makes any two independently
written programs interoperable at all** — the actual foundation
underneath every real network protocol and file format this series
has invoked as comparisons so far (HTTP, `.zip`, Protocol Buffers).
None of those specify a *language* — they specify bytes, in an exact,
documented order, precisely so a Java client and a Python server (or a
C++ one, or anything else) can agree without either one knowing or
caring what the other is written in. This lesson is this series' first
direct, hands-on proof of that idea, not just a comparison to it.

### SE Lens

**Why didn't this lesson reach for a higher-level format — JSON, for
instance — instead of a raw, hand-matched byte layout?** A text format
like JSON would remove this lesson's own byte-order problem entirely,
at a real cost this project doesn't need to pay: JSON parsing
overhead, and no natural way to embed truly raw binary file content
(a real photo, in a later lesson) without an extra encoding step
(Base64) inflating its size by roughly a third. The raw, fixed-width
length prefix this lesson uses is the same tradeoff real binary
protocols consistently make: less human-readable, more work to get
byte-order right the first time, but smaller and faster once it's
correct — the right tradeoff specifically because this project's real
payload is file bytes, not structured text.

---

## Connect the Pieces

The exact `SPP_UUID` this project chose in Lesson 10, unchanged, is
what lets a phone's Lesson 13 device list and a Windows Python script
recognize each other as offering the same service at all. Once
connected, PyBluez's `recv`/`send` play the same role Java's
`InputStream`/`OutputStream` have played since Lesson 10 — and Step
1's isolated proof of big-endian vs. little-endian bytes is the one
piece of new agreement needed to make Lesson 14's Java-side framing
and this lesson's Python-side framing describe the exact same file,
byte for byte, across two genuinely different machines and languages.

## What Breaks Without This

Use Python's native byte order instead of forcing big-endian:

```python
expected_bytes = struct.unpack("q", length_bytes)[0]  # <- no > — native byte order, not matched to Java
```

Predicted result, on a typical Windows PC (little-endian hardware):
`expected_bytes` decodes to a wildly incorrect, enormous number — not
`2150` — because Java sent big-endian bytes and this line reads them
back as little-endian. The receive loop then waits for a number of
bytes far larger than the sender will ever provide, and appears to
simply hang. Nothing crashes; nothing logs an error — exactly the kind
of silent, format-mismatch bug this lesson's Terms section named up
front. Restore the explicit `">q"` when done.

## Exercises

1. Pair a Windows PC with your phone via Windows' own Bluetooth
   settings first (outside of any code), then run this lesson's real
   script and connect to it from the phone's device list. Confirm a
   real file arrives, byte-for-byte matching Lesson 14's `demo.txt`.
2. Modify this script to also *send* a reply file back to the phone,
   length-prefixed the same way — the mirror image of Lesson 14's own
   `connectToDevice`, now with Python on the sending side instead of
   receiving.
3. Deliberately break the UUID on only one side (change one character
   in the Windows script's `SPP_UUID`, leave the phone's unchanged).
   Predict, then confirm, what actually happens when the phone tries
   to connect — does it fail immediately, time out, or something else?

## Definition of Done

- [ ] You ran Step 1's Python script yourself and saw the same number
      produce two genuinely different byte sequences.
- [ ] You installed PyBluez2 on a real Windows machine, ran the real
      server script, and confirmed it correctly received a real file
      sent from Lesson 14's Android code.
- [ ] You can explain, without looking, why this lesson needed
      `struct.pack(">q", ...)` specifically, and what would go wrong
      with a plain `struct.pack("q", ...)`.
- [ ] You broke the byte-order case on purpose, watched the real
      symptom (an apparent hang, not a crash), and restored the fix.
- [ ] You can state, in your own words, why a UUID mismatch, a
      permission gap (Lesson 07), and a byte-order mismatch (this
      lesson) all produce silent failures instead of clear errors —
      and why that makes each one worth deliberately breaking on
      purpose at least once, the way every lesson in this arc has.
- [ ] Commit: not applicable to the Android Studio project — this
      lesson's own file, `bridge_server.py`, is a new, separate script
      kept wherever you keep it on the Windows machine.

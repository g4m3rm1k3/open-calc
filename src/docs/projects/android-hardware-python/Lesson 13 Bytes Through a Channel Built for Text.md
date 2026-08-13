# Lesson 13: Bytes Through a Channel Built for Text

**What you will build:** a real file, written to this phone's own
private storage, sent whole across the exact socket Lessons 09 and 10
already opened, and saved as a real file on the other end. The
transferable problem: this project's only proven way to read from a
Bluetooth socket so far — `BufferedReader.readLine()` — is built for
text, and a real file can contain any byte value at all, including
ones that don't correspond to valid, readable text. Sending it whole
means bridging that gap honestly, not assuming it away.

**What you need to know first:** Lesson 09's client connection and
Lesson 10's server, including the `\n`-terminated message both already
exchange successfully.

**Terms introduced in this lesson:**
- **Base64** — a standard, real encoding that represents *any* byte
  value at all — including ones with no valid text meaning — using
  only plain, ordinary ASCII letters, digits, `+`, `/`, and `=`,
  specifically so arbitrary binary data can safely travel through a
  channel that only reliably handles text.

**Objects and methods this lesson uses:**
- **`App.user_data_dir`**
  - *What it is:* a real, writable, app-private directory path, unique
    to this app, that this lesson can freely write to and read from.
  - *Implementation:* a plain string property, already available on
    every `App` instance — no permission request needed, unlike
    reaching into shared/public storage, which this lesson does not
    attempt.
  - *Its use:* where this lesson's own real file actually lives, on
    both the sending and receiving side.
- **`base64.b64encode(bytes)` / `base64.b64decode(bytes)`**
  - *What they are:* Python's own standard-library base64 functions.
  - *Implementation:* `b64encode` takes real bytes, returns a new
    `bytes` object containing only safe, printable ASCII characters;
    `b64decode` reverses it exactly, byte for byte.
  - *Their use:* the actual bridge between this lesson's real file
    bytes and the text-oriented `readLine()` mechanism Lesson 10
    already proved.

---

## Concept Unit: A File Doesn't Know It's Supposed to Be Text

### The Problem

Every message exchanged so far in this arc has been ordinary,
human-readable text, safely handled by `readLine()`. A real file has
no such guarantee — its bytes could be anything at all, including
values with no valid text meaning, which could break a naive
line-based read partway through, or simply never contain the `\n`
`readLine()` waits for. This lesson doesn't reach for a lower-level,
unverified binary-reading mechanism to solve that; it reaches for a
real, standard, already-proven-safe encoding instead — one that turns
*any* bytes into something `readLine()` was already proven, back in
Lesson 10, to handle correctly.

### Introduce the Concept in Isolation — Step 1: Proving Base64 Really Round-Trips Arbitrary Bytes

**Ordinary desktop Python — no Kivy, no Android, no Bluetooth:**

```python
import base64

data = b"real bytes, including \x00 and \xff that plain text can't safely hold"
encoded = base64.b64encode(data)
print("encoded:", encoded)

decoded = base64.b64decode(encoded)
print("round-trip matches:", decoded == data)
```

Run it. Expected output — real, printable ASCII for the encoded form,
and a confirmed, exact match once decoded back:

```
encoded: b'cmVhbCBieXRlcywgaW5jbHVkaW5nIAAg4WM7bG9zZW1ldCB0ZXh0IGNhbid0IHNhZmVseSBob2xk...'
round-trip matches: True
```

(The exact encoded string above is illustrative — run it yourself to
see the real value; what matters is that it decodes back to something
identical, byte for byte, to the original, even though that original
contained bytes — `\x00`, `\xff` — with no valid meaning as plain
text.) This is the entire mechanism the real file transfer below
depends on: not reading raw bytes off the socket directly, but
encoding them into something the already-proven `readLine()` path can
carry safely.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Python's own
`base64` module is standard library, confirmed against its official
documentation; `App.user_data_dir` is confirmed against Kivy's own
current official documentation, both fetched this session.

**Files affected:** `main.py`.

**Change type:** modify `_connect_worker` (sends a real file after the
existing message); modify `_server_worker` (reads a second real line
and saves it as a file); add two new methods.

**Location:** inside `MyApp`, alongside Lessons 09 and 10's socket
code.

**Dependencies:** Lesson 09's `output_stream`; Lesson 10's `reader`.

```python
import base64                                                              # <- new
import os                                                                  # <- new

# (inside _connect_worker, after the existing output_stream.write(...) line)

def _connect_worker(self, device):
    try:
        service_uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
        socket = device.createRfcommSocketToServiceRecord(service_uuid)
        socket.connect()
        Logger.info(f"MyApp: connected to {device.getName()}")
        output_stream = socket.getOutputStream()
        output_stream.write("hello from Python\n".encode("utf-8"))
        self.send_file(output_stream)                                     # <- new
        self.bluetooth_socket = socket
    except Exception as e:
        Logger.info(f"MyApp: connection to {device.getName()} failed — {e}")

def send_file(self, output_stream):                                        # <- new
    file_path = os.path.join(self.user_data_dir, "outgoing.txt")          # <- new
    with open(file_path, "w") as f:                                       # <- new
        f.write("This is a real file, sent for real over Bluetooth.")     # <- new
    with open(file_path, "rb") as f:                                      # <- new
        raw_bytes = f.read()                                              # <- new
    encoded = base64.b64encode(raw_bytes)                                 # <- new
    output_stream.write(encoded + b"\n")                                  # <- new
    Logger.info(f"MyApp: sent file — {len(raw_bytes)} real bytes")        # <- new

# (inside _server_worker, after the existing message = reader.readLine() line)

def _server_worker(self):
    service_uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")
    self.server_socket = self.bluetooth_adapter.listenUsingRfcommWithServiceRecord(
        "MyKivyApp", service_uuid
    )
    Logger.info("MyApp: server listening — waiting for a connection")
    try:
        client_socket = self.server_socket.accept()
        remote_name = client_socket.getRemoteDevice().getName()
        Logger.info(f"MyApp: incoming connection from {remote_name}")
        reader = BufferedReader(InputStreamReader(client_socket.getInputStream()))
        message = reader.readLine()
        Logger.info(f"MyApp: received — {message}")
        self.receive_file(reader)                                         # <- new
    except Exception as e:
        Logger.info(f"MyApp: server stopped — {e}")
    finally:
        self.server_socket.close()

def receive_file(self, reader):                                            # <- new
    encoded_line = reader.readLine()                                      # <- new
    if not encoded_line:                                                  # <- new
        Logger.info("MyApp: no file data received")                       # <- new
        return                                                            # <- new
    raw_bytes = base64.b64decode(str(encoded_line))                       # <- new
    incoming_path = os.path.join(self.user_data_dir, "incoming.txt")      # <- new
    with open(incoming_path, "wb") as f:                                  # <- new
        f.write(raw_bytes)                                                # <- new
    Logger.info(f"MyApp: received file — {len(raw_bytes)} real bytes, saved to {incoming_path}") # <- new
```

### Mechanical Walkthrough

- `import base64` / `import os` — **first appearances of both,
  ordinary standard library.**
- `self.send_file(output_stream)` (added inside `_connect_worker`) —
  called after the existing text message, over the same already-open
  `output_stream` — no second connection needed.
- `def send_file(self, output_stream):` — **first appearance.**
- `file_path = os.path.join(self.user_data_dir, "outgoing.txt")` —
  **first appearance of `user_data_dir`**, full treatment above
  (Objects and methods); `os.path.join` is ordinary Python, already
  assumed knowledge.
- `open(file_path, "w")` / `f.write("This is a real file...")` —
  **ordinary Python text-mode file writing, already assumed
  knowledge** — creates the real file this lesson then sends,
  standing in for whatever real file a later, more complete app might
  let the user choose instead.
- `open(file_path, "rb")` / `raw_bytes = f.read()` — **first
  appearance of binary-mode (`"rb"`) file reading in this series.**
  The `b` matters directly: it reads the file's own real bytes exactly
  as stored, with no text decoding applied at all — required here
  since those bytes are about to be base64-encoded, not displayed as
  text.
- `base64.b64encode(raw_bytes)` — **first appearance**, full treatment
  above, proven safe in Step 1.
- `output_stream.write(encoded + b"\n")` — **reappearing `write`
  mechanism from Lesson 09**, sending base64's own real output, with a
  real `\n` appended — required so the receiving side's `readLine()`
  knows exactly where this second line ends.
- `self.receive_file(reader)` (added inside `_server_worker`) — called
  right after the existing text message is read, reusing the same
  `reader` — no second `BufferedReader` construction needed.
- `def receive_file(self, reader):` — **first appearance.**
- `encoded_line = reader.readLine()` — **reappearing exact mechanism
  from Lesson 10**, reading a second real line instead of the first.
- `if not encoded_line:` — a real, honest guard: if the connection
  closed early, or nothing further was sent, `readLine()` returns a
  real Java `null`, which Pyjnius hands back as Python's own `None` —
  the same translation Lesson 06 already established for
  `getDefaultAdapter()`'s own possible `None` — caught here before
  attempting to decode nothing at all.
- `base64.b64decode(str(encoded_line))` — **first appearance of
  `b64decode`**, full treatment above. `str(...)` wraps the value
  Pyjnius handed back — already an ordinary Python string — explicitly,
  making clear this is real Python text being decoded, not a Java
  object needing any further bridging.
- `os.path.join(self.user_data_dir, "incoming.txt")` — **reappearing
  exact mechanism**, on the receiving side's own private storage this
  time, entirely separate from the sender's.
- `open(incoming_path, "wb")` / `f.write(raw_bytes)` — **reappearing
  binary-mode file writing**, the mirror image of `send_file`'s own
  binary-mode read.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Python's own standard library documentation and
Kivy's own official documentation, not a captured run.

1. After `socket.connect()` succeeds and the existing text message is
   sent, predict `send_file` runs: a real, small file is written to
   this phone's own private storage, immediately read back as raw
   bytes, base64-encoded, and sent as a second real line.
2. On the receiving phone, after `message = reader.readLine()` already
   logs the first line exactly as Lesson 10 established, predict
   `receive_file` reads the second line, decodes it back into the
   exact original bytes, and writes them to its own, separate private
   storage.
3. Predict a real `Logger.info` line on the receiving side confirming
   the exact byte count — matching the sender's own logged byte count
   precisely, direct, real proof nothing was lost or altered in
   transit.
4. Open both real files afterward — the sender's `outgoing.txt` and
   the receiver's `incoming.txt` — predict their contents are
   byte-for-byte identical.

### CS Lens

**Encoding arbitrary binary data as safe, printable text before
sending it through a channel that assumes text is a real, general
technique — not specific to Bluetooth or this project at all**: email
attachments have used base64 for exactly this reason since long before
modern file-sharing existed, because raw email itself was a
text-only medium; embedding a small image directly inside a CSS or
HTML file as a `data:` URI uses the same encoding, for the same
reason. The shared shape every time: a transport layer that only
promises to carry valid text reliably, and a real need to carry
something that isn't.

### SE Lens

**Why base64-encode the file instead of reading and writing its raw
bytes directly against the socket's own input/output streams?** A raw
byte-array read/write path exists on `InputStream`/`OutputStream`
directly, and would avoid base64's own real overhead — encoded data is
roughly a third larger than the original. This lesson deliberately
avoids it: reading a raw byte buffer correctly requires handling
partial reads in a loop (a real, genuine `InputStream.read` behavior —
a single call is permitted to return fewer bytes than requested, even
mid-file, documented directly in Java's own API), a real source of
subtle bugs this lesson's own scope chooses not to take on. Reusing
`readLine()` — already proven correct in Lesson 10 — at the cost of
that real size overhead is this lesson's own honest, named trade,
not a limitation hidden from view.

---

## Connect the Pieces

Step 1's own two-line proof — encode, then decode, then compare — is
the entire real mechanism behind `send_file`/`receive_file`; nothing
about reading or writing the actual socket changes at all from
Lessons 09 and 10, because base64 turns a real, arbitrary-bytes
problem into a plain-text problem this project already solved.
`user_data_dir`, needing no permission request the way public storage
would, is where both sides' own real files actually live — proof that
a working file transfer doesn't yet require this series to teach
Android's own storage-permission model at all.

## What Breaks Without This

Skip the base64 step, and try to send the file's raw bytes directly
through the same text-oriented path:

```python
def send_file(self, output_stream):
    with open(file_path, "rb") as f:
        raw_bytes = f.read()
    output_stream.write(raw_bytes + b"\n")   # <- wrong: raw bytes, not base64-encoded
```

Predicted result: for this lesson's own plain-text sample file, this
might appear to work by coincidence — the bytes happen to already be
valid text. Predict it breaks the moment the file contains a byte with
no valid text meaning: `readLine()` on the receiving end is not
guaranteed to preserve arbitrary byte values the way a true binary
read would, and a real `\n` occurring naturally partway through the
file's own raw bytes — entirely possible in any real binary file — would
be misread as the message's actual end, truncating everything after
it. Restore the base64 step, and confirm for yourself, using Exercise
2 below, exactly where the raw version starts producing wrong results.

## Exercises

1. Change the sample file's contents to something longer — a few
   sentences — and confirm the received file still matches exactly,
   byte for byte, using each side's own logged byte count as a quick
   check before even opening both files to compare.
2. Deliberately write a file containing a raw `\x00` byte
   (`open(file_path, "wb").write(b"before\x00after")`) and send it
   using both this lesson's real base64 version and the broken raw
   version from What Breaks Without This. Confirm the base64 version
   still round-trips exactly, while the raw version corrupts or
   truncates it.
3. Log `len(encoded)` alongside `len(raw_bytes)` in `send_file`, and
   confirm for yourself that the encoded form really is larger — the
   real, physical cost named honestly in this lesson's own SE Lens.

## Definition of Done

- [ ] You ran Step 1 on the desktop and confirmed a real byte string
      containing invalid-text bytes round-tripped exactly through
      `b64encode`/`b64decode`.
- [ ] You ran the real Step 2 code between two paired phones and
      confirmed the received file's contents exactly matched the sent
      one.
- [ ] You reproduced Exercise 2's raw-byte corruption case and can
      explain, in your own words, exactly why it went wrong where
      base64 didn't.
- [ ] You can state, without looking, why `user_data_dir` needed no
      permission request, unlike the runtime permissions Lesson 05
      already required for Bluetooth itself.
- [ ] You can explain the real trade this lesson names in its own SE
      Lens — base64's size cost versus a raw, partial-read-aware
      binary loop — in your own words.
- [ ] Commit: the updated `main.py`.

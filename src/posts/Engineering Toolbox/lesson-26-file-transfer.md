# Lesson 26: TCP Doesn't Know Where Your Messages End
### (File Transfer Utility)

**What you will build.** A real client/server pair that sends an
actual file's bytes over a socket and reconstructs it, byte-for-byte,
on the other end — verified with Lesson 13's `hash_file()`, not just
assumed. The working feature combines pieces already built: Lesson
10's chunked reading, Lesson 18's sockets, Lesson 9's file writing. The
transferable problem underneath is one this curriculum has been
quietly depending on being simple until now: **TCP delivers a stream
of bytes, not a stream of messages** — nothing about a `recv()` call
tells you where one logical piece of data (a filename, a size, a
file's contents) ends and the next begins, unless *you* build that
boundary into the protocol yourself. This lesson proves that gap
directly, with a real crash caused by exactly this assumption.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson is about what has to happen *around* that
pipeline once more than one piece of information needs to cross it in
a single exchange.

**What you need to know first.** From Lesson 10/11: chunked reading
and writing with a `while` loop. From Lesson 13: `hash_file()`. New in
this lesson: the `struct` module's `pack`/`unpack` for a length prefix
(reused directly from Lesson 22's ICMP work, applied here to framing
instead of a checksum).

---

## Concept Unit: A Length Prefix

### The Problem

We want to send a file's name and its content over one connection.
Both are just bytes on the wire — nothing marks where the filename
ends and the file's actual content begins. We need an explicit way to
tell the receiver "the next N bytes are the filename" before sending
it, so it knows exactly how much to read.

### Introduce the Concept in Isolation

```python
import struct
size = 5000
prefix = struct.pack("!Q", size)
print(prefix, len(prefix))
recovered = struct.unpack("!Q", prefix)[0]
print(recovered)
```

Run it:

```
b'\x00\x00\x00\x00\x00\x00\x13\x88' 8
5000
```

This proves `struct.pack("!Q", size)` — `struct` reused directly from
Lesson 22, `Q` here meaning "unsigned 8-byte integer" instead of that
lesson's smaller fields — encodes any number up to a huge maximum into
exactly 8 fixed bytes, and `struct.unpack("!Q", ...)` reverses it
exactly. Sending this 8-byte prefix *before* the actual data it
describes is the whole idea: the receiver reads exactly 8 bytes first,
decodes the real size, and then knows precisely how many more bytes to
expect. This throwaway example is discarded.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `file_sender.py`, `file_receiver.py` (both new)
- **Change type:** create
- **Location:** top of each file
- **Dependencies:** `socket`, `struct`, `os` modules

### The New Code

```python
# file_sender.py
import socket
import struct
import os
import sys

def send_file(host, port, filepath):
    filename = os.path.basename(filepath)
    file_size = os.path.getsize(filepath)

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((host, port))
        name_bytes = filename.encode()
        s.sendall(struct.pack("!I", len(name_bytes)))
        s.sendall(name_bytes)
        s.sendall(struct.pack("!Q", file_size))
```

### The Updated Project

```python
import socket
import struct
import os
import sys

def send_file(host, port, filepath):                     # ← new
    filename = os.path.basename(filepath)                    # ← new
    file_size = os.path.getsize(filepath)                       # ← new

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:   # ← new
        s.connect((host, port))                                       # ← new
        name_bytes = filename.encode()                                    # ← new
        s.sendall(struct.pack("!I", len(name_bytes)))                        # ← new
        s.sendall(name_bytes)                                                   # ← new
        s.sendall(struct.pack("!Q", file_size))                                    # ← new
```

The sender now transmits, in strict order: a 4-byte prefix giving the
filename's length, the filename itself, and an 8-byte prefix giving the
file's total size — three separate `sendall()` calls, each one a
distinct, self-describing piece.

### Mechanical Walkthrough
- `import struct` — Lesson 22, reminder.
- `os.path.basename(filepath)`, `os.path.getsize(filepath)` — Lesson 11/9, reminders.
- `with socket.socket(...) as s: s.connect((host, port))` — Lesson 18, reminder.
- `struct.pack("!I", len(name_bytes))` — `"I"` (unsigned 4-byte integer — smaller than `"Q"`, appropriately sized for a

filename's length, which will never need 8 bytes' worth of range) — the
concept from this unit's lab, reused for real, sized differently.
- `s.sendall(name_bytes)` — Lesson 19, reminder.
- `struct.pack("!Q", file_size)` — the concept from this unit's lab, reused for real, `"Q"`

this time since a real file's size genuinely can exceed what 4 bytes
could hold.

### CS Lens

This is **message framing** — imposing explicit boundaries on top of a
protocol (TCP) that fundamentally has none. Also recognized in: HTTP's
own `Content-Length` header (Lesson 24/25 — the exact same idea, one
layer up, marking where a body ends); Protocol Buffers and other binary
serialization formats, which use length-prefixing internally for
exactly this reason; even Lesson 21's UDP, where each datagram *is*
already one discrete message — a length prefix like this is only
necessary because TCP, unlike UDP, doesn't preserve message boundaries
at all.

### SE Lens

A **fixed-size** length prefix (always exactly 4 or 8 bytes, regardless
of what number it encodes) is what makes this reliably parseable: the
receiver always knows to read exactly 4 bytes for a length, no matter
what that length turns out to be — there's no ambiguity about where the
length field itself ends. A text-based alternative (like sending
`"18\n"` before an 18-byte filename) would work too, but needs its own
delimiter-scanning logic; a fixed-width binary field sidesteps that
entirely, at the cost of being far less human-readable when inspecting
raw traffic.

### Commands Needed

None yet — the client sends its header, but the transfer isn't
complete.

### Run It

Not runnable for a complete transfer yet — no receiver exists, and the
sender doesn't send the file's actual content.

### Connection

The sender now transmits a real, self-describing header. The next unit
builds the receiver that reads it correctly — and the actual file
content that follows.

---

## Concept Unit: `recv_exact()` — Reading a Precise Number of Bytes

### The Problem

Lesson 18's `recv(1024)` reads *up to* 1024 bytes — however much
happens to be available right then, which can be less. For reading a
fixed-size header field, "less than requested" isn't good enough:
we need exactly 4 bytes, no more, no less, before we can safely
interpret them as a length.

### Project Change

- **Files affected:** `file_receiver.py`
- **Change type:** create
- **Location:** top of the file
- **Dependencies:** `socket`, `struct`, `os`

### The New Code

```python
import socket
import struct
import os

HOST = "127.0.0.1"
PORT = 65490
SAVE_DIR = "/home/claude/received_files"

def recv_exact(conn, n):
    data = b""
    while len(data) < n:
        chunk = conn.recv(n - len(data))
        if not chunk:
            raise ConnectionError("connection closed before all data arrived")
        data += chunk
    return data
```

### The Updated Project

This is the entire file so far:

```python
import socket
import struct
import os

HOST = "127.0.0.1"
PORT = 65490
SAVE_DIR = "/home/claude/received_files"

def recv_exact(conn, n):                                  # ← new
    data = b""                                                # ← new
    while len(data) < n:                                         # ← new
        chunk = conn.recv(n - len(data))                            # ← new
        if not chunk:                                                # ← new
            raise ConnectionError("connection closed before all data arrived")  # ← new
        data += chunk                                                            # ← new
    return data                                                                    # ← new
```

`recv_exact(conn, n)` is a small but critical helper: it calls `recv()`
**repeatedly**, accumulating bytes, until it has genuinely collected
exactly `n` of them — never returning early with less, regardless of
how many separate `recv()` calls that takes.

### Mechanical Walkthrough
- `def recv_exact(conn, n):` — basic.
- `data = b""` — an empty `bytes` accumulator.
- `while len(data) < n:` — keeps looping until enough bytes have genuinely arrived.
- `chunk = conn.recv(n - len(data))` — Lesson 18,

reminder, but requesting only however many bytes are *still needed*,
- not always the full `n`.
- `if not chunk: raise ConnectionError(...)` —
Lesson 19's empty-bytes-means-disconnected pattern, reminder — but here
treated as a real failure (raising an exception) rather than a normal
disconnect, since a connection closing mid-header genuinely means the
- transfer failed.
- `data += chunk` — accumulating.

### CS Lens

This is exactly Lesson 10's chunked-reading discipline, turned inward:
instead of reading *until* some sentinel (an empty chunk, there),
`recv_exact()` reads until a **known target length** is reached —
the same "don't assume one call gets everything" caution, applied to a
situation where the total size is known in advance rather than
discovered by a sentinel.

### SE Lens

Every earlier lesson's socket code — Lesson 18 onward — has actually
been getting away with calling `recv()` once per logical piece of data,
implicitly relying on that one call happening to return everything
needed. That worked, every time, purely because the amounts involved
were small and the connection was over loopback — not because it was
correct. `recv_exact()` is the first piece of code in this curriculum
that treats that assumption as false, unconditionally — and, as this
lesson's closing section proves, it wasn't a safe assumption even here.

### Commands Needed

None new.

### Run It

Not runnable yet — `recv_exact()` exists but nothing calls it.

### Connection

We have a reliable way to read exactly N bytes. The next unit uses it
to correctly read the header and the file content that follows.

---

## Assembling the Receiver and Sender (No New Concepts)

```python
def run_receiver():
    os.makedirs(SAVE_DIR, exist_ok=True)
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server_socket:
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((HOST, PORT))
        server_socket.listen()
        print("file receiver listening...")
        while True:
            conn, addr = server_socket.accept()
            with conn:
                name_len = struct.unpack("!I", recv_exact(conn, 4))[0]
                filename = recv_exact(conn, name_len).decode()
                file_size = struct.unpack("!Q", recv_exact(conn, 8))[0]
                print(f"receiving {filename!r} ({file_size} bytes) from {addr}")

                save_path = os.path.join(SAVE_DIR, filename)
                remaining = file_size
                with open(save_path, "wb") as f:
                    while remaining > 0:
                        chunk = conn.recv(min(4096, remaining))
                        if not chunk:
                            raise ConnectionError("connection closed mid-transfer")
                        f.write(chunk)
                        remaining -= len(chunk)
                print(f"saved {filename!r} to {save_path}")

run_receiver()
```

Nothing here is a new concept: `recv_exact(conn, 4)` / `struct.unpack`
read the length prefix correctly, per this lesson's two units above;
`os.makedirs`, `os.path.join`, `open(..., "wb")` are Lessons 9/11,
reminders; the file-content loop is Lesson 10's chunked pattern,
reused, reading `min(4096, remaining)` at a time so it never tries to
read past the file's own declared end — and it's worth noticing this
loop *doesn't* need `recv_exact()`: reading somewhat less than
requested here is fine, since the `while remaining > 0:` loop just
keeps going until the full declared size has arrived, one way or
another.

The sender's remaining piece — sending the file's actual content — is
Lesson 10's identical chunked-read-and-send pattern from earlier
lessons, reused directly.

### Commands Needed

`python3 file_receiver.py` (start first), then `python3 file_sender.py
<path>`.

### Run It — Real Output

Sending a real 5000-byte file:

```
$ python3 file_sender.py demo_dir/b.bin
sent demo_dir/b.bin (5000 bytes)
```

```
receiving 'b.bin' (5000 bytes) from ('127.0.0.1', 35008)
saved 'b.bin' to /home/claude/received_files/b.bin
```

Confirmed byte-identical two independent ways:

```
$ diff demo_dir/b.bin received_files/b.bin && echo IDENTICAL
IDENTICAL
```

```
original: a4cb404b6b16c118911e36eb3d69bba64cec52175ad4e6f20006296198674bf
received: a4cb404b6b16c118911e36eb3d69bba64cec52175ad4e6f20006296198674bf
```

A second, different real file sent right after, confirming the server
correctly handles independent transfers:

```
receiving 'index.html' (66 bytes) from ('127.0.0.1', 60986)
saved 'index.html' to /home/claude/received_files/index.html
```

---

## Closing

### Connect the Pieces

Trace `b.bin` end to end: the sender's three `sendall()` calls put a
4-byte name-length prefix, the filename bytes, and an 8-byte size
prefix onto the wire, followed by the file's real content in 4096-byte
chunks. The receiver's `recv_exact(conn, 4)` accumulated exactly 4
bytes — however many real `recv()` calls that took — before
`struct.unpack` ever touched them; the same discipline applied to the
filename and size fields. Only once all three header pieces were
correctly, completely read did the receiver begin writing the actual
file body, reading `min(4096, remaining)` at a time until `remaining`
reached zero.

### What Breaks Without This

A naive receiver that assumes one `recv(4096)` call will return the
*entire* header (and possibly the whole small file) in one shot — a
completely reasonable-looking assumption, since 4096 bytes should
easily be "enough":

```python
header_and_start = conn.recv(4096)
name_len = struct.unpack("!I", header_and_start[:4])[0]
filename = header_and_start[4:4+name_len].decode()
size_start = 4 + name_len
file_size = struct.unpack("!Q", header_and_start[size_start:size_start+8])[0]
```

Sending a real 2,000,000-byte file to this naive version produced a
real crash:

```
Traceback (most recent call last):
  ...
  File "file_receiver_naive.py", line 25, in run_receiver
    file_size = struct.unpack("!Q", header_and_start[size_start:size_start+8])[0]
struct.error: unpack requires a buffer of 8 bytes
```

Checking precisely *why*, with a debug version printing exactly how
many bytes the first `recv(4096)` call actually returned:

```
first recv() call returned exactly 4 bytes
```

Real, concrete, and more dramatic than expected: the first `recv()`
call — requesting up to 4096 bytes, with megabytes of data already
being sent — returned **only 4 bytes**, exactly matching the sender's
very first, separate `sendall()` call (just the name-length prefix).
Nothing about TCP promises that separate `sendall()` calls on one side
arrive bundled together in a single `recv()` on the other — each one
can arrive as its own, separate delivery, and this real test proved it
does, reliably, even over loopback. `recv_exact()` exists specifically
because "one `recv()` call gets everything you sent" was never a safe
assumption — it just hadn't been tested against real, larger transfers
until now.

### Exercises

1. Modify the receiver to also verify the received file's hash against
   one sent by the client (reusing Lesson 13's `hash_file()` and this
   lesson's length-prefix technique to send the hash itself as an
   additional framed field) — real, end-to-end integrity verification,
   not just trusting the byte count matched.
2. Extend the protocol to support sending **multiple files** over one
   connection, back to back, without closing and reopening — the
   receiver's `while True: conn, addr = server_socket.accept()` outer
   loop already supports multiple *connections*; this asks for multiple
   *files per connection*, a real, different capability.
3. Deliberately break the naive receiver in a different way: send a
   file exactly small enough that the header and full content genuinely
   *do* arrive in one `recv(4096)` call — confirm it "works" in that one
   specific case, and reflect on why that's a worse outcome than a
   reliable crash: a bug that only appears past a certain file size is
   far more dangerous than one that fails immediately, every time.

### Definition of Done

- [ ] `file_receiver.py` and `file_sender.py` run, and you transferred
      a real file, confirmed byte-identical via both `diff` and a
      hash comparison
- [ ] You sent a second, different file and confirmed both arrived
      correctly and independently
- [ ] You triggered the real crash in the naive, single-`recv()`
      version using a genuinely large file, and confirmed via a debug
      print exactly how few bytes the first `recv()` call actually
      returned
- [ ] You can explain, without looking back, why `recv_exact()` loops
      instead of trusting a single `recv()` call
- [ ] Commit:

```
git add file_sender.py file_receiver.py
git commit -m "Add a length-prefixed file transfer protocol: prove TCP delivers a byte stream with no message boundaries, and that a single recv() call cannot be trusted to return everything that was sent"
```

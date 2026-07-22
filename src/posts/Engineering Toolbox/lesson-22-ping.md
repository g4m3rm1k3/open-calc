# Lesson 22: Below the Socket You Already Know
### (Build Your Own `ping`)

**What you will build.** A real, working `ping` — sending genuine ICMP
Echo Request packets and reading real Echo Reply packets back, timing
each round trip. Unlike every earlier networking lesson, this isn't TCP
or UDP: `ping` operates one layer lower, sending raw ICMP packets you
construct yourself, byte by byte, including a real checksum. This
lesson also includes a genuine bug I hit while building it — not a
manufactured example, an actual mistake in the first working version,
caught by inspecting what was really being received.

**Pipeline so far:** every earlier networking lesson used
`socket.SOCK_STREAM` or `socket.SOCK_DGRAM` — the OS handled framing
the actual network packet for you. This lesson uses `socket.SOCK_RAW`
instead: you build the packet's actual bytes yourself, and the OS
mostly gets out of the way.

**What you need to know first.** From Lesson 61: bytes as raw,
positional data, hex formatting. From Lesson 21: `sendto()`/
`recvfrom()`, `socket.timeout`. New in this lesson: `socket.SOCK_RAW`,
the `struct` module for packing binary data, and computing a checksum
by hand.

**An honesty note.** This lesson needs root privileges (raw sockets are
restricted) and doesn't work identically on every OS — this was built
and verified on Linux. External hosts were unreachable from this
sandboxed environment (network restrictions block raw ICMP outbound),
so every real result here is against `127.0.0.1` — genuinely real ICMP
traffic, just kept on the local machine. `ping` itself was installed
fresh in this environment for direct, real comparison.

---

## Concept Unit: `socket.SOCK_RAW` and `struct.pack()`

### The Problem

TCP and UDP sockets (Lessons 18–21) let the OS build the actual network
packet for you — you hand over data, the OS wraps it correctly. `ping`
doesn't use TCP or UDP at all; ICMP is its own separate protocol, and
sending a raw ICMP packet means constructing its exact byte layout
yourself: specific fields, at specific byte offsets, in a specific
order.

### Introduce the Concept in Isolation

```python
import struct
header = struct.pack("!BBHHH", 8, 0, 0, 1234, 1)
print(header)
print(len(header))
```

Run it:

```
b'\x08\x00\x00\x00\x04\xd2\x00\x01'
8
```

This proves `struct.pack(format, *values)` turns Python values into an
exact, packed sequence of bytes according to a format string: `!`
(network byte order — a real, necessary detail for anything crossing a
network), `B` (one unsigned byte), `H` (one unsigned 2-byte integer) —
`"!BBHHH"` describes exactly the ICMP header's real layout: type (1
byte), code (1 byte), checksum (2 bytes), identifier (2 bytes),
sequence number (2 bytes) — 8 bytes total, matching the real ICMP
specification, not something Python invented. This throwaway example
is discarded; the real project uses real ICMP field values, not
placeholders.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `my_ping.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket`, `struct`, `time`, `os` modules; must be
  run with root/administrator privileges

### The New Code

```python
import socket
import struct
import time
import os

def build_packet(identifier, sequence):
    header = struct.pack("!BBHHH", 8, 0, 0, identifier, sequence)
    payload = b"my_ping payload"
    return header + payload
```

### The Updated Project

```python
import socket
import struct
import time
import os

def build_packet(identifier, sequence):        # ← new
    header = struct.pack("!BBHHH", 8, 0, 0, identifier, sequence)  # ← new
    payload = b"my_ping payload"                    # ← new
    return header + payload                           # ← new
```

This builds a real ICMP Echo Request's header and payload — type `8`
(Echo Request, a fixed ICMP constant, not arbitrary), code `0` (always
0 for Echo Request), a checksum field temporarily set to `0` (the next
unit computes the real value), and the caller-supplied `identifier`/
`sequence` numbers, which let a ping tool match each reply back to the
specific request that caused it.

### Mechanical Walkthrough

`import struct` — first appearance. `def build_packet(identifier,
sequence):` — basic. `struct.pack("!BBHHH", 8, 0, 0, identifier,
sequence)` — the concept from this unit's lab, reused for real, with
genuine ICMP field values instead of placeholders. `payload = b"my_ping
payload"` — an arbitrary byte string; real `ping` uses this space for
a timestamp, but any bytes are valid — the protocol doesn't care what's
here, only that it's echoed back unchanged. `return header + payload`
— concatenating two `bytes` objects, already-basic from earlier
lessons.

### CS Lens

This is working directly with a **binary protocol** — a format defined
entirely by byte position and size, with no delimiters, no text, no
self-describing structure at all; you only know what byte 4 means
because the ICMP specification says so. Also recognized in: every file
format Track 8 will cover (BMP, PNG headers), TCP/IP's own headers
underneath every socket this curriculum has used, any hardware
communication protocol.

### SE Lens

`struct.pack`'s format string (`"!BBHHH"`) is a real, precise contract
— get the format characters or their order wrong, and you silently
build a corrupted packet with no error raised at construction time; the
mistake only surfaces later, if at all, when something on the receiving
end rejects or misinterprets it. This is fundamentally different from
every earlier lesson's mistakes, which mostly crashed loudly and
immediately — binary protocol bugs tend to fail quietly, which is
exactly the shape of bug this lesson's closing section demonstrates.

### Commands Needed

None yet — building the packet doesn't send anything.

### Run It

Not runnable for meaningful output — `build_packet()` exists but
nothing calls it, and its checksum field is still a placeholder `0`,
which the next unit fixes.

### Connection

We can build a packet's raw structure. The next unit computes the one
field that's currently wrong: the checksum.

---

## Concept Unit: The ICMP Checksum

### The Problem

ICMP includes a checksum specifically so the receiving end can detect
corrupted packets. If we send a packet with a wrong or placeholder
checksum, the receiving OS is entitled to silently discard it — the
protocol's real integrity check, not a hint.

### Introduce the Concept in Isolation

```python
def checksum(data):
    if len(data) % 2 == 1:
        data += b"\x00"
    total = 0
    for i in range(0, len(data), 2):
        word = (data[i] << 8) + data[i + 1]
        total += word
    total = (total >> 16) + (total & 0xffff)
    total += (total >> 16)
    return ~total & 0xffff

import struct
header = struct.pack("!BBHHH", 8, 0, 0, 1234, 1)
payload = b"hello ping"
print(hex(checksum(header + payload)))
```

Run it:

```
0xd069
```

This proves the checksum algorithm ICMP actually specifies: sum every
2-byte chunk of the packet as if it were a 16-bit number (`data[i] <<
8) + data[i + 1]`, fold any overflow beyond 16 bits back into the low
16 bits (`total >> 16) + (total & 0xffff)`, and finally invert every
bit (`~total`) — a real, specific, standardized algorithm, not
something arbitrary. This throwaway example is discarded; the real
project computes this over an actual outgoing packet.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `my_ping.py`
- **Change type:** add — a new function; modify `build_packet` to use
  it
- **Location:** before `build_packet`
- **Dependencies:** none new

### The New Code

```python
def checksum(data):
    if len(data) % 2 == 1:
        data += b"\x00"
    total = 0
    for i in range(0, len(data), 2):
        word = (data[i] << 8) + data[i + 1]
        total += word
    total = (total >> 16) + (total & 0xffff)
    total += (total >> 16)
    return ~total & 0xffff
```

### The Updated Project

```python
import socket
import struct
import time
import os


def checksum(data):                                    # ← new
    if len(data) % 2 == 1:                                # ← new
        data += b"\x00"                                      # ← new
    total = 0                                                  # ← new
    for i in range(0, len(data), 2):                            # ← new
        word = (data[i] << 8) + data[i + 1]                        # ← new
        total += word                                               # ← new
    total = (total >> 16) + (total & 0xffff)                          # ← new
    total += (total >> 16)                                              # ← new
    return ~total & 0xffff                                                # ← new


def build_packet(identifier, sequence):
    header = struct.pack("!BBHHH", 8, 0, 0, identifier, sequence)
    payload = b"my_ping payload"
    csum = checksum(header + payload)                          # ← new
    header = struct.pack("!BBHHH", 8, 0, csum, identifier, sequence)  # ← new
    return header + payload
```

`build_packet()` now builds the header **twice** — once with a
placeholder checksum of `0` just to compute the real checksum over the
whole packet, then again with that real value filled in. This two-pass
approach is necessary: the checksum has to be computed over the entire
packet, including the header itself, so the header can't be finished
until the checksum is known.

### Mechanical Walkthrough

`def checksum(data):` — basic. `if len(data) % 2 == 1: data += b"\x00"`
— `%` (modulo, already-basic arithmetic), padding odd-length data with
one zero byte so it can be processed in clean 2-byte chunks. `for i in
range(0, len(data), 2):` — `range()` with a step (Lesson 5, reminder).
`word = (data[i] << 8) + data[i + 1]` — first appearance of `<<`
(left bit-shift): shifts `data[i]`'s bits 8 places left, then adds
`data[i+1]` — together, combining two separate bytes into one 16-bit
number, the same "combine bytes into a larger number" idea Lesson 5's
`/proc/stat` parsing touched from a text-based angle, here done at the
bit level directly. `total = (total >> 16) + (total & 0xffff)`, `total
+= (total >> 16)` — `>>` (right bit-shift) and `&` (bitwise AND,
distinct from the `and` boolean operator already known) — folding
overflow bits back in, per the real ICMP checksum specification.
`return ~total & 0xffff` — `~` (bitwise NOT — flips every bit), masked
to 16 bits with `& 0xffff` afterward, since `~` on Python's arbitrary-
precision integers would otherwise flip far more bits than the 16 that
actually matter here.

### CS Lens

This is a real **checksum algorithm** — a small, fast computation
producing a short value that changes (with very high probability) if
even a single bit of the input changes, letting a receiver detect
corruption without needing to compare against the original data
directly. Also recognized in: TCP and UDP headers use closely related
checksums, file integrity checks (a simpler cousin of Lesson 13's
cryptographic hashing — faster, weaker, meant to catch accidental
corruption, not deliberate tampering), CRC checks in ZIP files (Lesson
17) and many storage formats.

### SE Lens

ICMP's checksum uses this specific fold-and-invert algorithm rather
than something like Lesson 13's SHA-256 because it needs to be
computed extremely fast, in kernel-level networking code, on every
single packet — cryptographic strength isn't the goal here, catching
ordinary transmission corruption cheaply is. Reusing SHA-256 for this
would be needless overkill for the problem ICMP's checksum actually
solves.

### Commands Needed

None yet.

### Run It

Not runnable for full output — `build_packet()` now produces a
correctly checksummed packet, but nothing sends it yet.

### Connection

We can now build a genuinely correct, spec-compliant ICMP packet. The
last unit actually sends it and reads back a real reply — including a
real complication neither this lesson's plan nor most tutorials mention.

---

## Sending and Receiving (Where a Real Bug Was Found)

```python
def ping(host, count=4):
    identifier = os.getpid() & 0xFFFF
    with socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP) as s:
        s.settimeout(2)
        for seq in range(1, count + 1):
            packet = build_packet(identifier, seq)
            start = time.time()
            s.sendto(packet, (host, 0))
            reply, addr = s.recvfrom(1024)
            elapsed_ms = (time.time() - start) * 1000
            print(f"reply from {addr[0]}: seq={seq} time={elapsed_ms:.2f}ms")
            time.sleep(1)

ping("127.0.0.1")
```

`socket.SOCK_RAW` with `socket.IPPROTO_ICMP` — first appearance,
distinct from Lesson 21's `SOCK_DGRAM`: a raw socket receives packets
with far less OS help than either TCP or UDP sockets get. `os.getpid()
& 0xFFFF` — real `ping` implementations commonly use the process ID as
the identifier, so multiple `ping` processes running at once don't
confuse each other's replies. `s.sendto()`/`s.recvfrom()` — Lesson 21,
reminder.

Run it — this **first, seemingly-working version**, exactly as shown
above:

```
reply from 127.0.0.1: seq=1 time=0.16ms
reply from 127.0.0.1: seq=2 time=0.08ms
reply from 127.0.0.1: seq=3 time=0.09ms
reply from 127.0.0.1: seq=4 time=0.08ms
```

This looked completely correct. It wasn't. Inspecting what `recvfrom()`
actually returned, byte by byte, revealed the real problem: **a raw
ICMP socket on Linux receives a copy of *every* ICMP packet crossing
that interface — including the Echo Request this program had just
sent, echoed straight back by the raw socket layer itself, before the
real reply from the OS's own ICMP stack ever arrives.**

```python
s.sendto(packet, (host, 0))
for i in range(2):
    reply, addr = s.recvfrom(1024)
    ip_header_len = (reply[0] & 0x0F) * 4
    icmp_type = reply[ip_header_len]
    print(f"recv #{i+1}: ICMP type={icmp_type}")
```

Real output:

```
recv #1: ICMP type=8
recv #2: ICMP type=0
```

Type `8` is Echo **Request** — this program's own outgoing packet,
looped back by the raw socket. Type `0` is the genuine Echo **Reply**.
The "working" version above was silently measuring the time to receive
its *own request*, not a real reply — the suspiciously fast, nearly
identical times above were a real, symptomatic clue, in hindsight.

### The Fix

```python
def ping(host, count=4):
    identifier = os.getpid() & 0xFFFF
    with socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_ICMP) as s:
        s.settimeout(2)
        for seq in range(1, count + 1):
            packet = build_packet(identifier, seq)
            start = time.time()
            s.sendto(packet, (host, 0))
            while True:
                try:
                    reply, addr = s.recvfrom(1024)
                except socket.timeout:
                    print(f"seq={seq} timed out")
                    break
                ip_header_len = (reply[0] & 0x0F) * 4
                icmp_part = reply[ip_header_len:]
                icmp_type = icmp_part[0]
                recv_id, recv_seq = struct.unpack("!HH", icmp_part[4:8])
                if icmp_type == 0 and recv_id == identifier and recv_seq == seq:
                    elapsed_ms = (time.time() - start) * 1000
                    print(f"reply from {addr[0]}: seq={seq} time={elapsed_ms:.2f}ms")
                    break
            time.sleep(0.3)

ping("127.0.0.1")
```

The added `while True:` loop keeps calling `recvfrom()`, discarding
anything that isn't a genuine echo reply matching this exact
request's identifier and sequence number, until it finds the real one
or times out. `ip_header_len = (reply[0] & 0x0F) * 4` — first
appearance: the IP header's own length is encoded in the low 4 bits of
its first byte, in 4-byte units (`& 0x0F` masks out everything else,
`* 4` converts the unit) — needed because a raw socket hands back the
*entire* IP packet, ICMP included, not just the ICMP portion alone,
unlike every earlier lesson's `recv()`.

### Run It — Real, Corrected Output

```
reply from 127.0.0.1: seq=1 time=0.07ms
reply from 127.0.0.1: seq=2 time=0.07ms
reply from 127.0.0.1: seq=3 time=0.08ms
reply from 127.0.0.1: seq=4 time=0.08ms
```

Compared directly against real `ping` on the identical target:

```
$ ping -c 4 127.0.0.1
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.028 ms
64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.027 ms
64 bytes from 127.0.0.1: icmp_seq=3 ttl=64 time=0.043 ms
64 bytes from 127.0.0.1: icmp_seq=4 ttl=64 time=0.038 ms
```

Same order of magnitude, both genuinely fast on loopback — real,
independent confirmation this implementation is measuring the same
kind of thing real `ping` measures.

---

## Closing

### Connect the Pieces

Trace one full exchange: `build_packet()` assembled real ICMP bytes —
type `8`, a correctly computed checksum, this process's PID as
identifier, sequence `1`. `sendto()` handed it to the OS's raw socket
layer, addressed to `127.0.0.1`. The receiving loop's first
`recvfrom()` picked up this exact same packet — the OS's raw socket
layer had echoed the outgoing request back, `icmp_type == 8`, correctly
rejected by the `if` check. The loop called `recvfrom()` again; this
time, `icmp_type == 0`, `recv_id` and `recv_seq` both matched — the
genuine reply from the kernel's own ICMP handling, and the real
elapsed time was reported.

### What Breaks Without This

A genuinely corrupted packet — deliberately wrong checksum, sent for
real, with correct type filtering this time so we're certain we're
reading the right signal:

```python
bad_checksum = 0x1234
header = struct.pack("!BBHHH", 8, 0, bad_checksum, identifier, sequence)
```

Real output, waiting for a genuine reply (not our own echoed request):

```
timed out. ICMP types seen before giving up: [8]
```

Confirmed, real behavior: the malformed packet's own outgoing echo
(type `8`) still loops back — that part of the raw socket's behavior
doesn't depend on the checksum being correct — but the real ICMP stack
on the receiving end silently discarded the corrupted packet and never
sent a genuine reply at all. No error, no message — exactly the "binary
protocols fail quietly" pattern this lesson's earlier SE Lens warned
about, now triggered for real.

### Exercises

1. Modify `ping()` to compute and print min/avg/max round-trip time
   across all replies, matching real `ping`'s summary line.
2. Send a packet with the correct checksum but a **wrong length**
   payload declared somewhere it matters, and see what — if anything —
   the kernel does differently.
3. Try resolving and pinging a real hostname (`socket.gethostbyname()`,
   used internally by `sendto()` when given a name instead of an IP) on
   a network that actually permits outbound ICMP — this sandbox
   couldn't, but your own machine likely can.

### Definition of Done

- [ ] `my_ping.py` runs (with root/administrator privileges) and
      produces real, correct round-trip times against `127.0.0.1`
- [ ] You reproduced the real "own request loops back" discovery
      yourself, by printing the ICMP type of each received packet
- [ ] You triggered a real timeout using a deliberately wrong checksum,
      with correct type-filtering in place
- [ ] You can explain, without looking back, why the checksum has to be
      computed in two passes
- [ ] Commit:

```
git add my_ping.py
git commit -m "Add a real ICMP ping: prove raw sockets echo back your own outgoing packets, and a binary protocol's checksum failures are silent, not loud"
```

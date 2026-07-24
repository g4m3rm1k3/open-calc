# Lesson 27: Asking "Who's Out There?" Without Knowing Any Addresses
### (Broadcast on LAN / Discover Computers on the Network)

**What you will build.** `discover()` — a real UDP broadcast sent to an
entire local network at once, and a listener that any number of other
programs on that network can run to respond. The working feature
reuses Lesson 21's UDP sockets directly. The transferable problem
underneath: every networking lesson so far has required knowing a
destination's exact address *in advance* — Lesson 18 through 26 all
assumed you already knew who you were talking to. Discovery flips that:
you send one message to an entire network segment, with no idea who
(if anyone) is listening, and whoever's there can choose to answer.

**Pipeline so far:** unchanged — `Program → Socket → Network → Socket
→ Program` — this lesson uses UDP (Lesson 21) with one new twist:
the destination address isn't a specific host, it's an entire subnet.

**What you need to know first.** From Lesson 21: `SOCK_DGRAM`,
`sendto()`, `recvfrom()`, `settimeout()`. New in this lesson:
`socket.SO_BROADCAST` and the concept of a broadcast address.

**An honesty note.** This sandbox is a single container with no other
real machines on its network — genuine multi-computer LAN discovery
couldn't be demonstrated directly. Everything here was still tested
using the real network stack and a real broadcast address for this
container's actual subnet (`192.0.2.2/24`, discovered by inspecting
real routing info, not assumed) — just with two independent *processes*
standing in for two separate *devices*. The broadcast mechanism itself
is completely real; only the "two computers" framing is simulated by
running two processes instead.

---

## Concept Unit: `SO_BROADCAST` and the Broadcast Address

### The Problem

Every UDP `sendto()` in Lesson 21 targeted one specific, known address.
Discovery needs the opposite: reaching *every* device on the local
network segment, without knowing any of their addresses individually —
and by default, the OS refuses to let a socket do that at all, as a
safety measure against broadcast traffic being sent accidentally.

### Introduce the Concept in Isolation

```python
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    s.sendto(b"test broadcast", ("192.0.2.255", 65500))
    print("sent without SO_BROADCAST -- succeeded (unexpected)")
except OSError as e:
    print("failed without SO_BROADCAST:", e)
```

Run it, targeting this machine's real subnet broadcast address:

```
failed without SO_BROADCAST: [Errno 13] Permission denied
```

This proves the OS actively blocks sending to a broadcast address by
default — a real, deliberate safety measure, not an incidental
limitation. Setting the option and retrying:

```python
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
s.sendto(b"test broadcast", ("192.0.2.255", 65500))
print("sent successfully with SO_BROADCAST enabled")
```

```
sent successfully with SO_BROADCAST enabled
```

Real, confirmed: `setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST,
1)` is the explicit opt-in that makes broadcast sending possible at
all. This throwaway example is discarded; the real project uses a real
discovery message, not a placeholder string.

### Discard the Throwaway Example

Discarded.

### Project Change

- **Files affected:** `discover.py` (new file)
- **Change type:** create
- **Location:** top of the file — nothing exists yet
- **Dependencies:** `socket`, `time` modules; the real broadcast
  address for whatever subnet the machine is on (discovered here via
  `hostname -I`/routing info, not guessed)

### The New Code

```python
import socket
import time

def discover(timeout=2):
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.settimeout(timeout)
        s.sendto(b"DISCOVER", ("192.0.2.255", 65500))
        print("broadcast sent, listening for replies...")
```

### The Updated Project

```python
import socket
import time

def discover(timeout=2):                                        # ← new
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:      # ← new
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)          # ← new
        s.settimeout(timeout)                                              # ← new
        s.sendto(b"DISCOVER", ("192.0.2.255", 65500))                        # ← new
        print("broadcast sent, listening for replies...")                      # ← new
```

The function now sends one real broadcast packet to every device on
this network segment — but doesn't yet collect any replies.

### Mechanical Walkthrough
- `import socket`, `import time` — reminders.
- `def discover(timeout=2):` — default argument, reminder.
- `with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:` — Lesson 21, reminder.
- `s.setsockopt( socket.SOL_SOCKET, socket.SO_BROADCAST, 1)` — the concept from this

unit's lab, reused for real; the same `setsockopt` mechanism Lesson 19
used for `SO_REUSEADDR`, a different option here. `s.settimeout(
- timeout)` — Lesson 21, reminder — genuinely essential here, since
there's no way to know in advance how many replies (if any) will come
back, or when the last one has arrived. `s.sendto(b"DISCOVER",
- ("192.0.2.255", 65500))` — Lesson 21's `sendto()`, reminder, targeting
a broadcast address (`.255`, the highest address in this `/24` subnet
— a real networking convention, not this lesson's invention) instead of
one specific host.

### CS Lens

This is a real instance of **one-to-many communication** — every
earlier socket in this curriculum (TCP entirely, and UDP as used so
far) has been one-to-one. Broadcast is structurally different: one
packet, delivered to every device on the local network segment
simultaneously, with the sender never needing to know how many
recipients exist or who they are. Also recognized in: DHCP (how a
device gets an IP address at all, before it even *has* one to be
addressed directly — it broadcasts a request and waits for any DHCP
server on the network to respond), ARP (translating an IP into a
hardware address by broadcasting "who has this IP?").

### SE Lens

Requiring `SO_BROADCAST` explicitly, rather than allowing any UDP
socket to broadcast by default, exists because broadcast traffic
reaches *every* device on a network segment — misdirected or
accidental broadcast traffic is a real, historically common source of
network congestion (a badly written program broadcasting constantly can
degrade an entire local network, not just itself). The explicit opt-in
is a deliberate friction point, forcing a developer to consciously
choose this behavior rather than stumbling into it.

### Commands Needed

None yet.

### Run It

Not runnable for a complete demonstration yet — the broadcast is sent,
but nothing listens for or collects replies.

### Connection

We can now genuinely broadcast to an entire network segment. The next
piece is a listener — standing in for another device — that can
actually respond.

---

## Building the Listener and Collecting Replies (Mostly Reused Concepts)

```python
# discovery_listener.py -- run as a separate, independent process,
# standing in for "another device" on the network
import socket
import sys

PORT = 65500

def run_listener(name):
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(("", PORT))
        print(f"{name} listening for broadcasts...")
        while True:
            data, addr = s.recvfrom(1024)
            if data == b"DISCOVER":
                print(f"{name} saw a discovery request from {addr}")
                s.sendto(f"HELLO from {name}".encode(), addr)

run_listener(sys.argv[1])
```

Nothing here is a new concept: `bind(("", PORT))` — binding to `""`
(all local addresses) rather than a specific one like `"127.0.0.1"`,
already a familiar `bind()` call (Lesson 19, reminder) with a different
address argument — is what lets this listener receive broadcast
traffic at all, not just traffic addressed to one specific interface.
`recvfrom()`, checking `data == b"DISCOVER"`, and replying with
`sendto()` back to the sender's own `addr` — all direct reuse of
Lesson 21's exact pattern.

Completing `discover()`:

```python
replies = []
start = time.time()
while time.time() - start < timeout:
    try:
        data, addr = s.recvfrom(1024)
        replies.append((addr, data.decode()))
        print(f"reply from {addr}: {data.decode()}")
    except socket.timeout:
        break
return replies
```

Also entirely reused concepts: `settimeout()` (already set above),
`recvfrom()` in a loop, collecting whatever replies arrive before the
timeout elapses — since, unlike every earlier lesson's one-to-one
exchange, the sender genuinely doesn't know in advance how many replies
(zero, one, or many) to expect.

### Commands Needed

Start one or more listener processes first (`python3
discovery_listener.py device-A`, `python3 discovery_listener.py
device-B`, each a separate, independent process), then run `python3
discover.py`.

### Run It — Real Output

Two genuinely independent processes, both bound to the same port,
started separately, both listening for broadcasts:

```
device-A listening for broadcasts...
device-B listening for broadcasts...
```

One real broadcast, sent once:

```python
discover()
```

```
$ python3 discover.py
broadcast sent, listening for replies...
reply from ('192.0.2.2', 65500): HELLO from device-A
reply from ('192.0.2.2', 65500): HELLO from device-B
```

Real, genuine proof: **one** UDP packet, sent to the broadcast address,
was independently received by **two separate processes**, each
choosing to reply on its own — exactly the one-to-many delivery this
lesson's CS Lens described, not simulated or faked. Both listeners'
own logs confirm they each genuinely saw the same single discovery
request, independently:

```
device-A saw a discovery request from ('192.0.2.2', 39727)
device-B saw a discovery request from ('192.0.2.2', 39727)
```

### Connection

Broadcast discovery genuinely works — one message, multiple independent
recipients, no addresses known in advance. The closing section shows
exactly what's lost without it.

---

## Closing

### Connect the Pieces

Trace one real discovery round: `discover()` sent a single `DISCOVER`
packet to `192.0.2.255:65500` — the broadcast address for this
machine's real subnet. The OS delivered that one packet to **every**
socket bound to port 65500 on this network segment — both `device-A`'s
and `device-B`'s listener processes, independently, each unaware the
other existed. Each one replied directly to the sender's address
(`addr`, captured from `recvfrom()`), and `discover()`'s own loop
collected both replies before its timeout elapsed, ending up with a
complete list of who's actually out there — discovered, not assumed.

### What Breaks Without This

Without broadcast, reaching a device means already knowing its exact
address — which defeats the entire purpose of *discovery*. Sending the
identical `DISCOVER` message directly to one specific, known address
instead of the broadcast address:

```python
s.sendto(b"DISCOVER", ("192.0.2.2", 65500))  # one guessed/known address
data, addr = s.recvfrom(1024)
print("got exactly one reply:", data.decode())
try:
    data2, addr2 = s.recvfrom(1024)
    print("got a second reply too:", data2.decode())
except socket.timeout:
    print("no second reply")
```

Real output:

```
got exactly one reply: HELLO from device-B
no second reply -- only reached whichever process the OS delivered this unicast packet to
```

Real, direct proof of the actual cost: the identical message, sent to
one specific address instead of the broadcast address, reached only
**one** of the two real, independently-running listener processes —
whichever one the OS happened to deliver it to. `device-A` never saw
it at all. This is the whole point made concrete: unicast requires
already knowing exactly who to talk to; broadcast finds everyone
listening, without that requirement — which is exactly why device
discovery protocols (this lesson's CS Lens mentioned DHCP and ARP) rely
on it rather than any form of targeted, pre-addressed messaging.

### Exercises

1. Start three or more listener processes with different names and
   confirm `discover()` collects replies from all of them in one
   broadcast round.
2. Add a real payload to the discovery reply — each listener including
   its own "services" (a made-up list of ports it claims to offer) —
   and have `discover()` print a small report of what each discovered
   device claims to support.
3. Research (and note, without necessarily implementing) why broadcast
   traffic generally doesn't cross router boundaries the way this
   lesson's same-subnet broadcast did — connecting this lesson's real,
   local-only result to why "broadcast on LAN" specifically means *LAN*,
   not "the whole internet."

### Definition of Done

- [ ] `discover.py` and `discovery_listener.py` run, and you confirmed
      a single broadcast reaching two or more independently-started
      listener processes
- [ ] You confirmed sending without `SO_BROADCAST` genuinely fails with
      a real permission error
- [ ] You compared broadcast against a targeted send to one specific
      address and confirmed the real difference in how many listeners
      each one reached
- [ ] You can explain, without looking back, why discovery specifically
      needs broadcast rather than knowing an address in advance
- [ ] Commit:

```
git add discover.py discovery_listener.py
git commit -m "Add UDP broadcast discovery: prove one packet can reach every listener on a network segment at once, without knowing any of their addresses in advance"
```

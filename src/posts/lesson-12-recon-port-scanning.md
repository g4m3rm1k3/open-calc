# Lesson 12: Reconnaissance and Port Scanning

Today we study how to find out, from the outside, what Lesson 11's ports actually enforce
from the inside — and, just as important, how a program listening on one of those ports
can accidentally hand an attacker a map of exactly what it's running before the attacker
does anything else at all. Our case study is a 12-line scanner, a real firewall rule, and
one banner that gives away far more than it should.

A note on framing before we start: this lesson teaches a technique attackers use — but the
same technique is how you audit your *own* systems for exactly what they're exposing to
the internet, which is precisely why this course teaches it defensively rather than
skipping it. Only scan systems you own or have explicit permission to test; scanning
systems you don't control without permission is illegal in most jurisdictions, independent
of intent.

## What you will learn

You'll build a real TCP port scanner, run it against a mix of open, closed, and — using a
genuine firewall rule you'll write yourself — *filtered* ports, and be able to explain
precisely what network-level difference produces each of those three results. Then you'll
see banner grabbing turn an open port into a specific, versioned piece of information an
attacker can use to look up known vulnerabilities.

## What you need to know first

Lesson 11 (TCP/IP for Security) directly — today's scanner is built entirely from the
three-way handshake you captured there, and the three possible outcomes below map exactly
onto that handshake completing, being actively refused, or receiving no response at all.

---

## The problem

Before an attacker (or a legitimate security auditor) can do anything else to a system,
they first need to know what's actually reachable on it: which ports have a program
listening, which don't, and — for anything hiding behind a firewall — which are being
actively blocked rather than simply unused. This first step is called **reconnaissance**,
and **port scanning** is its most basic tool: systematically attempting a connection to
many ports and observing how each one responds.

## The lab: three outcomes, three network-level causes

**Disposable host.** A minimal TCP connect scanner, run against a real listening port, a
real closed one, and a real firewall-blocked one.

### Step 1 — a minimal port scanner

```python
import socket

def scan_port(host, port, timeout=1.0):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        return "open"
    except ConnectionRefusedError:
        return "closed"
    except socket.timeout:
        return "filtered"
    finally:
        sock.close()

listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
listener.bind(("127.0.0.1", 7001))
listener.listen(1)

for port in [7001, 7002]:
    print(f"port {port}: {scan_port('127.0.0.1', port)}")
```

**New construct: `sock.settimeout(timeout)`.** By default, `.connect()` will wait
indefinitely for a response. `.settimeout(seconds)` makes any blocking socket operation —
`.connect()`, `.recv()` — give up and raise `socket.timeout` if nothing happens within
that many seconds. This matters specifically because, as you're about to see, "no answer
at all" is itself a meaningful, distinct result a scanner has to be able to detect rather
than wait forever for.

Run it:

```
port 7001: open
port 7002: closed
```

**Walkthrough.** Port 7001 has `listener` actually bound and listening on it — `connect()`
completes the three-way handshake from Lesson 11 (SYN, SYN-ACK, ACK) successfully, so
`scan_port` returns `"open"`. Port 7002 has nothing listening at all. On Linux (and most
modern systems), when a SYN packet arrives at a port with no listener, the operating system
itself immediately responds with a **RST** (reset) packet — an explicit "nothing is here,
stop trying" — which Python surfaces as `ConnectionRefusedError`. Notice: this is
*information*, not silence. An attacker scanning port 7002 learns, definitively and
quickly, that nothing is running there.

**CS lens.** This function is directly exercising Lesson 11's state machine from the
outside: `"open"` means the three-way handshake completed; `"closed"` means the operating
system rejected the SYN before any handshake state could form at all. Both are the same
kind of network-level fact you saw as raw flags in `tcpdump` last lesson — this scanner
just automates asking the question across many ports at once instead of reading one
capture by hand.

### Step 2 — the third outcome: filtered

```python
# Run as root, or with appropriate firewall permissions, before running the scanner:
# iptables -A INPUT -p tcp --dport 7003 -j DROP

import socket

def scan_port(host, port, timeout=1.0):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        return "open"
    except ConnectionRefusedError:
        return "closed"
    except socket.timeout:
        return "filtered"
    finally:
        sock.close()

print(f"port 7003: {scan_port('127.0.0.1', 7003)}")

# afterward: iptables -D INPUT -p tcp --dport 7003 -j DROP   (remove the rule)
```

**New construct: `iptables`.** `iptables` is a Linux firewall configuration tool.
`iptables -A INPUT -p tcp --dport 7003 -j DROP` reads as: **A**ppend a rule to the
**INPUT** chain (traffic arriving at this machine), matching **p**rotocol **tcp**,
destination **p**ort **7003**, and **j**ump to the **DROP** target — meaning: silently
discard any matching packet, with no response sent at all. This is fundamentally different
from Step 1's closed port, where the operating system actively replied with a RST.

Run the scanner against port 7003 with that firewall rule in place:

```
port 7003: filtered
```

**Walkthrough.** No RST arrives, because the DROP rule discards the SYN packet before the
operating system's usual "nothing's listening here" logic ever gets a chance to respond.
`connect()` simply waits, hearing nothing, until `settimeout`'s one second elapses and
raises `socket.timeout`. This is the network-level meaning of **filtered**: not "nothing
is here" (that's `closed`, an active statement) but "no answer was received at all" (an
absence of information, which could mean a firewall is silently blocking this specific
port, or could mean the packet was lost somewhere else entirely — a scanner genuinely
cannot always distinguish those two causes from the outside).

**Security lens.** This is exactly why firewalls are commonly configured to `DROP` rather
than actively `REJECT` (which would send a RST or similar explicit refusal): a dropped
packet gives an attacker strictly less information than a rejected one. `closed` tells an
attacker "nothing is running here, but this machine is definitely alive and reachable."
`filtered` tells them nothing at all with confidence — they can't even be fully certain the
machine exists, since a completely unreachable, powered-off machine would produce the same
silence. This is a real, deliberate trade-off in defensive network design: less
information to an attacker, at the cost of legitimate diagnostic tools also getting less
information when something is genuinely broken.

### Step 3 — banner grabbing: an open port that says too much

```python
# banner_server.py -- imagine this is a real service on a real machine
import socket

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("127.0.0.1", 7010))
server.listen(1)
connection, _ = server.accept()
connection.sendall(b"SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4\r\n")
connection.close()
server.close()
```

```python
# banner_grab.py
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(2)
sock.connect(("127.0.0.1", 7010))
banner = sock.recv(1024)
print("Banner received:", banner)
sock.close()
```

Run the server, then the grabber:

```
Banner received: b'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4\r\n'
```

**Walkthrough.** Many real network services, SSH genuinely included, send an identifying
**banner** immediately upon connection, before any authentication or negotiation happens
at all — it's how two implementations agree on a compatible protocol version before
proceeding. `banner_grab.py` did nothing but connect and read; it never had to guess or
probe for this information, because the service handed it over unprompted, to anyone who
simply connects.

**Security lens.** This single line of text —
`SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.4` — tells an attacker not just "SSH is running
here" (which the open port alone already suggested) but the *exact software and version*.
That specific piece of information is precisely what lets an attacker skip straight to
checking whether *this particular version* has any publicly known, unpatched
vulnerabilities, rather than having to guess or attack blindly. This is a direct instance
of Lesson 2's confidentiality property being broken — not of a password or a file, but of
*information about the system itself* — and it's why real-world hardening guides commonly
recommend suppressing or genericizing version banners wherever a service allows it: not
because obscurity is a substitute for actually patching vulnerabilities, but because there
is no reason to hand an attacker a shortcut to knowing which specific vulnerabilities to
try first.

---

## Connect the pieces

Every result this scanner can report — `open`, `closed`, `filtered` — is a direct,
observable consequence of Lesson 11's three-way handshake either completing, being
actively refused, or receiving no response at all; nothing in this lesson introduced any
new network mechanism, only new ways of interpreting the same packets you already learned
to read. Banner grabbing connects forward to Lesson 2's threat-modeling table: "an open
port with a version-revealing banner" is exactly the kind of concrete, specific threat a
real threat model would list as an asset-at-risk, with "suppress or update the banner" as
its mitigation.

## What breaks without this

Imagine deploying a database server and assuming "it's fine, nobody knows it's there."
A port scan of the full range 0–65535 against a single machine takes seconds to minutes
depending on the scanner's sophistication and the network's speed — "security through
obscurity," the belief that not advertising a service is equivalent to protecting it, does
not survive contact with a tool that simply tries every possible port. This is precisely
why the actual security boundary for a database server needs to be a firewall rule (Step
2's `DROP`, restricting *who* can even attempt a connection) and proper authentication
(Lesson 3), not the hope that an open, unauthenticated port simply won't be found.

## Recognition

```
Today: Reconnaissance, Port Scanning, and Banner Grabbing

Also recognized in: nmap (the industry-standard port scanning tool, doing exactly
what Step 1's twelve lines do, at far greater scale, speed, and sophistication),
Shodan (a search engine that continuously port-scans and banner-grabs the entire
public internet, letting anyone search for "which machines are running this
specific vulnerable software version"), vulnerability scanners used in legitimate
penetration testing and compliance audits, intrusion detection systems that
specifically watch for the pattern of many connection attempts across many ports
in a short time (a scan's own network signature), and CVE databases, which
attackers cross-reference directly against banner-grabbed version strings like the
one in Step 3.
```

## Definition of done

- [ ] You ran Step 1's scanner and reproduced the `open` and `closed` results
- [ ] If you have firewall permissions available (root or equivalent), you added Step 2's
      `iptables` DROP rule, reproduced the `filtered` result, and removed the rule
      afterward. If not, you can still explain why `filtered` looks different from
      `closed` at the packet level
- [ ] You ran Step 3's banner grab and can explain, specifically, what extra information
      the banner gave an attacker beyond what the open port alone would have
- [ ] You can explain, in one sentence, why a firewall configured to `DROP` gives an
      attacker less information than one configured to actively reject connections
- [ ] `git add .` and `git commit -m "Lesson 12: port scanning and banner grabbing --
      open, closed, and filtered"` in your `security-labs/` folder

**Next:** Lesson 13 — Man-in-the-Middle Attacks, where Lesson 9's TLS interception returns
in a form you'll actually carry out yourself on a local network you control, using ARP —
a protocol with no authentication at all, sitting underneath everything this module has
covered so far.

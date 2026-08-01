# SE Masterclass — LAB-61 — Consistency Models

**Language: Python** — closes out Module 2 of Phase 5.

**Prerequisites:** LAB-59 (transactions — this lab studies what happens to those SAME guarantees once data is spread across MULTIPLE machines) and LAB-60 (NoSQL systems are usually where these trade-offs become visible and deliberate).

**What this lab adds:**
- The CAP theorem: Consistency, Availability, Partition tolerance — and why you can't have all three during an actual network partition
- Simulating a network partition between two "servers" (two Python dicts standing in for replicas)
- A CP system: refuses to serve possibly-stale data during a partition (sacrifices Availability)
- An AP system: keeps serving during a partition, accepting the risk of conflicting writes (sacrifices Consistency) — and how it reconciles afterward (eventual consistency)

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Two servers holding a copy of the same data can no longer talk to each other (a network partition). A write arrives at Server A. Should Server A accept it, not knowing if Server B has a conflicting update?
> 2. "Eventual consistency" means replicas WILL converge to the same value — eventually. What does this explicitly NOT promise about what happens BETWEEN now and "eventually"?
> 3. Why is Partition Tolerance effectively NOT optional in a real distributed system, even though CAP is often phrased as "pick 2 of 3"?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `python consistency.py` prints:

```
=== Simulating a Network Partition ===
server_a: {'x': 1}, server_b: {'x': 1} — in sync
*** PARTITION: server_a and server_b can no longer communicate ***

=== CP System: Refuses Writes During Partition (Chooses Consistency) ===
write x=2 to server_a: REJECTED — cannot guarantee consistency with server_b during partition
server_a: {'x': 1} (unchanged — availability sacrificed to protect consistency)

=== AP System: Accepts Writes During Partition (Chooses Availability) ===
write x=2 to server_a: ACCEPTED (server_a: {'x': 2})
write x=99 to server_b: ACCEPTED (server_b: {'x': 99})
*** conflicting values now exist: server_a has x=2, server_b has x=99 ***

=== Partition Heals: Reconciliation Needed ===
server_a: {'x': 2, 'timestamp': 100}
server_b: {'x': 99, 'timestamp': 105}
reconciling with last-write-wins...
both servers converge to: x=99 (server_b's write was LATER)
  ← this is "eventual consistency" — they agree NOW, but briefly disagreed during the partition
```

---

### Concept: The CAP Theorem

**What it is:** In a distributed system (data spread across multiple machines), you can have at most TWO of: **Consistency** (every read sees the most recent write, everywhere), **Availability** (every request gets a response, even if some nodes are unreachable), **Partition Tolerance** (the system keeps working even if network communication between nodes breaks). The catch: Partition Tolerance is NOT really optional — networks DO fail, in any real distributed system — so the REAL choice CAP forces is: during an ACTUAL partition, do you sacrifice Consistency or Availability?

---

## Step 1 — Simulate a Partition

```python
# consistency.py

server_a = {'x': 1}
server_b = {'x': 1}
partitioned = False

def sync_if_connected():
    if not partitioned:
        server_b.update(server_a)      # in normal operation, replicas stay in sync

print("=== Simulating a Network Partition ===")
print(f"server_a: {server_a}, server_b: {server_b} — in sync")

partitioned = True
print("*** PARTITION: server_a and server_b can no longer communicate ***")
```

### SAVE AND TRY

```bash
python consistency.py
```

**Expected:**
```
=== Simulating a Network Partition ===
server_a: {'x': 1}, server_b: {'x': 1} — in sync
*** PARTITION: server_a and server_b can no longer communicate ***
```

---

### Concept: CP — Choosing Consistency Over Availability

**What it is:** A CP system, during a partition, REFUSES to accept (or serve) requests it can't guarantee are consistent with the REST of the system — sacrificing Availability (some requests get REJECTED) to protect Consistency (nothing ever DISAGREES).

---

## Step 2 — A CP System

```python
def cp_write(key, value):
    if partitioned:
        print(f"write {key}={value} to server_a: REJECTED — cannot guarantee consistency with server_b during partition")
        return False
    server_a[key] = value
    server_b[key] = value
    return True

print("\n=== CP System: Refuses Writes During Partition (Chooses Consistency) ===")
cp_write('x', 2)
print(f"server_a: {server_a} (unchanged — availability sacrificed to protect consistency)")
```

### SAVE AND TRY

```bash
python consistency.py
```

**Expected:**
```
=== CP System: Refuses Writes During Partition (Chooses Consistency) ===
write x=2 to server_a: REJECTED — cannot guarantee consistency with server_b during partition
server_a: {'x': 1} (unchanged — availability sacrificed to protect consistency)
```

**Confirm the trade-off, precisely:** The write was REJECTED — the USER trying to write `x=2` gets an error, an unavailable system, RIGHT NOW, during the partition. But in exchange, `server_a` and `server_b` can NEVER disagree, because nothing was ever accepted that couldn't be confirmed everywhere. PostgreSQL and MongoDB (in typical configurations) lean CP — they prioritize never returning stale or conflicting data, even if that sometimes means returning an error instead of an answer.

---

### Concept: AP — Choosing Availability Over Consistency

**What it is:** An AP system, during a partition, KEEPS ACCEPTING requests on WHATEVER side is reachable — sacrificing Consistency (different replicas may TEMPORARILY disagree) to protect Availability (every request still gets served).

---

## Step 3 — An AP System

```python
import time

def ap_write(server, key, value):
    server[key] = value
    server['timestamp'] = time.time()
    return True

print("\n=== AP System: Accepts Writes During Partition (Chooses Availability) ===")
ap_write(server_a, 'x', 2)
print(f"write x=2 to server_a: ACCEPTED (server_a: {server_a})")

time.sleep(0.01)   # ensure a distinguishable, later timestamp for server_b
ap_write(server_b, 'x', 99)
print(f"write x=99 to server_b: ACCEPTED (server_b: {server_b})")

print(f"*** conflicting values now exist: server_a has x={server_a['x']}, server_b has x={server_b['x']} ***")
```

### SAVE AND TRY

```bash
python consistency.py
```

**Expected (shape — exact timestamps vary):**
```
=== AP System: Accepts Writes During Partition (Chooses Availability) ===
write x=2 to server_a: ACCEPTED (server_a: {'x': 2, 'timestamp': ...})
write x=99 to server_b: ACCEPTED (server_b: {'x': 99, 'timestamp': ...})
*** conflicting values now exist: server_a has x=2, server_b has x=99 ***
```

**Confirm the trade-off, in reverse:** BOTH writes SUCCEEDED — no user was ever told "sorry, unavailable" — but now `server_a` and `server_b` genuinely DISAGREE about `x`'s value, and NEITHER is "wrong" from its own local perspective; each simply doesn't know about the OTHER's write yet. DynamoDB and Cassandra (in typical configurations) lean AP — they prioritize NEVER refusing a request, accepting that replicas can temporarily diverge and need reconciliation later.

---

### Concept: Eventual Consistency

**What it is:** After a partition HEALS (communication is restored), an AP system must RECONCILE conflicting values into ONE agreed-upon answer. **Eventual consistency** is the PROMISE that replicas WILL converge — eventually — NOT that they agree at every instant along the way.

---

## Step 4 — Reconcile After the Partition Heals

```python
print("\n=== Partition Heals: Reconciliation Needed ===")
print(f"server_a: {server_a}")
print(f"server_b: {server_b}")
print("reconciling with last-write-wins...")

winner = server_a if server_a['timestamp'] > server_b['timestamp'] else server_b
server_a['x'] = winner['x']
server_b['x'] = winner['x']

print(f"both servers converge to: x={winner['x']} (server_b's write was LATER)")
print("  ← this is \"eventual consistency\" — they agree NOW, but briefly disagreed during the partition")
```

### SAVE AND TRY

```bash
python consistency.py
```

**Expected:**
```
=== Partition Heals: Reconciliation Needed ===
server_a: {'x': 2, 'timestamp': ...}
server_b: {'x': 99, 'timestamp': ...}
reconciling with last-write-wins...
both servers converge to: x=99 (server_b's write was LATER)
  ← this is "eventual consistency" — they agree NOW, but briefly disagreed during the partition
```

**Confirm "eventual" is doing real, specific work:** BEFORE reconciliation, the two servers genuinely disagreed — a client reading from `server_a` would have gotten `x=2`; a client reading from `server_b` at the SAME moment would have gotten `x=99`. ONLY AFTER reconciliation do they agree. "Eventually consistent" is a PRECISE technical promise: consistency is guaranteed to arrive EVENTUALLY, not IMMEDIATELY — a genuinely weaker guarantee than LAB-59's transactional consistency, chosen deliberately in exchange for the Availability Step 3 demonstrated.

---

## 🎯 Challenge: A Different Conflict Resolution Strategy

**You know:** "Last-write-wins" (Step 4) is simple but has a real flaw: it silently DISCARDS the losing write entirely, which may not always be the right business decision (imagine both writes were legitimate, concurrent shopping cart additions, not truly conflicting updates to the SAME logical field).

**Task:** Sketch (in comments or pseudocode) an alternative strategy — merging BOTH values instead of picking one — for a scenario where that makes more sense (like a shopping cart, where "add item A" and "add item B" from two partitioned replicas should BOTH survive, not have one silently disappear).

<details>
<summary>▶ Show Solution</summary>

```python
# Last-write-wins (Step 4): appropriate when writes are genuinely CONFLICTING
# updates to the SAME field (like a single 'x' value) — only one can be "correct."

# Merge strategy: appropriate when writes are ADDITIVE and can coexist —
# e.g., a shopping cart represented as a SET of items:

cart_a = {'book', 'pen'}       # items added while partitioned, on replica A
cart_b = {'pen', 'laptop'}     # items added while partitioned, on replica B

merged_cart = cart_a | cart_b   # UNION — every item from BOTH replicas survives
# merged_cart = {'book', 'pen', 'laptop'} — nothing lost, unlike last-write-wins
```

**Key insight:** The RIGHT reconciliation strategy depends on WHAT KIND of conflict occurred — a single shared VALUE being overwritten (Step 4's `x`) is a genuine conflict where something must be chosen (or the business must decide how to merge them semantically); independent ADDITIONS to a collection (a shopping cart, a "likes" counter) can often be MERGED without losing anything, using strategies like set union, or more sophisticated data structures called CRDTs (Conflict-free Replicated Data Types) designed specifically to merge cleanly, automatically, without a "loser." Real distributed databases offer several conflict-resolution strategies for exactly this reason — there's no single universally-correct answer.

</details>

---

## Mental Model: Where This Shows Up

| This lab | Real system |
|---|---|
| CP systems | PostgreSQL (single-node), MongoDB (with majority write concern), ZooKeeper |
| AP systems | Cassandra, DynamoDB, CouchDB |
| Last-write-wins | Many distributed caches' default conflict resolution |
| Merge-based reconciliation | CRDTs, used in collaborative editing (Google Docs-style) and distributed counters |

**Module 2 (NoSQL and Consistency) complete.**

**Where you will see this again:** LAB-61's CAP trade-offs directly explain WHY LAB-49's job queue and LAB-51's WebSocket server would need careful design if run across MULTIPLE servers in production — the same partition/consistency questions apply to any distributed component, not just databases.

---

## Final Check

| Feature | How to verify |
|---|---|
| A network partition between two simulated servers is set up correctly | Step 1 |
| A CP system correctly rejects writes during the partition | Step 2 |
| An AP system correctly accepts writes on both sides, creating a real conflict | Step 3 |
| Reconciliation correctly converges both replicas to one agreed value after the partition heals | Step 4 |
| An alternative, merge-based reconciliation strategy is sketched for an additive scenario | Challenge |
| You can explain, without notes, why "eventually consistent" doesn't mean "always consistent" | Step 4's Concept box |

---

## Quick Check Answers

**1. Should Server A accept a write during a partition, not knowing about Server B?**

This is EXACTLY the CAP choice — a CP system says NO (Step 2: reject, protect consistency, sacrifice availability); an AP system says YES (Step 3: accept, protect availability, risk a later conflict). Neither answer is universally "correct" — it depends on the APPLICATION's actual needs (a bank balance leans CP; a "like" counter or shopping cart often leans AP), which is precisely why real distributed databases let you CONFIGURE this trade-off rather than hard-coding one answer.

**2. What does "eventual consistency" explicitly NOT promise?**

That replicas agree AT EVERY MOMENT between now and "eventually" — demonstrated directly in Step 3–4, where `server_a` and `server_b` genuinely DISAGREED about `x`'s value for a real period of time (anyone reading from either server during that window would get a DIFFERENT answer), and only CONVERGED after explicit reconciliation. The promise is specifically about the DESTINATION (they WILL agree eventually), not the JOURNEY (they might disagree along the way) — a much weaker guarantee than LAB-59's transactional consistency, which promises correctness at every observable instant.

**3. Why is Partition Tolerance effectively not optional?**

Because real networks DO fail — cables get cut, routers crash, cloud availability zones lose connectivity — and a distributed system that simply STOPS WORKING the instant ANY network partition occurs isn't a viable real-world system at all. This is why CAP is more usefully understood as "given that partitions WILL happen, do you choose C or A DURING that partition?" rather than a genuine three-way choice — Partition Tolerance isn't something you can opt out of in a system that spans multiple machines over a real network.

---

*Module 2 (NoSQL and Consistency) complete. Next: [LAB-62 — ORM](../module-03-mini-projects/LAB-62-orm.md) — Python, Module 3 begins*

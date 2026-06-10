# Drill 7.3 — CAP Theorem: The Tradeoff You Cannot Escape

**Standalone drill. No prerequisites except basic Python.**
**Time estimate:** 60–75 minutes
**Environment:** Python 3.8+ — standard library only (`socket`, `threading`, `json`, `time`)
**What you will build:** Two simulated distributed nodes, a network partition between them, and a demonstration of the CP (sacrifice availability) vs AP (sacrifice consistency) choice during partition. You will see both behaviors as observable output.
**What you will understand:** What consistency, availability, and partition tolerance actually mean as system behaviors — not textbook definitions — and why every distributed system makes this choice whether it knows it or not.

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. CAP says you can only pick 2 of 3. Why is "CA" (consistency + availability, no partition tolerance) not a useful choice for a distributed system?

2. Your database has two replicas. The network between them goes down for 30 seconds. What are the two options the system can take, and what does each option give up?

3. "Eventual consistency" is a specific form of AP. What does it mean? Give a real-world example where it's acceptable.

4. A bank account balance must never go negative. Which CAP choice (CP or AP) must the bank use? Why?

*(Answers at the bottom.)*

---

## The Concept: CAP Theorem

### Concept: Consistency, Availability, Partition Tolerance

**What it is:**
CAP Theorem (Brewer's Theorem) states: a distributed data store can guarantee at most two of these three properties simultaneously:
- **Consistency (C)**: Every read returns the most recent write (or an error). All nodes see the same data at the same time.
- **Availability (A)**: Every request receives a response (not an error). The system never refuses a request, even if some nodes are unreachable.
- **Partition Tolerance (P)**: The system continues operating even when network messages between nodes are lost or delayed.

**Why CA is a non-choice:**
Network partitions happen. In any distributed system (two or more machines), the network between them will occasionally fail — hardware failure, cable cut, AWS availability zone outage, BGP routing error. You cannot build a distributed system that never experiences partitions. Therefore P is not optional — you must tolerate partitions. The real choice is CP vs AP.

**CP — Consistency over Availability:**
During a partition, the system returns errors rather than potentially stale data. Clients receive "unavailable" or "service error" responses until the partition heals and nodes resynchronize. When the partition heals, all nodes are guaranteed to agree.

Example: A bank transfer system. During a partition between the US and EU nodes, the EU node rejects reads and writes for US accounts rather than serve potentially stale balances.

**AP — Availability over Consistency:**
During a partition, nodes continue serving requests using their local data, even if that data might be stale. After the partition heals, nodes reconcile their diverged state. Some reads return stale data, and write conflicts may occur.

Example: A social media "like" counter. During a partition, both nodes accept new likes. After healing, they merge: likes = node_a_count + node_b_count. You might see a like counter appear to jump.

**The mechanism — what happens during a partition:**
```
Normal operation:
  Client → Node A → replicates to Node B → success

Partition (A and B cannot communicate):
  CP choice:
    Client → Node A → cannot reach B → REJECT with error
    Client waits until partition heals
    
  AP choice:
    Client → Node A → cannot reach B → ACCEPT with local write
    Client → Node B → cannot reach A → ACCEPT with different local write
    Both nodes diverge
    Partition heals → conflict resolution required
```

**PACELC — the fuller picture:**
CAP only describes behavior during partitions. PACELC extends it: even when there's no partition (E), you face a tradeoff between Latency (L) and Consistency (C). A synchronous replication write (consistent) waits for all replicas to confirm — higher latency. An asynchronous write (available, fast) may return before all replicas have the data.

**Constraints:**
- "Consistent" in CAP means linearizability — stronger than "eventually consistent." Most databases use weaker consistency models (read-your-writes, monotonic reads) that are easier to achieve.
- Partition tolerance isn't binary — it's a spectrum. You choose how long to tolerate partitions before failing over.
- The CP/AP choice is per-operation in some systems. DynamoDB lets you choose per-read (strongly consistent or eventually consistent).

**Tradeoffs:**
| System | Choice | When | Example |
|---|---|---|---|
| Zookeeper, etcd | CP | Configuration, leader election | Kubernetes control plane |
| Cassandra, DynamoDB | AP | High-write, eventual OK | User activity logs, shopping carts |
| PostgreSQL (synchronous) | CP | Financial transactions | Banking, inventory |
| DNS | AP | Read-heavy, stale OK | Domain resolution |

**Failure modes:**
- Choosing CP but not implementing backoff: clients hammer unavailable endpoints, creating thundering herd when partition heals
- Choosing AP without conflict resolution: two writes diverge; reconciliation logic never written; data is silently corrupted
- Ignoring CAP: assuming both consistency and availability, getting neither during the first partition
- Treating all data as needing CP: a "last liked" timestamp doesn't need the same consistency guarantees as a bank balance

**Operational reality:**
Every distributed database has a CAP position statement. MongoDB: CP by default (writes go through primary, secondary reads may be stale). Cassandra: AP (tunable consistency levels, but the default is eventual). PostgreSQL: CP (single primary, synchronous standbys). Redis Cluster: AP (data may be lost during partition if primary fails over). Understanding CAP helps you choose the right database and set the right consistency configuration for each use case.

**You will see this again in:**
Database selection for microservices, distributed cache design, multi-region deployment, conflict-free replicated data types (CRDTs) for AP systems.

**Watch for:**
The word "eventually consistent" in a database's documentation means AP. "Strongly consistent" means CP. "Tunable consistency" means you can pick per-operation. Know what your data requires before choosing.

---

## Step 1 — Simulate Two Nodes and Normal Replication

Create `node.py` — a single key-value store node:

```python
# node.py — a simple key-value store that can replicate to a peer
import socket
import threading
import json
import time
import sys

class KVNode:
    def __init__(self, node_id: str, host: str, port: int):
        self.node_id = node_id
        self.host = host
        self.port = port
        self.store: dict[str, dict] = {}  # {key: {value, version, timestamp}}
        self.peer: tuple[str, int] | None = None  # (host, port) of peer node
        self.partitioned = False  # simulate network partition
        self._lock = threading.Lock()
        
    def set(self, key: str, value: str, replicate: bool = True) -> dict:
        """Write a value. Returns success/failure."""
        with self._lock:
            version = (self.store.get(key, {}).get("version", 0)) + 1
            self.store[key] = {
                "value": value,
                "version": version,
                "node": self.node_id,
                "timestamp": time.time(),
            }
        
        if replicate and self.peer and not self.partitioned:
            try:
                self._replicate(key, value, version)
                return {"success": True, "replicated": True, "version": version}
            except Exception as e:
                return {"success": True, "replicated": False, "version": version, "warn": str(e)}
        
        return {"success": True, "replicated": False, "version": version}
    
    def get(self, key: str) -> dict:
        """Read a value."""
        with self._lock:
            entry = self.store.get(key)
        if entry:
            return {"found": True, "value": entry["value"], 
                    "version": entry["version"], "node": self.node_id}
        return {"found": False, "node": self.node_id}
    
    def _replicate(self, key: str, value: str, version: int):
        """Send a replication message to the peer."""
        host, port = self.peer
        conn = socket.create_connection((host, port), timeout=1)
        msg = json.dumps({"op": "replicate", "key": key, "value": value, "version": version})
        conn.sendall((msg + "\n").encode())
        conn.close()
    
    def start_server(self):
        """Listen for replication messages from peer."""
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind((self.host, self.port))
        server.listen(5)
        
        def handle(conn):
            data = conn.recv(4096).decode().strip()
            msg = json.loads(data)
            if msg["op"] == "replicate":
                with self._lock:
                    existing = self.store.get(msg["key"], {})
                    if msg["version"] > existing.get("version", 0):
                        self.store[msg["key"]] = {
                            "value": msg["value"],
                            "version": msg["version"],
                            "node": f"{self.node_id}-replicated",
                            "timestamp": time.time(),
                        }
            conn.close()
        
        print(f"[{self.node_id}] Listening on {self.host}:{self.port}")
        while True:
            conn, _ = server.accept()
            threading.Thread(target=handle, args=(conn,), daemon=True).start()
```

Create `demo_cap.py`:

```python
# demo_cap.py
import threading
import time
import sys
sys.path.insert(0, ".")
from node import KVNode

node_a = KVNode("A", "127.0.0.1", 9001)
node_b = KVNode("B", "127.0.0.1", 9002)
node_a.peer = ("127.0.0.1", 9002)
node_b.peer = ("127.0.0.1", 9001)

# Start both servers
threading.Thread(target=node_a.start_server, daemon=True).start()
threading.Thread(target=node_b.start_server, daemon=True).start()
time.sleep(0.2)  # wait for servers to start

print("=== Normal Operation (no partition) ===\n")

# Write to A — should replicate to B
result = node_a.set("balance", "1000")
print(f"Write to A: balance=1000, replicated={result['replicated']}")
time.sleep(0.1)

# Read from both — should agree
a_read = node_a.get("balance")
b_read = node_b.get("balance")
print(f"Read from A: {a_read['value']} (v{a_read['version']})")
print(f"Read from B: {b_read['value']} (v{b_read['version']})")

consistent = a_read['value'] == b_read['value']
print(f"Consistent: {consistent}")
```

### SAVE AND TRY

```
python demo_cap.py
```

Expected output:
```
=== Normal Operation (no partition) ===

[A] Listening on 127.0.0.1:9001
[B] Listening on 127.0.0.1:9002
Write to A: balance=1000, replicated=True
Read from A: 1000 (v1)
Read from B: 1000 (v1)
Consistent: True
```

---

## Step 2 — Introduce a Partition, then Choose CP vs AP

Add to `demo_cap.py`:

```python
print("\n=== Introducing Network Partition ===\n")

# Simulate partition: nodes cannot reach each other
node_a.partitioned = True
node_b.partitioned = True
print("Partition active: A and B cannot communicate\n")

# --- CP Choice: Refuse writes during partition ---
print("--- CP Behavior (prioritize Consistency) ---")

def cp_set(node, key, value):
    """CP: refuse write if replication cannot be confirmed."""
    if node.partitioned and node.peer:
        return {"success": False, "error": "Partition active — refusing write to maintain consistency"}
    return node.set(key, value)

result_a = cp_set(node_a, "balance", "900")
result_b = cp_set(node_b, "balance", "1100")
print(f"Write to A (CP): {result_a}")
print(f"Write to B (CP): {result_b}")

# Reads from both nodes during partition
a_val = node_a.get("balance")
b_val = node_b.get("balance")
print(f"Read from A: {a_val['value']}")
print(f"Read from B: {b_val['value']}")
print("CP result: Both nodes refused writes. Old data preserved. Consistent but unavailable for writes.\n")

# --- AP Choice: Accept writes during partition (diverge) ---
print("--- AP Behavior (prioritize Availability) ---")

# Reset balances
node_a.store["balance"] = {"value": "1000", "version": 1, "node": "A", "timestamp": 0}
node_b.store["balance"] = {"value": "1000", "version": 1, "node": "B", "timestamp": 0}

# AP: both nodes accept local writes even during partition
result_a = node_a.set("balance", "900", replicate=False)   # A: subtract 100
result_b = node_b.set("balance", "1100", replicate=False)  # B: add 100

print(f"Write to A (AP): balance=900 — {result_a}")
print(f"Write to B (AP): balance=1100 — {result_b}")

a_val = node_a.get("balance")
b_val = node_b.get("balance")
print(f"Read from A: {a_val['value']}")
print(f"Read from B: {b_val['value']}")
print("AP result: Both nodes served requests. Data is INCONSISTENT (diverged).\n")

# --- Heal the partition ---
print("=== Partition Heals ===\n")
node_a.partitioned = False
node_b.partitioned = False

# Show the conflict
a_val = node_a.get("balance")
b_val = node_b.get("balance")
print(f"After healing — A has: {a_val['value']}, B has: {b_val['value']}")
print("Conflict! Two different values for 'balance'.")
print("AP system needs conflict resolution: Last-write-wins? Manual merge? CRDT?")
print(f"\nFor a bank account, this means: A thinks balance={a_val['value']}, B thinks {b_val['value']}")
print("True balance is unknown. This is why banks use CP.")
```

### SAVE AND TRY

Add this to `demo_cap.py` after the first section and run:

Expected output:
```
=== Introducing Network Partition ===

Partition active: A and B cannot communicate

--- CP Behavior (prioritize Consistency) ---
Write to A (CP): {'success': False, 'error': 'Partition active — refusing write to maintain consistency'}
Write to B (CP): {'success': False, 'error': 'Partition active — refusing write to maintain consistency'}
Read from A: 1000
Read from B: 1000
CP result: Both nodes refused writes. Old data preserved. Consistent but unavailable for writes.

--- AP Behavior (prioritize Availability) ---
Write to A (AP): balance=900 — {'success': True, 'replicated': False, 'version': 2}
Write to B (AP): balance=1100 — {'success': True, 'replicated': False, 'version': 2}
Read from A: 900
Read from B: 1100
AP result: Both nodes served requests. Data is INCONSISTENT (diverged).

=== Partition Heals ===

After healing — A has: 900, B has: 1100
Conflict! Two different values for 'balance'.
AP system needs conflict resolution: Last-write-wins? Manual merge? CRDT?

For a bank account, this means: A thinks balance=900, B thinks 1100
True balance is unknown. This is why banks use CP.
```

**Change something:** Add a third scenario where the AP system implements "last-write-wins" conflict resolution after healing: compare timestamps, keep the most recent write. Run the scenario and observe that LWW resolves the conflict but discards one of the writes — the user who made the rejected write sees their change "disappear."

---

## Step 3 — Eventual Consistency: AP with Reconciliation

Show an AP system that converges after partition heals:

```python
# eventual_consistency.py
import time
import threading

class EventualNode:
    def __init__(self, node_id: str):
        self.node_id = node_id
        self.likes: int = 0      # local counter
        self.writes: list = []   # log of all writes (for reconciliation)
        self.lock = threading.Lock()
    
    def add_like(self, count: int = 1):
        with self.lock:
            self.likes += count
            self.writes.append(("like", count, time.time()))
    
    def merge(self, other: "EventualNode"):
        """
        Eventual consistency: reconcile after partition heals.
        For a counter, merge = sum both diverged states.
        This is a CRDT (Conflict-free Replicated Data Type) — the merge is always safe.
        """
        with self.lock:
            other_diverged_likes = sum(c for op, c, t in other.writes)
            self.likes += other_diverged_likes
            print(f"[{self.node_id}] Merged with {other.node_id}: "
                  f"added {other_diverged_likes} diverged likes → total = {self.likes}")

def simulate_partition_and_merge():
    node_a = EventualNode("A")
    node_b = EventualNode("B")
    
    # Pre-partition: both agree on 100 likes
    node_a.likes = 100
    node_b.likes = 100
    print(f"Initial state: A={node_a.likes}, B={node_b.likes}\n")
    
    # During partition: users add likes to each node independently
    print("=== During Partition ===")
    # 50 users like on node A
    for _ in range(50):
        node_a.add_like()
    print(f"A: 50 users liked during partition → A={node_a.likes}")
    
    # 30 users like on node B  
    for _ in range(30):
        node_b.add_like()
    print(f"B: 30 users liked during partition → B={node_b.likes}")
    
    print(f"\nDuring partition: A reports {node_a.likes} likes, B reports {node_b.likes} likes")
    print("Neither is 'wrong' — each is stale from the other's perspective")
    
    # Partition heals — reconcile
    print("\n=== Partition Heals — Reconciling ===")
    # In a real system, nodes exchange their write logs
    node_a.merge(node_b)  # A learns about B's diverged writes
    node_b.likes = node_a.likes  # B gets the merged total
    
    print(f"\nAfter reconciliation:")
    print(f"  A: {node_a.likes} likes")
    print(f"  B: {node_b.likes} likes")
    print(f"  Consistent: {node_a.likes == node_b.likes}")
    print(f"  Correct: {node_a.likes == 180} (100 + 50 + 30)")
    print("\nEventual consistency: both nodes converged to the correct final state.")
    print("No like was lost. But during the partition, reads were stale.")
    print("\nThis is acceptable for 'likes' — users don't need exact counts.")
    print("This is NOT acceptable for 'bank balance' — the total could represent double-spend.")

if __name__ == "__main__":
    simulate_partition_and_merge()
```

### SAVE AND TRY

```
python eventual_consistency.py
```

Expected output:
```
Initial state: A=100, B=100

=== During Partition ===
A: 50 users liked during partition → A=150
B: 30 users liked during partition → B=130

During partition: A reports 150 likes, B reports 130 likes
Neither is 'wrong' — each is stale from the other's perspective

=== Partition Heals — Reconciling ===
[A] Merged with B: added 30 diverged likes → total = 180

After reconciliation:
  A: 180 likes
  B: 180 likes
  Consistent: True
  Correct: True (100 + 50 + 30)

Eventual consistency: both nodes converged to the correct final state.
No like was lost. But during the partition, reads were stale.

This is acceptable for 'likes' — users don't need exact counts.
This is NOT acceptable for 'bank balance' — the total could represent double-spend.
```

The counter converges correctly because addition is commutative and associative — this is a G-Counter CRDT (Grow-only Counter). This property (safe to merge) is what makes eventual consistency viable for some data types.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a distributed key-value store that implements configurable consistency: the client can choose CP or AP behavior per request.

**Requirements checklist:**

- [ ] Two `KVNode` instances communicating via sockets (reuse the node from Step 1)
- [ ] `node.set(key, value, consistency="strong")` — CP: writes fail if peer is unreachable
- [ ] `node.set(key, value, consistency="eventual")` — AP: writes succeed locally, replicate when possible
- [ ] `node.get(key, consistency="strong")` — CP: reads from both nodes and returns the highest-version value, or error if peer is unreachable
- [ ] `node.get(key, consistency="eventual")` — AP: returns local value immediately (may be stale)
- [ ] `node.repair()` — after a partition heals, syncs diverged keys between nodes. For conflicting values, last-write-wins (by timestamp).
- [ ] A conflict log: `node.conflicts` — a list of `(key, a_value, b_value, resolution)` tuples showing what happened during repair
- [ ] A test script that:
  1. Writes "balance=1000" with `strong` consistency → both nodes agree
  2. Simulates partition
  3. Writes "balance=900" on A and "balance=1100" on B with `eventual` consistency
  4. Calls `node_a.repair()` — shows the conflict and LWW resolution
  5. Reads "balance" from both nodes with `strong` consistency → they agree

**Starter:**
```python
def set(self, key: str, value: str, consistency: str = "eventual") -> dict:
    if consistency == "strong":
        # TODO: attempt replication, return error if peer unreachable
        pass
    else:
        # TODO: write locally, queue for async replication
        pass

def get(self, key: str, consistency: str = "eventual") -> dict:
    if consistency == "strong":
        # TODO: read from both nodes, return highest-version
        pass
    else:
        # TODO: return local value immediately
        pass
```

**When you're done:**
```
python test_consistency.py
```
Output includes:
```
[strong write] balance=1000: A=v1, B=v1 (both agree)
[partition on]
[eventual write A] balance=900: success (local only)
[eventual write B] balance=1100: success (local only)
[before repair] strong read: ERROR — nodes disagree
[repair] Conflict: balance A=900 (t=1.000) B=1100 (t=1.001) → B wins (newer)
[after repair] strong read: balance=1100 from both nodes
```

**Stuck?** Ask AI: "How do I implement last-write-wins conflict resolution for a distributed key-value store in Python? I have two nodes with potentially conflicting values for the same key, each with a Unix timestamp. Show me how to compare timestamps and merge the stores so both nodes end up with the same value."

---

## Quick Check Answers

**1. Why "CA" (no partition tolerance) is not useful:**
Partitions are not optional in distributed systems. Networks fail, cables break, cloud availability zones have outages. If you design a system that cannot tolerate partitions, you must design a system that is never distributed — one machine, one process. A CA system is just a non-distributed system. Once you have two machines, you have distribution, and you must handle partitions. The real CAP choice is always CP vs AP (partition tolerance is mandatory).

**2. Two options during a partition:**
CP choice: refuse requests (reads and/or writes) until the partition heals and both replicas synchronize. The system is unavailable for affected data. When it comes back, both nodes agree. AP choice: serve requests from local state even if the other node is unreachable. Both nodes continue operating with diverged state. When the partition heals, the system has two conflicting versions and must reconcile (last-write-wins, manual merge, CRDT).

**3. Eventual consistency — definition and example:**
Eventual consistency means: if no new writes are made to a data item, eventually all replicas will converge to the same value. It does NOT guarantee when. During normal operation with no partitions, propagation is fast (milliseconds to seconds). After a partition, reconciliation happens when connectivity is restored. Real-world example: DNS. When you update a domain's IP address, DNS propagation takes minutes to hours. During that time, different DNS resolvers return different IPs. Eventually, all resolvers update. This is acceptable because: serving a slightly stale IP is better than refusing all DNS lookups; exact timing doesn't matter for URL resolution.

**4. Bank account — CP or AP:**
CP. A bank account has an invariant: balance >= 0 (no overdraft). With AP, during a partition, both nodes can accept withdrawals from the same account independently. Node A: balance 1000 → -100 → 900. Node B simultaneously: balance 1000 → -800 → 200. After reconciliation, the "true" balance is either 200, 900, or 100 (900 + 200 - 1000 for double-spend accounting) — all of which may be negative or incorrect. The bank must use CP: refuse the second withdrawal if the first can't be confirmed, or use a distributed transaction (two-phase commit) to ensure both nodes agree before committing.

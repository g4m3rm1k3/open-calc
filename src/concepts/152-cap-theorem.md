---
concept: 152-cap-theorem
name: CAP Theorem
---

## Definition

The CAP theorem states that a distributed data system can provide at most
TWO of these three guarantees simultaneously during a network partition:
Consistency (every node sees the same, most recent data), Availability
(every request gets a response, even if not the latest data), and
Partition tolerance (the system keeps working despite network failures
between nodes).

## Problem

In a distributed system with multiple nodes, network partitions (some
nodes temporarily unable to communicate with others) WILL happen — the
theorem forces a real choice about what happens during that partition:
either refuse some requests to guarantee everyone sees consistent data
(sacrificing Availability), or keep answering every request even though
different nodes might briefly disagree (sacrificing Consistency). Since
partition tolerance isn't really optional for any real distributed
system, the actual choice in practice is between Consistency and
Availability.

## Execution

Two nodes, A and B, both hold a copy of the SAME data, normally kept in
sync
↓
A network partition occurs — A and B can no longer talk to each other
↓
A client writes new data to Node A during the partition
↓
A client then reads from Node B (still isolated from A) — what does Node
B do?
↓
CP choice: Node B refuses to answer (or returns an error) rather than
risk returning stale data — Consistency preserved, Availability
sacrificed
↓
AP choice: Node B answers anyway, with its OLD (pre-partition) data —
Availability preserved, Consistency sacrificed (the client gets a stale
answer)

## Computer Science

This is a fundamental, provable tradeoff (not just an engineering
guideline) about what's achievable in a distributed system during a
network partition — it doesn't say a system can NEVER have both
Consistency and Availability, only that it can't guarantee BOTH
specifically during an actual partition, since partitions are the
scenario that forces the choice.

Tags: Distributed systems, Network partitions, Consistency models, Availability

## Software Engineering

Real systems pick a point on this tradeoff deliberately based on their
actual needs — a banking system handling account balances typically
favors Consistency (CP: better to briefly refuse a request than show a
wrong balance), while a system like a social media "like" counter
typically favors Availability (AP: better to show a slightly-stale count
than go down entirely).

Tags: CP systems, AP systems, System design tradeoffs

## Common Mistakes

- Treating CAP as "pick any 2 of 3" in general, all the time — partition tolerance isn't really a choice for any real distributed system (partitions WILL happen), so the actual everyday choice is specifically between C and A, and specifically during a partition; outside of a partition, a well-designed system can often provide both.
- Confusing CAP's "Consistency" (every node agrees on the current value) with ACID's "Consistency" (a transaction never violates defined integrity rules) — despite sharing the word, these describe different guarantees.

## Exercises

- For a banking balance system and a social media "like" counter, explain which side of the CAP tradeoff (C or A) each would reasonably favor during a partition, and why.
- Trace through the two-node example above if BOTH nodes chose to prioritize Availability — what inconsistent state could a client observe by reading from both nodes?

## javascript

```javascript
// Simulating a CP node (refuses during a partition) vs. an AP node
// (answers with possibly-stale data during a partition) directly.
class CPNode {
  #data = 100
  #partitioned = false
  setPartitioned(v) { this.#partitioned = v }
  write(value) { this.#data = value }
  read() {
    if (this.#partitioned) return { ok: false, reason: 'unavailable during partition -- consistency preserved' }
    return { ok: true, value: this.#data }
  }
}

class APNode {
  #data = 100
  #partitioned = false
  setPartitioned(v) { this.#partitioned = v }
  write(value) { if (!this.#partitioned) this.#data = value }   // can't receive the new write while partitioned
  read() { return { ok: true, value: this.#data, stale: this.#partitioned } }
}

const cpNode = new CPNode()
const apNode = new APNode()

cpNode.setPartitioned(true)
apNode.setPartitioned(true)

console.log(cpNode.read())   // { ok: false, reason: '...' } -- refuses rather than risk stale data
console.log(apNode.read())   // { ok: true, value: 100, stale: true } -- answers anyway, flags it as possibly stale
```
Walkthrough: once both nodes are marked as partitioned, `cpNode.read()`
refuses outright — it would rather return no answer than a possibly-wrong
one, preserving Consistency at the cost of Availability. `apNode.read()`
still answers with its last-known value, explicitly marked `stale: true`
— preserving Availability at the cost of guaranteed Consistency, exactly
the tradeoff the CAP theorem describes.

## python

```python
class CPNode:
    def __init__(self):
        self._data = 100
        self._partitioned = False

    def set_partitioned(self, v):
        self._partitioned = v

    def write(self, value):
        self._data = value

    def read(self):
        if self._partitioned:
            return {'ok': False, 'reason': 'unavailable during partition -- consistency preserved'}
        return {'ok': True, 'value': self._data}


class APNode:
    def __init__(self):
        self._data = 100
        self._partitioned = False

    def set_partitioned(self, v):
        self._partitioned = v

    def write(self, value):
        if not self._partitioned:   # can't receive the new write while partitioned
            self._data = value

    def read(self):
        return {'ok': True, 'value': self._data, 'stale': self._partitioned}


cp_node = CPNode()
ap_node = APNode()

cp_node.set_partitioned(True)
ap_node.set_partitioned(True)

print(cp_node.read())   # {'ok': False, 'reason': '...'} -- refuses rather than risk stale data
print(ap_node.read())   # {'ok': True, 'value': 100, 'stale': True} -- answers anyway, flags it as possibly stale
```
Walkthrough: identical CP-refuses vs. AP-answers-with-stale-flag mechanics
as the JavaScript version, illustrating the fundamental
Consistency-vs-Availability tradeoff during a network partition.

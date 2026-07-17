---
concept: 130-tcp-ip
name: TCP/IP
---

## Definition

TCP/IP is the pair of protocols underlying almost all internet
communication — IP handles addressing and routing packets between
machines, while TCP adds reliability on top: guaranteed delivery, correct
ordering, and automatic retransmission of lost packets.

## Problem

Sending data across a network as individual packets, via IP alone,
doesn't guarantee they arrive, arrive in order, or arrive without
duplication — packets can be lost, delayed, or reordered by intermediate
routers. TCP adds a layer of bookkeeping (sequence numbers,
acknowledgments, retransmission) on top of raw IP packets to guarantee
reliable, ordered delivery despite the unreliable network underneath.

## Execution

Send a message as 3 packets over IP: packet 1, packet 2, packet 3
↓
Packet 2 gets lost in transit (a real possibility on any network)
↓
Receiver gets packet 1, then packet 3 — notices packet 2 is MISSING (via
TCP's sequence numbers)
↓
Receiver's TCP layer requests retransmission of packet 2
↓
Sender resends packet 2 — receiver now has all three, reassembles them in
the correct order (1, 2, 3), regardless of arrival order

## Computer Science

TCP achieves reliability over an inherently unreliable network by
numbering every byte sent (sequence numbers) and requiring the receiver to
acknowledge what it's received — any acknowledged-but-missing gap tells
the sender exactly what to retransmit. This is what lets applications
treat a TCP connection as a reliable, ordered stream, even though the
underlying IP packets it's built on provide neither guarantee.

Tags: Packet loss, Sequence numbers, Acknowledgments, Retransmission

## Software Engineering

TCP's reliability comes at a real cost — the back-and-forth
acknowledgment/retransmission machinery adds latency compared to UDP (a
simpler protocol with no reliability guarantees at all), which is why
latency-sensitive applications that can tolerate occasional loss (video
calls, some multiplayer games) sometimes use UDP instead, trading
guaranteed delivery for lower latency.

Tags: TCP vs UDP, Latency tradeoffs, Reliable vs unreliable transport

## Common Mistakes

- Assuming raw IP alone guarantees delivery or ordering — it explicitly does NOT; those guarantees come specifically from TCP layered on top, not from IP itself.
- Assuming TCP's reliability means a connection can never fail — TCP guarantees that if data arrives, it arrives correctly and in order, but the connection itself can still be interrupted, which application code still needs to handle.

## Exercises

- Look up the difference between TCP and UDP in terms of what each one guarantees, and identify one real application that would prefer each.
- Trace through what happens if packet 3 in the example arrives BEFORE packet 2 — does the final reassembled order change?

## javascript

```javascript
// Simulating TCP's reassembly-despite-loss-and-reordering behavior directly,
// since a real socket-level demonstration would require an actual network.
function reassembleInOrder(receivedPackets, expectedCount) {
  const bySequence = new Map(receivedPackets.map(p => [p.seq, p.data]))
  const missing = []
  for (let seq = 1; seq <= expectedCount; seq++) {
    if (!bySequence.has(seq)) missing.push(seq)
  }
  if (missing.length > 0) return { complete: false, missing }
  const ordered = []
  for (let seq = 1; seq <= expectedCount; seq++) ordered.push(bySequence.get(seq))
  return { complete: true, data: ordered.join('') }
}

// Packet 2 is lost; packet 3 arrived before packet 1 was even noticed missing
const arrived = [{ seq: 1, data: 'A' }, { seq: 3, data: 'C' }]
console.log(reassembleInOrder(arrived, 3))   // { complete: false, missing: [ 2 ] } — request retransmission

// After retransmission, packet 2 finally arrives
const complete = [{ seq: 1, data: 'A' }, { seq: 3, data: 'C' }, { seq: 2, data: 'B' }]
console.log(reassembleInOrder(complete, 3))   // { complete: true, data: 'ABC' } — correct order, despite arrival order
```
Walkthrough: packets are tracked by sequence number, not arrival order —
`reassembleInOrder` detects the missing packet 2 regardless of when
packet 3 happened to arrive, and once all three are present, reassembles
them by sequence number, producing the correct order `'ABC'` even though
packet 3 physically arrived before packet 2.

## python

```python
def reassemble_in_order(received_packets, expected_count):
    by_sequence = {p['seq']: p['data'] for p in received_packets}
    missing = [seq for seq in range(1, expected_count + 1) if seq not in by_sequence]
    if missing:
        return {'complete': False, 'missing': missing}
    ordered = [by_sequence[seq] for seq in range(1, expected_count + 1)]
    return {'complete': True, 'data': ''.join(ordered)}


# Packet 2 is lost; packet 3 arrived before packet 1 was even noticed missing
arrived = [{'seq': 1, 'data': 'A'}, {'seq': 3, 'data': 'C'}]
print(reassemble_in_order(arrived, 3))   # {'complete': False, 'missing': [2]} -- request retransmission

# After retransmission, packet 2 finally arrives
complete = [{'seq': 1, 'data': 'A'}, {'seq': 3, 'data': 'C'}, {'seq': 2, 'data': 'B'}]
print(reassemble_in_order(complete, 3))   # {'complete': True, 'data': 'ABC'} -- correct order, despite arrival order
```
Walkthrough: identical sequence-number-based reassembly as the JavaScript
version — packets are ordered by their sequence number, not their arrival
order, which is exactly how TCP guarantees correct ordering despite an
unreliable, reordering-prone network underneath.

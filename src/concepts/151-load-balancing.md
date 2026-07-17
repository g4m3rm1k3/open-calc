---
concept: 151-load-balancing
name: Load Balancing
---

## Definition

Load balancing distributes incoming requests across multiple
servers/instances of an application, rather than sending every request to
a single machine, so no one instance is overwhelmed while others sit
idle.

## Problem

A single server can only handle so many simultaneous requests — beyond
that capacity, requests queue up or start failing, even if the
application logic itself is perfectly fine. Running MULTIPLE identical
instances behind a load balancer lets total capacity scale by adding more
instances, with the load balancer deciding which instance handles each
incoming request.

## Execution

3 identical server instances running behind a load balancer: Server A,
Server B, Server C
↓
Request 1 arrives — load balancer sends it to Server A (round-robin: next
in line)
↓
Request 2 arrives — load balancer sends it to Server B
↓
Request 3 arrives — load balancer sends it to Server C
↓
Request 4 arrives — load balancer cycles back to Server A
↓
If Server B crashes, the load balancer detects it (via health checks) and
stops routing requests to it — traffic is distributed only across the
remaining healthy servers (A and C), until B recovers

## Computer Science

Different load-balancing algorithms make different tradeoffs —
round-robin (cycle through servers in order) is simple but ignores each
server's actual current load; least-connections (send to whichever server
currently has the fewest active requests) adapts to real load but
requires the balancer to track ongoing connection counts.

Tags: Round-robin, Least-connections, Health checks, Horizontal scaling

## Software Engineering

Load balancing is what makes horizontal scaling (adding more machines)
possible in practice — it only works cleanly if the servers behind it are
stateless (any instance can handle any request, since a user's next
request might land on a different instance than their last one) — an
application that stores session state only in one server's local memory
breaks this assumption and needs a shared session store instead.

Tags: Horizontal scaling, Statelessness, Shared session stores

## Common Mistakes

- Storing session state only in a single server's local memory while running behind a load balancer — a user's next request might be routed to a DIFFERENT server that has no idea about their session, causing them to appear logged out or lose data.
- Assuming a load balancer alone fixes a slow application — it distributes load across MORE capacity, but doesn't make each individual request any faster; a genuinely slow endpoint is still slow on every instance.

## Exercises

- Trace through where requests 5, 6, and 7 would route in the round-robin example above, continuing the cycle.
- Explain why a load-balanced application needs its servers to be "stateless" (or use a shared session store) — what specifically breaks if they're not?

## javascript

```javascript
// Simulating a round-robin load balancer directly, including detecting
// and skipping an unhealthy server.
class LoadBalancer {
  #servers
  #healthy
  #nextIndex = 0

  constructor(servers) {
    this.#servers = servers
    this.#healthy = new Set(servers)
  }

  markDown(server) { this.#healthy.delete(server) }

  routeRequest() {
    for (let i = 0; i < this.#servers.length; i++) {
      const candidate = this.#servers[this.#nextIndex]
      this.#nextIndex = (this.#nextIndex + 1) % this.#servers.length
      if (this.#healthy.has(candidate)) return candidate
    }
    throw new Error('no healthy servers')
  }
}

const lb = new LoadBalancer(['A', 'B', 'C'])
console.log(lb.routeRequest())   // 'A'
console.log(lb.routeRequest())   // 'B'
console.log(lb.routeRequest())   // 'C'
console.log(lb.routeRequest())   // 'A' -- cycled back around

lb.markDown('B')
console.log(lb.routeRequest())   // 'C' -- next in rotation after A
console.log(lb.routeRequest())   // 'A' -- 'B' is SKIPPED entirely since it's marked unhealthy
```
Walkthrough: the first four calls cycle through `A`, `B`, `C`, `A` in
round-robin order. After `markDown('B')`, subsequent calls skip `B`
entirely — the rotation continues correctly between only the remaining
healthy servers, `A` and `C`, demonstrating how a load balancer routes
around a failed instance without needing any external intervention.

## python

```python
class LoadBalancer:
    def __init__(self, servers):
        self._servers = servers
        self._healthy = set(servers)
        self._next_index = 0

    def mark_down(self, server):
        self._healthy.discard(server)

    def route_request(self):
        for _ in range(len(self._servers)):
            candidate = self._servers[self._next_index]
            self._next_index = (self._next_index + 1) % len(self._servers)
            if candidate in self._healthy:
                return candidate
        raise RuntimeError('no healthy servers')


lb = LoadBalancer(['A', 'B', 'C'])
print(lb.route_request())   # A
print(lb.route_request())   # B
print(lb.route_request())   # C
print(lb.route_request())   # A -- cycled back around

lb.mark_down('B')
print(lb.route_request())   # C -- next in rotation after A
print(lb.route_request())   # A -- 'B' is SKIPPED entirely since it's marked unhealthy
```
Walkthrough: identical round-robin-with-health-check mechanics as the
JavaScript version — the rotation correctly skips the marked-down server,
cycling only through the remaining healthy instances.

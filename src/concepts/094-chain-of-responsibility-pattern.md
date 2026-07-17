---
concept: 094-chain-of-responsibility-pattern
name: Chain of Responsibility Pattern
---

## Definition

The Chain of Responsibility pattern passes a request along a chain of
potential handlers, one at a time, until one of them handles it — without
the sender needing to know which handler in the chain will actually end up
processing it.

## Problem

Having a single function decide, via a long if/else-if chain, which of
many possible handlers should process a request creates one large piece of
code that has to know about every handler and every condition for choosing
between them. Chain of Responsibility instead lets each handler decide for
itself whether it can handle the request, passing it along to the next
handler if it can't.

## Execution

Request arrives at the FIRST handler in the chain
↓
That handler checks: can I handle this? If yes, handle it and stop
↓
If no, pass the SAME request to the next handler in the chain
↓
Repeat until some handler handles it, or the chain runs out

## Computer Science

Each handler only needs a reference to the NEXT handler in the chain — it
doesn't need to know about every other handler, or how many total handlers
exist. This keeps handlers loosely coupled and lets the chain be
reconfigured (reordered, handlers added or removed) without changing any
individual handler's own code.

Tags: Loose coupling, Linked handlers, Request delegation

## Software Engineering

This is the shape behind middleware pipelines (a web request passing
through auth, logging, and compression middleware in sequence, each
deciding whether to handle it or pass it along) and event bubbling in UI
frameworks (an unhandled click event passes up through parent components
until something handles it).

Tags: Middleware, Event bubbling, Request pipelines

## Common Mistakes

- Building a chain so long that a request has to pass through many handlers before reaching the one that actually handles it — this can hurt both performance and readability if the chain grows too deep without organizing structure.
- Forgetting to pass the request to the next handler when the current one can't handle it — silently dropping the request instead of forwarding it means it never gets processed by anyone.

## Exercises

- Build a 3-handler chain for support tickets, each handling tickets up to a certain severity, and trace which handler processes a ticket of each severity level.
- Add a 4th handler at the END of the chain that logs "unhandled request" for anything none of the earlier handlers could process.

## javascript

```javascript
class SupportHandler {
  #next = null
  setNext(handler) { this.#next = handler; return handler }
  handle(ticket) {
    if (this.canHandle(ticket)) return this.process(ticket)
    if (this.#next) return this.#next.handle(ticket)
    return 'Unhandled: ' + ticket.issue
  }
}

class Level1Handler extends SupportHandler {
  canHandle(ticket) { return ticket.severity <= 1 }
  process(ticket) { return `Level1 handled: ${ticket.issue}` }
}
class Level2Handler extends SupportHandler {
  canHandle(ticket) { return ticket.severity <= 2 }
  process(ticket) { return `Level2 handled: ${ticket.issue}` }
}

const level1 = new Level1Handler()
const level2 = new Level2Handler()
level1.setNext(level2)

console.log(level1.handle({ severity: 1, issue: 'password reset' }))   // 'Level1 handled: password reset'
console.log(level1.handle({ severity: 2, issue: 'billing error' }))    // 'Level2 handled: billing error'
console.log(level1.handle({ severity: 5, issue: 'server down' }))      // 'Unhandled: server down'
```
Walkthrough: every request starts at `level1`. If `Level1Handler` can't
handle it, it forwards to whatever handler was set as `#next` — here,
`level2`. If neither handler can process it, the chain falls through to
the base "Unhandled" message, without either handler needing to know about
anything beyond its own single neighbor.

## python

```python
class SupportHandler:
    def __init__(self):
        self._next = None

    def set_next(self, handler):
        self._next = handler
        return handler

    def handle(self, ticket):
        if self.can_handle(ticket):
            return self.process(ticket)
        if self._next:
            return self._next.handle(ticket)
        return 'Unhandled: ' + ticket['issue']


class Level1Handler(SupportHandler):
    def can_handle(self, ticket):
        return ticket['severity'] <= 1

    def process(self, ticket):
        return f"Level1 handled: {ticket['issue']}"


class Level2Handler(SupportHandler):
    def can_handle(self, ticket):
        return ticket['severity'] <= 2

    def process(self, ticket):
        return f"Level2 handled: {ticket['issue']}"


level1 = Level1Handler()
level2 = Level2Handler()
level1.set_next(level2)

print(level1.handle({'severity': 1, 'issue': 'password reset'}))   # Level1 handled: password reset
print(level1.handle({'severity': 2, 'issue': 'billing error'}))     # Level2 handled: billing error
print(level1.handle({'severity': 5, 'issue': 'server down'}))       # Unhandled: server down
```
Walkthrough: identical delegate-or-forward mechanics as the JavaScript
version — each handler only knows about its own `_next` reference, forming
a chain without any handler needing global knowledge of the whole chain.

---
concept: 132-client-server-model
name: Client-Server Model
---

## Definition

The client-server model splits an application into a client — which
initiates requests and usually handles presentation or UI — and a server,
which listens for requests and holds and manages the actual data or logic,
with all communication flowing through requests the client initiates.

## Problem

Multiple users need to interact with the same shared data simultaneously,
from potentially many different devices — having each device manage its
own private copy would make keeping everyone's view consistent extremely
difficult. Centralizing the data and logic on one server, with clients
only ever requesting or submitting through it, gives a single consistent
source of truth.

## Execution

Client A requests the current list of items from the server
↓
Server looks up the CURRENT shared data and responds to Client A
↓
Client B submits a request to ADD a new item
↓
Server updates its ONE shared copy of the data
↓
Client A requests the list AGAIN — now sees Client B's addition, since
both clients are reading from the same server-managed data, not private
copies

## Computer Science

This model is fundamentally asymmetric — the server doesn't initiate
contact with a client, it waits, listening, for requests — while a client
never accepts unsolicited work from an arbitrary server it didn't request
from. This contrasts with more symmetric architectures, like some
peer-to-peer systems, where every node can both request and be requested
from equally.

Tags: Asymmetric roles, Centralized data, Peer-to-peer contrast, Request initiation

## Software Engineering

This model is why a server can enforce consistent business rules and
validation in one place, rather than trusting every client to enforce them
correctly and consistently, and why scaling typically means scaling the
server side — more server capacity, load balancing across multiple server
instances — while clients remain comparatively lightweight.

Tags: Centralized validation, Scalability, Load balancing, Thin clients

## Common Mistakes

- Duplicating validation or business logic ONLY on the client side, trusting it to always run correctly — a client can always be bypassed, so the server must independently enforce anything that actually matters for correctness or security.
- Assuming a "client" is always a web browser — a client is any program initiating requests to a server, including mobile apps, other backend services, and command-line tools.

## Exercises

- Trace through what would happen to data consistency if two clients tried to maintain their OWN separate copies of shared data instead of going through a central server.
- Identify one piece of validation logic that would be unsafe to enforce ONLY on the client side, and explain why the server must also check it.

## javascript

```javascript
class Server {
  #items = ['apple']
  getItems() { return [...this.#items] }   // return a copy -- clients can't mutate the server's real data directly
  addItem(item) { this.#items.push(item) }
}

const server = new Server()

// Client A reads the current shared state
console.log(server.getItems())   // [ 'apple' ]

// Client B submits a change
server.addItem('banana')

// Client A reads again -- sees Client B's change, since both read from the SAME server-held data
console.log(server.getItems())   // [ 'apple', 'banana' ]
```
Walkthrough: both "clients" interact only through the server's methods —
neither holds its own private copy of the items list. Client A's second
read reflects Client B's addition immediately, because there's exactly one
shared copy of the data, held centrally by the server.

## python

```python
class Server:
    def __init__(self):
        self._items = ['apple']

    def get_items(self):
        return list(self._items)   # return a copy -- clients can't mutate the server's real data directly

    def add_item(self, item):
        self._items.append(item)


server = Server()

# Client A reads the current shared state
print(server.get_items())   # ['apple']

# Client B submits a change
server.add_item('banana')

# Client A reads again -- sees Client B's change, since both read from the SAME server-held data
print(server.get_items())   # ['apple', 'banana']
```
Walkthrough: identical centralized-data mechanics as the JavaScript
version — every "client" interaction goes through the server's own
methods, so any client's change is immediately visible to every other
client's subsequent read.

# Coordination Roles: Controller, Mediator, Dispatcher, Orchestrator, Router

## What you will build

Five runnable programs — one per concept — in both Python and TypeScript,
showing different ways of answering the question: "which object is in
charge of making sure the right things happen in the right order?" By the
end you'll recognize why production code names classes
`OrderController`, `ChatMediator`, `TaskDispatcher`, `WorkflowOrchestrator`,
or `RequestRouter` — and understand exactly what responsibility each name
promises.

## What you need to know first

This post assumes comfort with basic Python (variables, functions, classes).
No TypeScript knowledge is assumed — every piece of new syntax is explained
at the moment it appears. This post stands fully alone.

## Setting up to run TypeScript

TypeScript is compiled to JavaScript before running. For every TypeScript
example below:

```
npx tsc filename.ts
node filename.js
```

`npx tsc filename.ts` reads your TypeScript file, checks it for type
errors, and produces `filename.js`. `node filename.js` runs the result.
If `tsc` finds an error it prints a description and stops — this is
TypeScript catching mistakes before the program runs.

---

## The core problem all five roles are solving

Every non-trivial program has objects that need to work together.
The question is: _how_ should that cooperation be organized? Something has
to know the sequence of steps, or decide which handler to use, or prevent
a tangle of objects all calling each other directly. The five roles in this
post are five different answers to that question, each suited to a
different shape of problem.

---

## Role 1: Controller

A **Controller** coordinates work between a data layer and a presentation
layer — it receives a request, decides what to do with it, calls the
appropriate data or service objects, and sends back a response. The
Controller's job is coordination, not implementation: it should not
contain detailed business logic, and it should not reach directly into a
database or render output itself. It delegates those concerns to other
objects and orchestrates the results.

This pattern is most familiar as the "C" in **MVC** (Model-View-Controller):
the Model holds data, the View presents it, and the Controller sits between
them, deciding which Model operations to call and which View to update.

### Python

```python
class UserDatabase:
    def __init__(self):
        self._users = {
            1: {"name": "Alice", "email": "alice@example.com"},
            2: {"name": "Bob",   "email": "bob@example.com"},
        }

    def find_by_id(self, user_id):
        return self._users.get(user_id)

    def create(self, name, email):
        new_id = max(self._users.keys()) + 1
        self._users[new_id] = {"name": name, "email": email}
        return new_id
```

**Walkthrough:** `UserDatabase` is the **Model** layer — it owns the data
and exposes operations on it. `self._users` is a dictionary mapping integer
IDs to user-data dictionaries. `.get(user_id)` is the same safe dictionary
lookup from this series' dictionaries post — returns the value if the key
exists, or `None` if it doesn't, instead of raising a `KeyError`.
`max(self._users.keys())` finds the highest existing ID so the new one is
one greater — a simple but effective ID generation strategy for this
example.

```python
class UserView:
    def show_user(self, user):
        if user:
            print(f"User: {user['name']} <{user['email']}>")
        else:
            print("User not found.")

    def show_created(self, user_id):
        print(f"Created user with ID: {user_id}")
```

**Walkthrough:** `UserView` is the **View** layer — it only knows how to
display things. It doesn't touch the database, doesn't make decisions about
what to display; it just formats and prints what it's given. `user['name']`
indexes into a dictionary by string key — the same indexing syntax you know
from lists, but using a string key instead of a numeric position.

```python
class UserController:
    def __init__(self):
        self._database = UserDatabase()
        self._view = UserView()

    def get_user(self, user_id):
        user = self._database.find_by_id(user_id)
        self._view.show_user(user)

    def create_user(self, name, email):
        new_id = self._database.create(name, email)
        self._view.show_created(new_id)
```

**Walkthrough:** `UserController` creates and owns both the `UserDatabase`
and the `UserView` — it is the single point that knows both exist and
coordinates between them. `get_user` calls the database, hands the result
to the view. `create_user` calls the database to store the data, then
tells the view what ID was assigned. The controller itself contains no
display logic (no `print`) and no storage logic (no direct manipulation of
`_users`) — it is purely coordination.

```python
controller = UserController()
controller.get_user(1)
controller.get_user(99)
controller.create_user("Carol", "carol@example.com")
controller.get_user(3)
```

```
User: Alice <alice@example.com>
User not found.
Created user with ID: 3
User: Carol <carol@example.com>
```

**CS lens.** The Controller is an application of **separation of concerns**:
storage logic lives in the Model, display logic lives in the View, and
coordination logic — the only thing that needs to know both the Model and
the View exist — lives in the Controller. This boundary means you can
swap out the view entirely (print to a file instead of the terminal) by
changing only `UserView`, without touching `UserController` or
`UserDatabase`. You can change how the database stores data without
touching the display. Each layer is testable in isolation from the others.

**SE lens.** In a web framework like Django or Express, a Controller
(sometimes called a "view function" or "handler" in Python frameworks,
confusingly) is the function that receives an HTTP request, calls
the right service or database layer, and sends back an HTTP response.
The pattern applies at every scale: from a single-file script to a
distributed system with dozens of services.

**What breaks without this:** Without the Controller as a distinct layer,
the database and display logic end up mixed together — functions that
simultaneously query the database and format the output, with both
concerns tangled inseparably. Changing how users are stored requires
reading and editing code that is also responsible for displaying them,
and testing either concern in isolation becomes very difficult.

### TypeScript

```typescript
interface User {
  name: string;
  email: string;
}
```

**Walkthrough — new syntax.** `interface User { name: string; email:
string; }` declares the shape of a user object: an object with exactly two
string properties, `name` and `email`. TypeScript uses this to verify, at
compile time, that every place a `User` is created or used actually
provides both fields with the right types. This has no direct Python
equivalent — Python dictionaries carry no compile-time guarantees about
which keys they contain; TypeScript interfaces do.

```typescript
class UserDatabase {
  private users: Record<number, User> = {
    1: { name: "Alice", email: "alice@example.com" },
    2: { name: "Bob", email: "bob@example.com" },
  };

  findById(userId: number): User | null {
    return this.users[userId] ?? null;
  }

  create(name: string, email: string): number {
    const newId = Math.max(...Object.keys(this.users).map(Number)) + 1;
    this.users[newId] = { name, email };
    return newId;
  }
}
```

**Walkthrough — new syntax.** `Record<number, User>` — recall `Record<K,
V>` describes an object where every key is of type `K` and every value is
of type `V`; here the keys are `number` IDs and the values are `User`
objects. `findById(userId: number): User | null` — the return type `User |
null` is a union type: this function either returns a `User` or `null` (the
TypeScript equivalent of Python's `None`), never anything else, and the
compiler will enforce this. `this.users[userId] ?? null` introduces the
**nullish coalescing operator** `??`: it returns the left side if it's not
`null` or `undefined`, and returns the right side otherwise. Accessing a
`Record` with a key that doesn't exist returns `undefined` in JavaScript
(not `null`, not a `KeyError`) — `?? null` converts that `undefined` to
an explicit `null`, keeping the return type cleanly `User | null` rather
than `User | undefined`. `Object.keys(this.users).map(Number)` converts the
keys (which TypeScript surfaces as strings even when they were declared as
numbers — a JavaScript quirk at the boundary between objects and their
string-keyed underlying representation) back into actual numbers, so
`Math.max(...)` can operate on them numerically. `{ name, email }` is
JavaScript **object shorthand**: when a property name matches a local
variable name exactly, you can write it once rather than `{ name: name,
email: email }`.

```typescript
class UserView {
  showUser(user: User | null): void {
    if (user) {
      console.log(`User: ${user.name} <${user.email}>`);
    } else {
      console.log("User not found.");
    }
  }

  showCreated(userId: number): void {
    console.log(`Created user with ID: ${userId}`);
  }
}

class UserController {
  private database: UserDatabase;
  private view: UserView;

  constructor() {
    this.database = new UserDatabase();
    this.view = new UserView();
  }

  getUser(userId: number): void {
    const user = this.database.findById(userId);
    this.view.showUser(user);
  }

  createUser(name: string, email: string): void {
    const newId = this.database.create(name, email);
    this.view.showCreated(newId);
  }
}

const controller = new UserController();
controller.getUser(1);
controller.getUser(99);
controller.createUser("Carol", "carol@example.com");
controller.getUser(3);
```

```
User: Alice <alice@example.com>
User not found.
Created user with ID: 3
User: Carol <carol@example.com>
```

**Walkthrough:** `if (user)` — recall truthiness from the Python basics
series: `null` is falsy in JavaScript/TypeScript, so `if (user)` runs the
"found" branch only when `user` is an actual `User` object, and falls
through to the `else` when it's `null`. The TypeScript compiler is also
tracking this: after the `if (user)` check, inside the `if` block,
TypeScript narrows the type of `user` from `User | null` to just `User`,
because it knows the `null` case was handled by the `else`. This type
narrowing — TypeScript automatically refining what it knows about a type
after a conditional check — is one of the features that makes TypeScript
particularly useful for avoiding null-related bugs.

---

## Role 2: Mediator

A **Mediator** prevents objects from communicating with each other
directly — instead, all communication goes through the mediator. Objects
don't hold references to each other; they only hold a reference to the
mediator and send messages to it. The mediator decides who else should hear
those messages.

This solves a specific coupling problem: if four objects all need to
communicate with each other directly, each needs to hold references to the
other three — that's twelve references in total, and the dependency web
grows quadratically with the number of participants. A mediator reduces
this to each object holding one reference (to the mediator), and the
mediator knowing about everyone.

### Python

```python
class ChatMediator:
    def __init__(self):
        self._participants = []

    def register(self, participant):
        self._participants.append(participant)
        participant.mediator = self

    def send_message(self, message, sender):
        for participant in self._participants:
            if participant is not sender:
                participant.receive(message, sender.name)
```

**Walkthrough:** `ChatMediator` holds a list of all participants.
`register` adds one and also sets `participant.mediator = self` — giving
the participant a reference back to the mediator, so it can call
`self.mediator.send_message(...)` later without holding any reference to
any other participant directly. `send_message` delivers a message to
every registered participant _except_ the sender (`if participant is not
sender` — `is not` checks object identity: "is this literally the exact
same object in memory," distinct from `!=` which checks value equality;
you wouldn't want a sender receiving their own message back).

```python
class ChatUser:
    def __init__(self, name):
        self.name = name
        self.mediator = None

    def send(self, message):
        print(f"{self.name} sends: '{message}'")
        self.mediator.send_message(message, self)

    def receive(self, message, sender_name):
        print(f"{self.name} receives from {sender_name}: '{message}'")
```

**Walkthrough:** `ChatUser` holds only `self.mediator = None` as its
connection to the outside world — no list of other users, no references to
any specific other participant. When it wants to talk to someone, it tells
the mediator, which decides who should hear it. Notice `self.mediator =
None` is set initially, then overwritten by `register` above — this is the
same pattern from the Proxy post, where a lazy-loaded value starts as
`None` and is set when first needed; here it signals "not yet registered
to a mediator."

```python
mediator = ChatMediator()

alice = ChatUser("Alice")
bob = ChatUser("Bob")
carol = ChatUser("Carol")

mediator.register(alice)
mediator.register(bob)
mediator.register(carol)

alice.send("Hello everyone!")
print()
bob.send("Hey Alice!")
```

```
Alice sends: 'Hello everyone!'
Bob receives from Alice: 'Hello everyone!'
Carol receives from Alice: 'Hello everyone!'

Bob sends: 'Hey Alice!'
Alice receives from Bob: 'Hey Alice!'
Carol receives from Bob: 'Hey Alice!'
```

**CS lens.** This is the **hub-and-spoke** communication topology: instead
of a mesh where every node connects to every other node (O(n²) connections),
all communication routes through a central hub (O(n) connections). The
trade-off is that the mediator becomes a larger, more complex object as the
system grows — it now has to understand all the routing logic that was
previously distributed across many objects. This is sometimes called the
mediator becoming a "god object" — a risk the pattern introduces when
overused.

**SE lens.** The Mediator pattern appears in GUI frameworks as the form
or window that coordinates its own components (a checkbox enables or
disables a button, without the checkbox holding a direct reference to the
button — they both talk to the window), in air traffic control metaphors
(planes don't talk to each other, they talk to the tower), and in chat
room implementations exactly like this one. The key indicator that a
Mediator is the right choice: when you notice that every object in a group
needs to know about every other object to do its job, and adding a new
participant would require updating all existing ones.

**What breaks without this:** Without a mediator, each `ChatUser` would
need to hold a list of all other users and loop over them to send messages
— meaning every time a user joins or leaves the chat, every existing user's
list must be updated. The mediator centralizes that list into one place.

### TypeScript

```typescript
class ChatMediator {
  private participants: ChatUser[] = [];

  register(participant: ChatUser): void {
    this.participants.push(participant);
    participant.mediator = this;
  }

  sendMessage(message: string, sender: ChatUser): void {
    for (const participant of this.participants) {
      if (participant !== sender) {
        participant.receive(message, sender.name);
      }
    }
  }
}

class ChatUser {
  name: string;
  mediator: ChatMediator | null = null;

  constructor(name: string) {
    this.name = name;
  }

  send(message: string): void {
    console.log(`${this.name} sends: '${message}'`);
    this.mediator!.sendMessage(message, this);
  }

  receive(message: string, senderName: string): void {
    console.log(`${this.name} receives from ${senderName}: '${message}'`);
  }
}

const mediator = new ChatMediator();

const alice = new ChatUser("Alice");
const bob = new ChatUser("Bob");
const carol = new ChatUser("Carol");

mediator.register(alice);
mediator.register(bob);
mediator.register(carol);

alice.send("Hello everyone!");
console.log();
bob.send("Hey Alice!");
```

```
Alice sends: 'Hello everyone!'
Bob receives from Alice: 'Hello everyone!'
Carol receives from Alice: 'Hello everyone!'

Bob sends: 'Hey Alice!'
Alice receives from Bob: 'Hey Alice!'
Carol receives from Bob: 'Hey Alice!'
```

**Walkthrough — new syntax.** `mediator: ChatMediator | null = null` —
the property starts as `null` and is set to the actual mediator by
`register`, exactly as in Python. `this.mediator!.sendMessage(...)` — the
`!` here is the **non-null assertion operator**: it tells the TypeScript
compiler "I know this value is not null at this point, even though its
declared type includes `null`." This is an escape hatch from the
compiler's null checks — you're asserting human knowledge that the design
guarantees `mediator` will have been set before `send` is ever called (by
`register`). Using `!` is a conscious trade-off: you give up the compiler's
safety guarantee for that specific line in exchange for not needing to write
a full null check. A stricter alternative would be `if (this.mediator)
{ this.mediator.sendMessage(...) }` — the non-null assertion is justified
here because the program would break anyway if `send` were called before
`register`, and the extra check would just hide rather than fix that design
violation.

---

## Role 3: Dispatcher

A **Dispatcher** routes work to the correct handler based on some property
of the work itself — it receives a task or message, inspects it, and
decides which function or object should process it. The dispatcher doesn't
do the actual work; it only decides who does.

The difference from a Controller: a Controller coordinates a known,
specific sequence involving specific layers (Model → Controller → View). A
Dispatcher handles dynamic routing — the mapping from "what kind of thing
is this?" to "who handles this kind?" and that mapping may be defined at
startup and never change, or may be dynamically registered at runtime.

### Python

```python
class TaskDispatcher:
    def __init__(self):
        self._handlers = {}

    def register(self, task_type, handler):
        self._handlers[task_type] = handler

    def dispatch(self, task_type, payload):
        handler = self._handlers.get(task_type)
        if handler:
            print(f"Dispatching '{task_type}' task...")
            handler(payload)
        else:
            print(f"No handler registered for task type: '{task_type}'")
```

**Walkthrough:** `self._handlers` is a dictionary mapping task type names
(strings) to handler functions. `register` adds a mapping. `dispatch` looks
up the task type in the dictionary — `self._handlers.get(task_type)` returns
the handler function if one exists, or `None` if not — and calls it with
the payload if found. This dictionary of functions is the same **dispatch
table** concept mentioned in the Observer post: a lookup table that maps
a key to something callable, allowing runtime selection of behavior without
a chain of `if`/`elif` statements.

```python
def handle_email(payload):
    print(f"  Sending email to: {payload['recipient']}")


def handle_sms(payload):
    print(f"  Sending SMS to: {payload['phone']}")


def handle_push(payload):
    print(f"  Sending push notification: {payload['message']}")


dispatcher = TaskDispatcher()
dispatcher.register("email", handle_email)
dispatcher.register("sms", handle_sms)
dispatcher.register("push", handle_push)

dispatcher.dispatch("email", {"recipient": "alice@example.com"})
dispatcher.dispatch("sms",   {"phone": "+1-555-0101"})
dispatcher.dispatch("push",  {"message": "Your order has shipped"})
dispatcher.dispatch("fax",   {"number": "555-0199"})
```

```
Dispatching 'email' task...
  Sending email to: alice@example.com
Dispatching 'sms' task...
  Sending SMS to: +1-555-0101
Dispatching 'push' task...
  Sending push notification: Your order has shipped
No handler registered for task type: 'fax'
```

**CS lens.** The dispatch table here is a direct application of the
**open/closed principle**: adding a new task type (`"fax"`, `"webhook"`,
etc.) requires only registering a new handler — the `TaskDispatcher` class
itself never needs to be modified. Compare this to the alternative: a
chain of `if task_type == "email": ... elif task_type == "sms": ...`
inside `dispatch` — which would require editing the dispatcher's own code
for every new type, making it never truly "closed for modification."

**SE lens.** Dispatchers appear in web frameworks as URL routers (a request
arrives at `/users/42` — which handler function should process it?), in
message queues (a message arrives with type `"ORDER_PLACED"` — which
service handles that?), and in event-driven systems (an event arrives with
a type — which handler runs?). The pattern is ubiquitous precisely because
dynamic routing — deciding at runtime who handles what — is one of the most
common coordination problems in real software.

**What breaks without this:** Without a dispatch table, adding a new
message type means opening the dispatcher's core routing logic and editing
it — meaning every new task type is a potential source of regression bugs
in the routing logic that was already working correctly for all existing
types.

### TypeScript

```typescript
type TaskHandler = (payload: Record<string, string>) => void;

class TaskDispatcher {
  private handlers: Record<string, TaskHandler> = {};

  register(taskType: string, handler: TaskHandler): void {
    this.handlers[taskType] = handler;
  }

  dispatch(taskType: string, payload: Record<string, string>): void {
    const handler = this.handlers[taskType];
    if (handler) {
      console.log(`Dispatching '${taskType}' task...`);
      handler(payload);
    } else {
      console.log(`No handler registered for task type: '${taskType}'`);
    }
  }
}

const dispatcher = new TaskDispatcher();

dispatcher.register("email", (payload) => {
  console.log(`  Sending email to: ${payload["recipient"]}`);
});
dispatcher.register("sms", (payload) => {
  console.log(`  Sending SMS to: ${payload["phone"]}`);
});
dispatcher.register("push", (payload) => {
  console.log(`  Sending push notification: ${payload["message"]}`);
});

dispatcher.dispatch("email", { recipient: "alice@example.com" });
dispatcher.dispatch("sms", { phone: "+1-555-0101" });
dispatcher.dispatch("push", { message: "Your order has shipped" });
dispatcher.dispatch("fax", { number: "555-0199" });
```

```
Dispatching 'email' task...
  Sending email to: alice@example.com
Dispatching 'sms' task...
  Sending SMS to: +1-555-0101
Dispatching 'push' task...
  Sending push notification: Your order has shipped
No handler registered for task type: 'fax'
```

**Walkthrough:** `type TaskHandler = (payload: Record<string, string>) =>
void;` — a type alias for any function that takes a `Record<string,
string>` (an object with string keys and string values — a typed
dictionary) and returns nothing. `Record<string, TaskHandler>` is the
dispatch table itself: an object keyed by task-type string, valued by
handler functions. Registering a handler using inline arrow functions
directly in the `register` call is idiomatic TypeScript — the type alias
`TaskHandler` means the compiler verifies each arrow function's signature
matches the expected shape, catching a mismatched payload type before
the program runs.

---

## Role 4: Orchestrator

An **Orchestrator** controls an entire multi-step workflow — it owns the
sequence, calls each step in order, handles decisions between steps, and
ensures the overall process completes correctly. Unlike a Dispatcher (which
routes to one handler per task) or a Controller (which coordinates two or
three specific layers), an Orchestrator manages a longer, more complex
process with multiple distinct stages that must happen in a specific order
and may depend on each other's results.

### Python

```python
class InventoryService:
    def check_stock(self, item, quantity):
        print(f"  [Inventory] Checking stock for {quantity}x {item}...")
        return True


class PaymentService:
    def charge(self, amount):
        print(f"  [Payment] Charging ${amount:.2f}...")
        return True


class ShippingService:
    def create_shipment(self, item, quantity):
        print(f"  [Shipping] Creating shipment for {quantity}x {item}...")
        return "SHIP-001"


class NotificationService:
    def send_confirmation(self, shipment_id):
        print(f"  [Notification] Sending confirmation for {shipment_id}...")
```

**Walkthrough:** Each service does one specific job. None of them knows
the others exist. They don't call each other, don't hold references to
each other, and don't know they're part of an order-processing flow.

```python
class OrderOrchestrator:
    def __init__(self):
        self._inventory = InventoryService()
        self._payment = PaymentService()
        self._shipping = ShippingService()
        self._notification = NotificationService()

    def process_order(self, item, quantity, price_per_unit):
        print(f"Starting order: {quantity}x {item} @ ${price_per_unit:.2f} each")

        if not self._inventory.check_stock(item, quantity):
            print("Order failed: out of stock.")
            return

        total = quantity * price_per_unit
        if not self._payment.charge(total):
            print("Order failed: payment declined.")
            return

        shipment_id = self._shipping.create_shipment(item, quantity)
        self._notification.send_confirmation(shipment_id)

        print(f"Order complete. Shipment ID: {shipment_id}")
```

**Walkthrough:** `OrderOrchestrator.__init__` creates all four services —
it is the only object in the system that knows all four exist. `process_order`
owns the entire sequence: check stock → charge payment → create shipment →
send notification. Each step is checked before proceeding: if inventory
returns `False`, the orchestrator stops and reports failure without
proceeding to payment. If payment fails, shipping never happens. The
orchestrator doesn't implement any of this logic itself — it delegates
every step and manages the flow between them.

```python
orchestrator = OrderOrchestrator()
orchestrator.process_order("Widget", 3, 9.99)
```

```
Starting order: 3x Widget @ $9.99 each
  [Inventory] Checking stock for 3x Widget...
  [Payment] Charging $29.97...
  [Shipping] Creating shipment for 3x Widget...
  [Notification] Sending confirmation for SHIP-001...
Order complete. Shipment ID: SHIP-001
```

**CS lens.** This is the **workflow** pattern — a process with a defined
start, a defined end, and a specific sequence of steps in between, where
each step may depend on the success or result of the previous one. The
orchestrator is the _only_ object that knows the full sequence; the
individual services are deliberately kept ignorant of each other.

**SE lens.** The key architectural property an Orchestrator provides is
**single point of truth for the workflow**: if the order of steps needs
to change, or a new step needs to be inserted, there is exactly one place
to make that change — inside `process_order`. In production systems,
workflow orchestration is a significant enough problem that dedicated
tools exist for it (AWS Step Functions, Apache Airflow, Temporal) — all
of them implementing the same idea: one controller for the sequence,
independent services for the individual steps.

**What breaks without this:** Without an orchestrator, the sequence
knowledge is either duplicated across call sites (every place that
processes an order has to know the correct sequence) or individual services
start calling each other directly — meaning `InventoryService` knows about
`PaymentService`, which knows about `ShippingService`. This creates a
tangled, hard-to-change dependency chain, and changing the order of steps
requires finding and editing every service involved.

### TypeScript

```typescript
class InventoryService {
  checkStock(item: string, quantity: number): boolean {
    console.log(`  [Inventory] Checking stock for ${quantity}x ${item}...`);
    return true;
  }
}

class PaymentService {
  charge(amount: number): boolean {
    console.log(`  [Payment] Charging $${amount.toFixed(2)}...`);
    return true;
  }
}

class ShippingService {
  createShipment(item: string, quantity: number): string {
    console.log(`  [Shipping] Creating shipment for ${quantity}x ${item}...`);
    return "SHIP-001";
  }
}

class NotificationService {
  sendConfirmation(shipmentId: string): void {
    console.log(`  [Notification] Sending confirmation for ${shipmentId}...`);
  }
}

class OrderOrchestrator {
  private inventory = new InventoryService();
  private payment = new PaymentService();
  private shipping = new ShippingService();
  private notification = new NotificationService();

  processOrder(item: string, quantity: number, pricePerUnit: number): void {
    console.log(
      `Starting order: ${quantity}x ${item} @ $${pricePerUnit.toFixed(2)} each`,
    );

    if (!this.inventory.checkStock(item, quantity)) {
      console.log("Order failed: out of stock.");
      return;
    }

    const total = quantity * pricePerUnit;
    if (!this.payment.charge(total)) {
      console.log("Order failed: payment declined.");
      return;
    }

    const shipmentId = this.shipping.createShipment(item, quantity);
    this.notification.sendConfirmation(shipmentId);

    console.log(`Order complete. Shipment ID: ${shipmentId}`);
  }
}

const orchestrator = new OrderOrchestrator();
orchestrator.processOrder("Widget", 3, 9.99);
```

```
Starting order: 3x Widget @ $9.99 each
  [Inventory] Checking stock for 3x Widget...
  [Payment] Charging $29.97...
  [Shipping] Creating shipment for 3x Widget...
  [Notification] Sending confirmation for SHIP-001...
Order complete. Shipment ID: SHIP-001
```

**Walkthrough — new syntax.** `private inventory = new InventoryService();`
— TypeScript allows declaring and initializing a property in one line,
without a separate `constructor` body, when the initialization doesn't
depend on any constructor parameters. The type of `inventory` is inferred
as `InventoryService` automatically. This is just a convenience shorthand
for the longer form you've seen in previous posts where `constructor()
{ this.inventory = new InventoryService(); }` would appear explicitly —
both produce identical compiled JavaScript.

---

## Role 5: Router

A **Router** determines where a request goes based on specific criteria —
typically a URL path, a message type, or a channel name. The Router
pattern is closely related to Dispatcher, with one distinction in emphasis:
a **Dispatcher** generally decides which _handler function_ to call;
a **Router** generally decides which larger _handler object, module, or
service_ to direct the request to. In practice, the terms are used
interchangeably in many codebases, but the Router name is dominant in
network and web contexts (URL routing), while Dispatcher is more common
in task and message-processing contexts.

### Python

```python
class Router:
    def __init__(self):
        self._routes = {}

    def add_route(self, path, handler):
        self._routes[path] = handler

    def route(self, path, request_data):
        handler = self._routes.get(path)
        if handler:
            handler(request_data)
        else:
            print(f"404 Not Found: no route matches '{path}'")
```

**Walkthrough:** Same dispatch-table structure as `TaskDispatcher` above —
a dictionary from route paths to handler functions, looked up on each
request. The vocabulary difference is in the naming (`path` not
`task_type`, `route` not `dispatch`, `404 Not Found` mirroring real HTTP
status codes) and the intended mental model: this is a web request being
routed to the right handler, not a background task being sent to the right
processor.

```python
def get_users(data):
    print(f"  GET /users — returning user list (query: {data})")


def get_user_by_id(data):
    print(f"  GET /users/id — returning user {data.get('id')}")


def create_user(data):
    print(f"  POST /users — creating user: {data.get('name')}")


router = Router()
router.add_route("GET /users",    get_users)
router.add_route("GET /users/id", get_user_by_id)
router.add_route("POST /users",   create_user)

router.route("GET /users",    {"filter": "active"})
router.route("GET /users/id", {"id": "42"})
router.route("POST /users",   {"name": "Alice"})
router.route("DELETE /users", {})
```

```
  GET /users — returning user list (query: {'filter': 'active'})
  GET /users/id — returning user 42
  POST /users — creating user: Alice
404 Not Found: no route matches 'DELETE /users'
```

**CS lens.** A router is a lookup table with a well-defined miss behavior.
In production web frameworks, routers are more sophisticated — they support
path parameters (`/users/:id` matching `/users/42` and binding `id` to
`"42"`), middleware chains (functions that run before the handler for
authentication, logging, etc.), and wildcard patterns — but the core
mechanism is the same dispatch table shown here, extended with pattern
matching.

**SE lens.** Every web framework uses this pattern as its foundation:
Flask's `@app.route("/users")`, Express's `app.get("/users", handler)`,
Django's `urlpatterns`. The router is what turns "an HTTP request arrived
at this address" into "this specific function handles it" — without the
application code needing to contain any parsing or pattern-matching logic
of its own.

**What breaks without this:** Without a router, every incoming request
would have to be processed by a single function that inspects the request
and branches with `if`/`elif` on the path — a function that would grow
with every new route added to the application, making it impossible to
add routes without risking breaking existing ones.

### TypeScript

```typescript
type RouteHandler = (data: Record<string, string>) => void;

class Router {
  private routes: Record<string, RouteHandler> = {};

  addRoute(path: string, handler: RouteHandler): void {
    this.routes[path] = handler;
  }

  route(path: string, requestData: Record<string, string>): void {
    const handler = this.routes[path];
    if (handler) {
      handler(requestData);
    } else {
      console.log(`404 Not Found: no route matches '${path}'`);
    }
  }
}

const router = new Router();

router.addRoute("GET /users", (data) => {
  console.log(
    `  GET /users — returning user list (query: ${JSON.stringify(data)})`,
  );
});
router.addRoute("GET /users/id", (data) => {
  console.log(`  GET /users/id — returning user ${data["id"]}`);
});
router.addRoute("POST /users", (data) => {
  console.log(`  POST /users — creating user: ${data["name"]}`);
});

router.route("GET /users", { filter: "active" });
router.route("GET /users/id", { id: "42" });
router.route("POST /users", { name: "Alice" });
router.route("DELETE /users", {});
```

```
  GET /users — returning user list (query: {"filter":"active"})
  GET /users/id — returning user 42
  POST /users — creating user: Alice
404 Not Found: no route matches 'DELETE /users'
```

**Walkthrough:** The structure is identical to `TaskDispatcher` from Role
3 — different vocabulary, same mechanism. This is worth sitting with
directly: Controller, Dispatcher, Orchestrator, and Router are not four
different underlying mechanisms — they are four different _roles_, each
involving an object that coordinates other objects. The mechanism (holding
references to other objects and calling them in a defined way) is shared;
what distinguishes them is the shape of the coordination: sequence vs
routing vs workflow vs layer-bridging. Naming an object correctly in your
codebase is itself a form of documentation — `OrderOrchestrator` tells a
reader "this owns a multi-step workflow"; `UserController` tells them
"this bridges a data layer and a view layer."

---

## Connect the pieces

All five roles in this post are answers to the question "who is in charge
of making the right things happen?" — but each for a different shape of
problem. **Controller** bridges two specific layers (Model and View) in a
defined relationship. **Mediator** eliminates direct object-to-object
references, routing all communication through a central hub. **Dispatcher**
routes individual tasks or messages to registered handlers using a dispatch
table, open to extension without modification. **Orchestrator** owns a
multi-step workflow, calling each step in sequence and managing outcomes
between them. **Router** is a Dispatcher specialized for request/path
routing, the foundational mechanism of every web framework.

The progression from Dispatcher → Router is mostly vocabulary; the
progression from Controller → Orchestrator is a real increase in scope
(two layers versus a full multi-service workflow). Mediator is the
odd one out in this group — while the others are about routing or
sequencing work, the Mediator is specifically about eliminating direct
connections between objects that would otherwise couple them together.

In TypeScript, each of these roles gains an explicit interface or type for
what its handlers must look like — turning a runtime "I'll call this
function and hope it has the right shape" into a compile-time guarantee
verified before the program ever runs.

## What breaks without these patterns

Without named coordination roles, coordination logic accumulates inside
whatever object happens to be calling other objects — typically the top-
level application code or a "main" function that grows to contain all the
routing, sequencing, and layer-bridging logic the program needs, mixing
those different kinds of coordination concerns into one increasingly
unmanageable place.

## Definition of done

- [ ] You can explain the difference between a Controller and an Orchestrator
      in your own words — specifically what "coordinating two layers" versus
      "owning a multi-step workflow" means in practice.
- [ ] You can explain why a Mediator reduces the number of direct connections
      between objects, and what problem that reduction solves.
- [ ] You can explain why the Dispatcher and Router examples have almost
      identical code, and what the naming difference communicates.
- [ ] You've run all five patterns in both Python and TypeScript and confirmed
      the output matches what's shown.
- [ ] You can explain what the `??` (nullish coalescing) operator does in
      TypeScript and why `this.users[userId] ?? null` is needed there.
- [ ] You can explain what the `!` (non-null assertion) operator does in
      TypeScript and what risk you accept by using it instead of an explicit
      null check.

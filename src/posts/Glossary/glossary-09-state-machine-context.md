# State and Flow: State Machine, Context

## What you will build

Two runnable programs — one per concept — in both Python and TypeScript,
showing how to model objects whose behavior changes depending on what has
already happened to them, and how to carry shared information through a
multi-step operation without passing it explicitly through every function.
By the end you'll recognize why production code has classes named
`OrderStateMachine` or `RequestContext`, and understand exactly what
problem each one is solving.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. That said, the State Machine section connects directly to the
Command pattern from Glossary 07 (actions that can be accepted or
rejected) and the Dispatcher from Glossary 04 (routing behavior based on
a key) — those connections are named below where they appear.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation before
anything executes. `node` runs the compiled `.js` output.

---

## Concept 1: State Machine

A **State Machine** is an object that can exist in exactly one of a
defined set of states at any given moment, and whose behavior — what
actions it accepts, what it does in response, what state it transitions to
next — depends entirely on which state it's currently in. A state machine
cannot be in two states at once, and every change of state is explicit,
named, and intentional.

### Problem first

Suppose you're modeling an order in an online shop. An order can be:
pending (placed but not paid), paid (payment confirmed), shipped (handed
to the courier), or cancelled. These states have rules: you can't ship an
order that hasn't been paid; you can't cancel an order that's already
shipped; you can't pay an order that's already been cancelled.

Without a state machine, those rules end up as `if`/`elif` checks
scattered throughout whatever code handles each action:

```python
def process_payment(order):
    if order.status == "cancelled":
        raise Exception("Cannot pay a cancelled order")
    if order.status == "paid":
        raise Exception("Order is already paid")
    order.status = "paid"
```

This works for one action, but the pattern repeats for every action —
`ship_order`, `cancel_order`, each needing its own defensive checks
against every invalid combination. The rules are scattered rather than
centralized, and adding a new state or action means hunting through every
function that touches the order.

### Python

```python
class OrderState:
    PENDING   = "pending"
    PAID      = "paid"
    SHIPPED   = "shipped"
    CANCELLED = "cancelled"
```

**Walkthrough:** `OrderState` is a simple container for named constants
— string values given descriptive names so that code reads `OrderState.PAID`
rather than the bare string `"paid"` everywhere. This matters because a
typo in `"paid"` (say, `"paied"`) produces a bug that silently never
matches anything; `OrderState.PAIED` would be an `AttributeError` that
fails immediately and loudly. This pattern of grouping related constants
in a class is a lightweight substitute for Python's `enum` module (which
formalizes this concept further) — sufficient here for clarity without
the added surface area.

```python
class Order:
    def __init__(self, order_id):
        self.order_id = order_id
        self._state = OrderState.PENDING
        self._history = []

    @property
    def state(self):
        return self._state

    def _transition(self, new_state, action_name):
        self._history.append(f"{action_name}: {self._state} → {new_state}")
        self._state = new_state

    def pay(self):
        if self._state != OrderState.PENDING:
            raise ValueError(f"Cannot pay order in state '{self._state}'")
        self._transition(OrderState.PAID, "pay")

    def ship(self):
        if self._state != OrderState.PAID:
            raise ValueError(f"Cannot ship order in state '{self._state}'")
        self._transition(OrderState.SHIPPED, "ship")

    def cancel(self):
        if self._state == OrderState.SHIPPED:
            raise ValueError("Cannot cancel an order that has already shipped")
        if self._state == OrderState.CANCELLED:
            raise ValueError("Order is already cancelled")
        self._transition(OrderState.CANCELLED, "cancel")

    def print_history(self):
        print(f"Order {self.order_id} history:")
        for entry in self._history:
            print(f"  {entry}")
        print(f"  Current state: {self._state}")
```

**Walkthrough:** `self._state = OrderState.PENDING` initializes the
machine in its starting state — every order begins as pending.
`self._history = []` starts an empty list that will accumulate a record of
every transition, giving a complete audit trail of what happened to this
order. `_transition` is a private helper method (recall the `_` prefix
convention: internal, not meant to be called from outside the class) that
records the transition in history and then updates the state — state
changes always go through this one method, meaning the history is always
complete. Each public method (`pay`, `ship`, `cancel`) first checks
whether the *current* state allows that action — if not, it raises
`ValueError` immediately, before any state change happens. If the state is
valid, it delegates to `_transition`.

```python
order = Order("ORD-001")
print(f"Initial state: {order.state}")

order.pay()
order.ship()
order.print_history()
```

```
Initial state: pending
Order ORD-001 history:
  pay: pending → paid
  ship: paid → shipped
  Current state: shipped
```

**Walkthrough:** The happy path — pending → paid → shipped — flows
through correctly. Each transition is recorded with its before and after
state and the action that caused it.

Now demonstrate invalid transitions:

```python
print()
order2 = Order("ORD-002")
order2.pay()

try:
    order2.pay()
except ValueError as e:
    print(f"Caught: {e}")

try:
    order2.ship()
    order2.cancel()
except ValueError as e:
    print(f"Caught: {e}")

order2.print_history()
```

```
Caught: Cannot pay order in state 'paid'
Caught: Cannot cancel an order that has already shipped
Order ORD-002 history:
  pay: pending → paid
  ship: paid → shipped
  Current state: shipped
```

**Walkthrough:** Attempting to pay an already-paid order raises
`ValueError` immediately — the state machine rejected the invalid
transition before any state changed. Shipping the order succeeds, and the
subsequent attempt to cancel it is correctly rejected because the state
is now `shipped`. Notice `order2.print_history()` shows only the two
valid transitions — the rejected attempts left no trace in the history,
because `_transition` is only called after a state check passes.

**CS lens — what is a state machine, precisely?** A finite state machine
(FSM) is a formal computational model defined by: a finite set of states,
a starting state, a set of valid transitions (each defined as: from state
X, on event Y, go to state Z), and optionally a set of accepting/terminal
states. The order model here has four states, one starting state
(`PENDING`), and transitions explicitly defined inside each action method.
State machines appear at every level of computing: a traffic light is a
state machine, a TCP connection is a state machine (SYN_SENT →
ESTABLISHED → CLOSE_WAIT...), a regular expression is compiled into a
state machine, a vending machine is a state machine. The pattern is
ancient, well-understood, and enormously effective for any problem where
"what you can do next depends entirely on where you are now."

**SE lens.** The key design property this implementation provides is that
*every state-change rule lives in exactly one place* — inside the method
for that action, in the object that owns the state. Compare to the
scattered `if order.status ==` approach in the "problem first" section:
here, code that uses `Order` can call `pay()`, `ship()`, or `cancel()`
without needing to know the valid transitions — the state machine enforces
them internally and raises clearly if anything invalid is attempted. This
is encapsulation applied specifically to state: the object owns its own
valid state transitions, and nothing external can put it into an invalid
state directly.

**What breaks without this:** Without a state machine, every piece of
code that needs to act on an order must independently re-implement the
validity checks for whatever action it wants to perform. When a new state
is added (say, `REFUNDED`), every scattered check throughout the codebase
must be found and updated — a high-risk, error-prone process in a large
codebase. With the state machine, adding `REFUNDED` means updating one
class and adding one method, with all validity rules in one place.

### TypeScript

```typescript
type OrderState = "pending" | "paid" | "shipped" | "cancelled";
```

**Walkthrough — TypeScript syntax, explained at point of use.** `type
OrderState = "pending" | "paid" | "shipped" | "cancelled"` is a **string
literal union type** (from TypeScript Prereq 02): `OrderState` can only
ever hold one of those four exact strings. Any attempt to assign a
different string — including a typo like `"paied"` — is a compile error.
This is TypeScript doing automatically what Python's `OrderState` class
did manually with named constants, but with stronger enforcement: the
compiler rejects invalid values before the program runs, rather than
raising an `AttributeError` at runtime.

```typescript
class Order {
  private state: OrderState = "pending";
  private history: string[] = [];

  constructor(public orderId: string) {}

  getState(): OrderState {
    return this.state;
  }

  private transition(newState: OrderState, actionName: string): void {
    this.history.push(`${actionName}: ${this.state} → ${newState}`);
    this.state = newState;
  }

  pay(): void {
    if (this.state !== "pending") {
      throw new Error(`Cannot pay order in state '${this.state}'`);
    }
    this.transition("paid", "pay");
  }

  ship(): void {
    if (this.state !== "paid") {
      throw new Error(`Cannot ship order in state '${this.state}'`);
    }
    this.transition("shipped", "ship");
  }

  cancel(): void {
    if (this.state === "shipped") {
      throw new Error("Cannot cancel an order that has already shipped");
    }
    if (this.state === "cancelled") {
      throw new Error("Order is already cancelled");
    }
    this.transition("cancelled", "cancel");
  }

  printHistory(): void {
    console.log(`Order ${this.orderId} history:`);
    for (const entry of this.history) {
      console.log(`  ${entry}`);
    }
    console.log(`  Current state: ${this.state}`);
  }
}
```

**Walkthrough:** `private state: OrderState = "pending"` — the `private`
modifier (from TypeScript Prereq 01) means nothing outside `Order` can
read or write `state` directly — external code can only see it via
`getState()`. This is stricter than Python's `_state` convention, which
only signals "don't touch this" without enforcing it. `private history:
string[] = []` — `string[]` is an array of strings (from Prereq 02),
initialized to empty. `private transition(newState: OrderState, ...)` —
`private` on a method means it can only be called from inside the class,
making it impossible for external code to accidentally trigger a transition
without going through the validated action methods. The type `OrderState`
on the `newState` parameter means the compiler will reject any call to
`transition` with a string that isn't one of the four valid states — the
state machine is enforced both at runtime (via the `if` checks in each
action method) and at compile time (via the type system).

```typescript
const order = new Order("ORD-001");
console.log(`Initial state: ${order.getState()}`);

order.pay();
order.ship();
order.printHistory();

console.log();
const order2 = new Order("ORD-002");
order2.pay();

try {
  order2.pay();
} catch (error) {
  if (error instanceof Error) {
    console.log(`Caught: ${error.message}`);
  }
}

try {
  order2.ship();
  order2.cancel();
} catch (error) {
  if (error instanceof Error) {
    console.log(`Caught: ${error.message}`);
  }
}

order2.printHistory();
```

```
Initial state: pending
Order ORD-001 history:
  pay: pending → paid
  ship: paid → shipped
  Current state: shipped

Caught: Cannot pay order in state 'paid'
Caught: Cannot cancel an order that has already shipped
Order ORD-002 history:
  pay: pending → paid
  ship: paid → shipped
  Current state: shipped
```

**Walkthrough:** `error instanceof Error` (from TypeScript Prereq 02) —
TypeScript's `catch` catches any thrown value, not just `Error` instances,
so the `instanceof` check is needed before accessing `error.message`.
Python's `except ValueError as e:` targets a specific error type directly,
while TypeScript requires the manual check. The behavior is identical to
the Python version, and the outputs match exactly.

---

## Concept 2: Context

A **Context** carries shared information — data that multiple steps of an
operation need access to — through a process, without requiring every
function in that process to accept it as an explicit parameter or reach
for a global variable. A Context is typically created at the start of an
operation, populated as the operation proceeds, and discarded when the
operation completes.

### Problem first

Suppose you're processing an HTTP request through several stages:
authentication, authorization, validation, and handling. Each stage needs
to know things discovered by previous stages — the authenticated user's ID,
their permissions, the parsed request data. Without a Context, you have
two bad options: pass everything as explicit arguments through every
function (a long, fragile chain of parameters that grows every time a new
stage needs new data), or use global variables (which make the code
untestable and unsafe for concurrent requests).

### Python

```python
class RequestContext:
    def __init__(self, request_id, raw_data):
        self.request_id = request_id
        self.raw_data = raw_data
        self.user_id = None
        self.permissions = []
        self.parsed_data = None
        self.result = None

    def __str__(self):
        return (
            f"RequestContext({self.request_id}):\n"
            f"  user_id={self.user_id}\n"
            f"  permissions={self.permissions}\n"
            f"  parsed_data={self.parsed_data}\n"
            f"  result={self.result}"
        )
```

**Walkthrough:** `RequestContext` starts with the data available at
request arrival (`request_id`, `raw_data`) and sets everything else to
`None` or an empty list — these will be populated progressively as the
request moves through each processing stage. A single `RequestContext`
object flows through every stage, carrying everything each stage knows
so the next stage can build on it — rather than each stage receiving and
returning a growing number of individual parameters.

```python
def authenticate(context):
    print(f"  [Auth] Authenticating request {context.request_id}...")
    context.user_id = "user_42"
    print(f"  [Auth] Authenticated as {context.user_id}")


def authorize(context):
    print(f"  [Authz] Checking permissions for {context.user_id}...")
    context.permissions = ["read", "write"]
    print(f"  [Authz] Granted: {context.permissions}")


def validate(context):
    print(f"  [Validate] Parsing raw data: {context.raw_data!r}...")
    context.parsed_data = {"action": "create", "item": context.raw_data}
    print(f"  [Validate] Parsed: {context.parsed_data}")


def handle(context):
    if "write" not in context.permissions:
        context.result = "Forbidden"
        return
    print(f"  [Handle] Executing {context.parsed_data['action']} for {context.user_id}...")
    context.result = f"Created item: {context.parsed_data['item']}"
```

**Walkthrough — new syntax.** `{context.raw_data!r}` inside an f-string
— the `!r` conversion flag calls `repr()` on the value before inserting
it, wrapping strings in quotes and escaping special characters. This is
useful for displaying data that needs to be clearly distinguishable as a
string value rather than plain text — `"hello"` instead of `hello`.
`context.parsed_data['action']` accesses the `action` key from the
dictionary stored in `context.parsed_data` — standard dictionary key
access, exactly as from this series' dictionaries post.

Each function receives the *same* `context` object and both reads from and
writes to it freely. `authenticate` fills in `user_id`. `authorize` reads
`user_id` (set by the previous stage) and fills in `permissions`.
`validate` fills in `parsed_data`. `handle` reads both `permissions` (to
check authorization) and `parsed_data` (to know what to do) — data
discovered by earlier stages, available automatically because they all
share the same context object.

```python
def process_request(request_id, raw_data):
    context = RequestContext(request_id, raw_data)
    print(f"Processing request {request_id}:")

    authenticate(context)
    authorize(context)
    validate(context)
    handle(context)

    print(f"\nFinal context:\n{context}")
    return context


process_request("REQ-001", "widget")
```

```
Processing request REQ-001:
  [Auth] Authenticating request REQ-001...
  [Auth] Authenticated as user_42
  [Authz] Checking permissions for user_42...
  [Authz] Granted: ['read', 'write']
  [Validate] Parsing raw data: 'widget'...
  [Validate] Parsed: {'action': 'create', 'item': 'widget'}
  [Handle] Executing create for user_42...

Final context:
RequestContext(REQ-001):
  user_id=user_42
  permissions=['read', 'write']
  parsed_data={'action': 'create', 'item': 'widget'}
  result=Created item: widget
```

**Walkthrough:** The context starts nearly empty and fills progressively
as each stage runs. By the time `handle` executes, `context.user_id`,
`context.permissions`, and `context.parsed_data` are all available — not
because `handle` received them as parameters, but because they share the
same context object. The final print shows the complete state: a full
audit trail of what every stage discovered and did.

**CS lens — what makes Context different from a global variable?** A
global variable holds one value for the entire program's lifetime —
accessible from anywhere, shared across all concurrent operations. A
Context is *scoped*: created fresh for one specific operation, passed
explicitly (or injected) into the functions that need it, and discarded
when the operation completes. If two requests arrive at the same time,
each gets its own `RequestContext` — there's no shared mutable global
state for them to accidentally interfere with. This is the fundamental
reason web frameworks (Django, Flask, Express, ASP.NET) all have a
request context concept: it's the only way to carry per-request data
through a multi-stage pipeline without global state.

**SE lens.** Context is closely related to the Parameter Object refactoring
pattern: when a group of values are passed together through many function
calls, bundle them into a single object so the function signatures stay
manageable as new data needs to be carried. In real web frameworks,
the context object typically also carries the HTTP response being built
(headers, status code, body), so the same object that flows through the
pipeline also accumulates the outgoing response — one object for both
incoming data and outgoing result.

**What breaks without this:** Without a context, each stage's output must
be returned explicitly and the caller must collect and pass it forward:
`user_id = authenticate(request_id, raw_data)`, then
`permissions = authorize(user_id)`, then
`parsed = validate(raw_data, user_id)`, then
`result = handle(user_id, permissions, parsed)` — the parameter lists grow
with every new piece of data that needs to flow through, and adding one
new piece of shared data means updating the signature of every function
in the chain. A context object absorbs this growth: new shared data means
one new field on the context, with no function signature changes required.

### TypeScript

```typescript
interface RequestContext {
  requestId: string;
  rawData: string;
  userId: string | null;
  permissions: string[];
  parsedData: Record<string, string> | null;
  result: string | null;
}

function createContext(requestId: string, rawData: string): RequestContext {
  return {
    requestId,
    rawData,
    userId: null,
    permissions: [],
    parsedData: null,
    result: null,
  };
}
```

**Walkthrough — TypeScript syntax.** `interface RequestContext` declares
the shape of the context object — every field with its type. `userId:
string | null` is a union type (from Prereq 01): starts as `null`,
becomes a `string` once authentication runs. `parsedData: Record<string,
string> | null` — `Record<string, string>` (from Prereq 02) is an object
with string keys and string values, representing the parsed dictionary;
`| null` because it starts unpopulated. `function createContext(...):
RequestContext` — using a plain interface and a factory function here
rather than a `class`, exactly as in the DTO section of Glossary 05:
when an object has no behavior of its own (only data that other functions
write to), an interface plus a function is more idiomatic TypeScript than
a class. `{ requestId, rawData, ... }` uses JavaScript object shorthand:
`requestId` is shorthand for `requestId: requestId` when the property name
matches the local variable name.

```typescript
function authenticate(context: RequestContext): void {
  console.log(`  [Auth] Authenticating request ${context.requestId}...`);
  context.userId = "user_42";
  console.log(`  [Auth] Authenticated as ${context.userId}`);
}

function authorize(context: RequestContext): void {
  console.log(`  [Authz] Checking permissions for ${context.userId}...`);
  context.permissions = ["read", "write"];
  console.log(`  [Authz] Granted: ${JSON.stringify(context.permissions)}`);
}

function validate(context: RequestContext): void {
  console.log(`  [Validate] Parsing raw data: '${context.rawData}'...`);
  context.parsedData = { action: "create", item: context.rawData };
  console.log(`  [Validate] Parsed: ${JSON.stringify(context.parsedData)}`);
}

function handle(context: RequestContext): void {
  if (!context.permissions.includes("write")) {
    context.result = "Forbidden";
    return;
  }
  console.log(`  [Handle] Executing ${context.parsedData!["action"]} for ${context.userId}...`);
  context.result = `Created item: ${context.parsedData!["item"]}`;
}
```

**Walkthrough — new syntax.** `JSON.stringify(context.permissions)` —
JavaScript's built-in function for converting a value to its JSON string
representation, used here to print an array readable (`["read","write"]`)
rather than `[object Object]`, which is what `console.log` would produce
when template-literalling an array directly. `context.parsedData!["action"]`
— the `!` is the non-null assertion operator (from Prereq 02): by the
time `handle` runs, `parsedData` has been set by the `validate` stage, so
it cannot be `null` — but TypeScript's type for `parsedData` includes
`null` (because it *starts* as null), so `!` tells the compiler "trust me,
it's not null here." This is a reasonable use of `!` because the
pipeline's design guarantees `validate` runs before `handle` — though a
stricter design would have `validate` return the parsed data rather than
storing it in the context, making the type system track this guarantee
automatically. `context.permissions.includes("write")` is JavaScript's
built-in array method for checking membership — the equivalent of Python's
`"write" in context.permissions`.

```typescript
function processRequest(requestId: string, rawData: string): RequestContext {
  const context = createContext(requestId, rawData);
  console.log(`Processing request ${requestId}:`);

  authenticate(context);
  authorize(context);
  validate(context);
  handle(context);

  console.log(`\nFinal context:`);
  console.log(`  requestId: ${context.requestId}`);
  console.log(`  userId: ${context.userId}`);
  console.log(`  permissions: ${JSON.stringify(context.permissions)}`);
  console.log(`  parsedData: ${JSON.stringify(context.parsedData)}`);
  console.log(`  result: ${context.result}`);

  return context;
}

processRequest("REQ-001", "widget");
```

```
Processing request REQ-001:
  [Auth] Authenticating request REQ-001...
  [Auth] Authenticated as user_42
  [Authz] Checking permissions for user_42...
  [Authz] Granted: ["read","write"]
  [Validate] Parsing raw data: 'widget'...
  [Validate] Parsed: {"action":"create","item":"widget"}
  [Handle] Executing create for user_42...

Final context:
  requestId: REQ-001
  userId: user_42
  permissions: ["read","write"]
  parsedData: {"action":"create","item":"widget"}
  result: Created item: widget
```

---

## Connect the pieces

**State Machine** and **Context** both manage state over time, but they
solve different problems. A State Machine manages the *lifecycle* of an
object — what states it can be in, what transitions are valid between
them, and how to enforce those rules so an object can never be put into
an invalid state. A Context manages the *flow of data* through a
multi-step operation — carrying shared information from stage to stage
without growing parameter lists or reaching for global variables.

The State Machine connects back to the Dispatcher pattern from Glossary 04
(routing behavior based on the current state key, rather than a task type
key) and the Command pattern from Glossary 07 (each action method is
effectively a command that either executes or raises an error, depending
on state). The Context connects back to the Orchestrator from Glossary 04
(the orchestrator controls the sequence; the context carries the data
through it) and the DTO from Glossary 05 (a context that gets serialized
and sent to another service becomes a DTO at that boundary).

In TypeScript, the string literal union type `"pending" | "paid" |
"shipped" | "cancelled"` made the valid states explicit and compiler-
checked — a typo in a state name becomes a compile error rather than a
silent bug. The `interface` for `RequestContext` made the shape of the
shared data explicit, so every function that reads or writes a context
field is checked against the declared type.

## What breaks without these patterns

Without a State Machine, validity rules for state transitions scatter
through every function that acts on the object — each function must
re-check whether its action is currently valid, and adding a new state
or action requires finding and updating every scattered check. Without a
Context, pipeline stages either accumulate long parameter lists (adding
shared data requires updating every function signature in the chain) or
resort to global variables (making concurrent requests interfere with each
other and making the code impossible to test in isolation).

## Definition of done

- [ ] You can explain what a finite state machine is in your own words —
      specifically what "a defined set of states" and "valid transitions"
      mean, using the Order example.
- [ ] You can explain why `_transition` is private in the Python version
      and why this matters for keeping invalid states impossible.
- [ ] You've run both patterns in Python and TypeScript and confirmed
      matching output, including the invalid-transition error cases.
- [ ] You can explain the difference between a State Machine (managing an
      object's lifecycle) and a Context (carrying shared data through a
      pipeline), and name a real-world example of each.
- [ ] You can explain why TypeScript's `"pending" | "paid" | "shipped" |
      "cancelled"` catches a typo at compile time, while Python's
      `OrderState.PENDING` string constant only catches it at runtime.
- [ ] You can explain why a Context is safer than a global variable for
      carrying per-request data in a system that handles multiple
      concurrent requests.

# Communication Between Objects: Observer, Publisher/Subscriber, Callback, Event, Listener

## What you will build

Four runnable programs — one per concept — in both Python and TypeScript,
showing how objects communicate with each other without being tightly
tangled together. By the end you'll recognize why production code uses
terms like `EventEmitter`, `subscribe()`, `notify()`, and `callback` — and
understand the exact problem each one is solving.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes). No TypeScript knowledge is assumed — every new piece of syntax
is explained at the moment it appears. This post stands fully alone and
can be read independently of any other post in this series.

## Setting up to run TypeScript

TypeScript code doesn't run directly. The TypeScript compiler, `tsc`,
reads your `.ts` file, checks it for type errors, and produces a `.js` file
that Node.js (a program that runs JavaScript on your own machine, outside
a browser) can execute. For every TypeScript example below, the workflow
is:

```
npx tsc filename.ts
node filename.js
```

`npx` runs the TypeScript compiler without a separate installation step.
If `tsc` finds a type error it prints a description and refuses to compile
— this is TypeScript catching mistakes before the program ever runs. If
there are no errors, `node filename.js` runs the compiled output.

---

## The core problem all four concepts are solving

Suppose a user changes their username in a settings screen. Several parts
of the program need to react: the profile display updates, the chat
sidebar updates, an analytics system logs the change. The naive approach
is to call all of them directly from the "save username" function:

```python
def save_username(new_name):
    database.update(new_name)
    profile_display.refresh(new_name)
    chat_sidebar.refresh(new_name)
    analytics.log_change(new_name)
```

This works, but it has a real structural problem: `save_username` now
*directly knows about and depends on* every single thing that cares about
a username change. Adding a new thing that needs to react (say, a
notification system) means editing `save_username`, a function that was
already complete and tested. Removing something (say, analytics is
discontinued) means editing it again. Every interested party is hard-wired
into the thing they're interested in.

This is high **coupling** — a measure of how much one piece of code
depends on the specific details of another. Tightly coupled code is harder
to change, harder to test (you can't test `save_username` without also
having a working `profile_display`, `chat_sidebar`, and `analytics`), and
harder to extend. The four patterns in this post are different ways of
solving this same coupling problem, each with different trade-offs.

---

## Concept 1: Observer

The Observer pattern lets objects **subscribe** to changes in another
object and be notified automatically when those changes happen — without
the thing that changed needing to know specifically who's listening.

### Python

```python
class EventSystem:
    def __init__(self):
        self._observers = []

    def subscribe(self, observer):
        self._observers.append(observer)

    def unsubscribe(self, observer):
        self._observers.remove(observer)

    def notify(self, data):
        for observer in self._observers:
            observer.update(data)
```

**Walkthrough:** `self._observers = []` initializes an empty list that
will hold every object that has registered its interest. `subscribe` adds
one to the list; `unsubscribe` removes one. `notify` loops over every
registered observer and calls `.update(data)` on it — whatever `data`
represents (here, just a value being passed along). The critical design
detail: `EventSystem` doesn't know or care what types the observers are,
only that each one has an `.update()` method — Python's duck typing again.
`EventSystem` has no `import`, no reference to, and no dependency on any
specific observer class.

Now two observer classes — things that care about the event:

```python
class ProfileDisplay:
    def update(self, new_name):
        print(f"Profile display updated: showing '{new_name}'")


class ChatSidebar:
    def update(self, new_name):
        print(f"Chat sidebar updated: hello, '{new_name}'")
```

Wire them together:

```python
event_system = EventSystem()
profile = ProfileDisplay()
chat = ChatSidebar()

event_system.subscribe(profile)
event_system.subscribe(chat)

print("Username changed to 'Alice':")
event_system.notify("Alice")

print("\nUnsubscribing chat sidebar...")
event_system.unsubscribe(chat)

print("\nUsername changed to 'Bob':")
event_system.notify("Bob")
```

```
Username changed to 'Alice':
Profile display updated: showing 'Alice'
Chat sidebar updated: hello, 'Alice'

Unsubscribing chat sidebar...

Username changed to 'Bob':
Profile display updated: showing 'Bob'
```

**Walkthrough:** Both observers receive `"Alice"` when `.notify("Alice")`
is called, because both are in `_observers` at that point. After
`unsubscribe(chat)`, only `ProfileDisplay` remains in the list, so only it
receives `"Bob"`. Nothing in `EventSystem.notify()` changed between the two
calls — the change in behavior came entirely from who was registered, not
from any `if`/`elif` logic inside `notify` itself.

This directly solves the coupling problem from the introduction: adding a
new interested party (say, `Analytics`) requires zero changes to
`EventSystem` — just create the class with an `.update()` method and call
`subscribe`. Removing one requires zero changes too — just `unsubscribe`.

**CS lens — what is this, computationally?** The list of observers is a
**dispatch table** of a kind: a collection of things to call in response
to a specific event, determined at runtime by who has subscribed rather
than hard-coded in advance. This is also your first encounter with a
pattern that relies on **inversion of control**: instead of `EventSystem`
calling `ProfileDisplay` directly (control flows outward from the
center), `ProfileDisplay` registers *itself* with `EventSystem` (control
flows inward from the edges). The thing being observed doesn't reach out
to the observers — the observers reach in and register. This reversal
is what makes adding and removing observers possible without editing the
observed thing.

**SE lens.** This is the Observer pattern from the classic Design Patterns
book (published 1994, still one of the most cited books in software
engineering). It appears everywhere in production software under slightly
different names: JavaScript's DOM events (`element.addEventListener`),
Python's Django signals, React's state subscriptions, database triggers,
and more. Every time you see something called `.on()`, `.subscribe()`,
`.listen()`, or `.addObserver()`, you're looking at this same mechanism.

**What breaks without this:** The hard-wired `save_username` from the
introduction. Every new or removed interested party requires editing the
thing being observed — and in a large codebase, that function may be in a
different team's code, in a different module, subject to its own review
and release cycle. Observer decouples those concerns.

### TypeScript

```typescript
interface Observer {
  update(data: string): void;
}

class EventSystem {
  private observers: Observer[] = [];

  subscribe(observer: Observer): void {
    this.observers.push(observer);
  }

  unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data: string): void {
    for (const observer of this.observers) {
      observer.update(data);
    }
  }
}
```

**Walkthrough — new syntax.** `interface Observer { update(data: string):
void; }` is TypeScript's explicit version of the duck-typing contract Python
relied on implicitly: anything called an `Observer` must have an `update`
method taking a `string` and returning nothing. `private observers:
Observer[] = [];` declares a private property of type "array of Observer"
(`Observer[]` — the `[]` suffix means "array of this type"), initialized
immediately to an empty array. This is different from Python's pattern of
initializing in `__init__` — TypeScript lets you provide an initial value
directly alongside the property declaration.

`this.observers.filter((obs) => obs !== observer)` introduces two pieces of
new syntax at once. `.filter()` is a built-in array method that takes a
function and returns a new array containing only the items for which that
function returned `true`. `(obs) => obs !== observer` is an **arrow
function** — TypeScript/JavaScript's shorthand for a small, inline function:
`(parameter) => expression` means "a function that takes `parameter` and
returns the result of `expression`." This particular arrow function asks
"is this observer *not* the one we want to remove?" — so `.filter()` keeps
every observer except the one being unsubscribed. This is the idiomatic
TypeScript way to remove an item from an array: produce a new array without
it, rather than mutating the original array in place.

```typescript
class ProfileDisplay implements Observer {
  update(data: string): void {
    console.log(`Profile display updated: showing '${data}'`);
  }
}

class ChatSidebar implements Observer {
  update(data: string): void {
    console.log(`Chat sidebar updated: hello, '${data}'`);
  }
}

const eventSystem = new EventSystem();
const profile = new ProfileDisplay();
const chat = new ChatSidebar();

eventSystem.subscribe(profile);
eventSystem.subscribe(chat);

console.log("Username changed to 'Alice':");
eventSystem.notify("Alice");

console.log("\nUnsubscribing chat sidebar...");
eventSystem.unsubscribe(chat);

console.log("\nUsername changed to 'Bob':");
eventSystem.notify("Bob");
```

```
Username changed to 'Alice':
Profile display updated: showing 'Alice'
Chat sidebar updated: hello, 'Alice'

Unsubscribing chat sidebar...

Username changed to 'Bob':
Profile display updated: showing 'Bob'
```

**Walkthrough:** Identical behavior to the Python version. The key
addition TypeScript brings: `class ProfileDisplay implements Observer` is
compiler-verified — if `ProfileDisplay` were missing its `update` method,
or had the wrong parameter type, `tsc` would catch and describe that
mismatch before the program ever ran, rather than it crashing at the
moment `notify` tries to call `.update()` on a non-conforming object.

---

## Concept 2: Publisher/Subscriber (Pub/Sub)

Publisher/Subscriber looks similar to Observer but solves a subtly
different problem. In Observer, the thing being watched (`EventSystem`) and
the registry of who's watching are the *same object* — observers subscribe
directly to the source. In Pub/Sub, there's a third piece: a **message
broker** (also called a **bus** or **channel**) that sits in between.
Publishers send messages to the broker without knowing who's listening.
Subscribers tell the broker what kinds of messages they care about, without
knowing where those messages come from. Neither side knows the other
exists.

### Python

```python
class MessageBroker:
    def __init__(self):
        self._subscribers = {}

    def subscribe(self, topic, callback):
        if topic not in self._subscribers:
            self._subscribers[topic] = []
        self._subscribers[topic].append(callback)

    def publish(self, topic, message):
        if topic in self._subscribers:
            for callback in self._subscribers[topic]:
                callback(message)
```

**Walkthrough:** `self._subscribers = {}` initializes a **dictionary**
(recall: a mapping from keys to values) where each key is a topic name
(a string like `"user.login"` or `"payment.processed"`) and each value is
a list of callbacks — functions to call when a message on that topic
arrives. `subscribe(topic, callback)` adds a callback to the list for that
topic, creating the list first if this is the first subscriber for that
topic. `publish(topic, message)` looks up all subscribers for that topic
and calls each one with the message. If no one has subscribed to a topic,
nothing happens — `publish` doesn't crash, it just finds no one to notify.

```python
broker = MessageBroker()


def handle_login(message):
    print(f"Security handler: user logged in — {message}")


def send_welcome_email(message):
    print(f"Email service: sending welcome to {message}")


def analytics_track(message):
    print(f"Analytics: tracking login event for {message}")


broker.subscribe("user.login", handle_login)
broker.subscribe("user.login", send_welcome_email)
broker.subscribe("user.logout", analytics_track)

print("Publishing user.login event:")
broker.publish("user.login", "alice@example.com")

print("\nPublishing user.logout event:")
broker.publish("user.logout", "alice@example.com")

print("\nPublishing payment.processed (no subscribers):")
broker.publish("payment.processed", "order #1234")
```

```
Publishing user.login event:
Security handler: user logged in — alice@example.com
Email service: sending welcome to alice@example.com

Publishing user.logout event:
Analytics: tracking login event for alice@example.com

Publishing payment.processed (no subscribers):
```

**Walkthrough:** `handle_login`, `send_welcome_email`, and
`analytics_track` are plain **functions**, not methods on a class — they're
passed to `subscribe` directly as values (recall: in Python, functions are
objects, and you can assign them to variables or pass them as arguments,
exactly like any other value). Both `handle_login` and `send_welcome_email`
are subscribed to `"user.login"`, so publishing that topic calls both, in
the order they were subscribed. `analytics_track` is subscribed only to
`"user.logout"`, so the `"user.login"` publish doesn't reach it.
Publishing `"payment.processed"` does nothing — no subscribers were
registered for it, `_subscribers["payment.processed"]` doesn't exist, and
the `if topic in self._subscribers:` guard prevents a `KeyError`.

**CS lens — Observer vs Pub/Sub.** In Observer, `EventSystem` holds both
the state it's reporting and the subscriber list — they're one object.
In Pub/Sub, the `MessageBroker` holds *only* the subscriber list, with no
knowledge of where messages come from or what they mean. Publishers and
subscribers are fully decoupled from *each other*, knowing only the broker
and the topic names they agree on. This is sometimes described as
**spatially decoupled** (publisher and subscriber don't need a reference to
each other) and **temporally decoupled** (in more advanced implementations,
subscribers don't even need to be running at the same time as the publisher
— the broker can queue messages for later delivery, which is the
foundation of production systems like Kafka, RabbitMQ, and AWS SNS/SQS).

**SE lens.** Topic-based pub/sub is the architecture behind event-driven
systems at every scale: a JavaScript `addEventListener("click", handler)`,
a Django signal (`post_save.connect(handler, sender=User)`), a message
queue in a distributed microservices system. The broker is the stable
center; publishers and subscribers can be added, removed, and replaced
completely independently of each other, as long as they agree on the topic
names.

**What breaks without this:** Without topics, a single broker would
deliver *every* message to *every* subscriber — a security handler would
receive payment events it doesn't care about, and an analytics handler
would have to manually filter out everything not relevant to it. Topics
are the selective routing mechanism that makes pub/sub scale to large
systems with many different kinds of events and many different kinds of
consumers.

### TypeScript

```typescript
type Callback = (message: string) => void;
```

**Walkthrough — new syntax.** `type Callback = (message: string) => void;`
declares a **type alias** — a named shorthand for a type that would
otherwise be written out every time. `(message: string) => void` is the
type of "a function that takes a `string` parameter named `message` and
returns nothing" — a function type. Without this alias, every place we
needed to say "a callback function" would need to write that full
`(message: string) => void` in full. With the alias, we just write
`Callback`. Type aliases with `type` are similar in purpose to interfaces
(`interface`), but where interfaces define the shape of an *object*
(with named properties and methods), `type` is more flexible: it can name
any type at all, including function types, union types, or primitives.

```typescript
class MessageBroker {
  private subscribers: Record<string, Callback[]> = {};

  subscribe(topic: string, callback: Callback): void {
    if (!this.subscribers[topic]) {
      this.subscribers[topic] = [];
    }
    this.subscribers[topic].push(callback);
  }

  publish(topic: string, message: string): void {
    if (this.subscribers[topic]) {
      for (const callback of this.subscribers[topic]) {
        callback(message);
      }
    }
  }
}
```

**Walkthrough:** `Record<string, Callback[]>` — `Record<K, V>` (introduced
in this series' post on dictionaries and hash maps, explained fresh here)
describes an object where every key is of type `K` and every value is of
type `V`. Here, `K` is `string` (the topic name) and `V` is `Callback[]`
(an array of callback functions). This is TypeScript's typed equivalent of
Python's `dict` initialized as `{}`. `!this.subscribers[topic]` — the `!`
operator in TypeScript/JavaScript is logical NOT, flipping a boolean; since
accessing a key that doesn't exist in a JavaScript object returns
`undefined` (not a `KeyError` like Python — undefined is JavaScript's
"this key was never set" value), and `undefined` is falsy (treated as
`false` in a boolean context), `!this.subscribers[topic]` reads as "if this
topic has no list yet."

```typescript
const broker = new MessageBroker();

const handleLogin: Callback = (message) => {
  console.log(`Security handler: user logged in — ${message}`);
};

const sendWelcomeEmail: Callback = (message) => {
  console.log(`Email service: sending welcome to ${message}`);
};

const analyticsTrack: Callback = (message) => {
  console.log(`Analytics: tracking login event for ${message}`);
};

broker.subscribe("user.login", handleLogin);
broker.subscribe("user.login", sendWelcomeEmail);
broker.subscribe("user.logout", analyticsTrack);

console.log("Publishing user.login event:");
broker.publish("user.login", "alice@example.com");

console.log("\nPublishing user.logout event:");
broker.publish("user.logout", "alice@example.com");

console.log("\nPublishing payment.processed (no subscribers):");
broker.publish("payment.processed", "order #1234");
```

```
Publishing user.login event:
Security handler: user logged in — alice@example.com
Email service: sending welcome to alice@example.com

Publishing user.logout event:
Analytics: tracking login event for alice@example.com

Publishing payment.processed (no subscribers):
```

**Walkthrough:** `const handleLogin: Callback = (message) => { ... }` —
here the type annotation on the *variable* (`handleLogin: Callback`) and
the arrow function on the right side together tell the compiler "this
variable holds a function of the `Callback` shape." The compiler will
reject assigning anything to `handleLogin` that doesn't match that function
shape — another category of mistake caught before the program runs.

---

## Concept 3: Callback

A **callback** is the simplest of the four concepts in this post — just a
function passed as an argument to another function, to be called at some
later point. Callbacks are the primitive building block that Pub/Sub and
Observer are both built on top of; understanding them directly first makes
everything above clearer.

### Python

```python
def fetch_data(url, on_success, on_error):
    print(f"Fetching {url}...")
    if "error" in url:
        on_error(f"Could not reach {url}")
    else:
        on_success(f"Data from {url}")
```

**Walkthrough:** `fetch_data` takes three arguments: a URL (a string) and
two functions — `on_success` and `on_error`. It doesn't call those
functions immediately; it decides *which* one to call based on the outcome
of its own work. The function that gets passed in as an argument to be
called later is the **callback**. Naming callback parameters `on_<event>`
is a common, readable convention — `on_success` reads clearly as "call
this when the operation succeeds."

```python
def handle_success(data):
    print(f"Success! Got: {data}")


def handle_error(message):
    print(f"Error: {message}")


fetch_data("https://api.example.com/data", handle_success, handle_error)
fetch_data("https://error.example.com", handle_success, handle_error)
```

```
Fetching https://api.example.com/data...
Success! Got: Data from https://api.example.com/data

Fetching https://error.example.com...
Error: Could not reach https://error.example.com
```

**Walkthrough:** `handle_success` and `handle_error` are defined as plain
functions and then passed *by name* — without calling them (no `()`) — as
the second and third arguments to `fetch_data`. Inside `fetch_data`, they
arrive as `on_success` and `on_error`, local names pointing to the same
function objects. When `fetch_data` writes `on_success(...)`, it's calling
whichever function was passed in. The caller (the code doing `fetch_data(...)`)
decided what to do on success or failure; `fetch_data` itself doesn't
contain that decision — it only decides *when* to call the callbacks.

**CS lens — callbacks and control flow.** A callback inverts the usual
direction of control: normally, code you write calls code in a library.
With a callback, you hand a piece of *your* code to the library, and the
library calls it back at the appropriate moment. This is another instance
of inversion of control, the same principle noted in Observer above — and
it's the foundation of how asynchronous programming works (the `async`/
`await` post in this series covers this in depth, but the mental model is:
"start this operation, and when it finishes, call me back").

**SE lens — callbacks, named vs anonymous.** The example above uses
*named* functions as callbacks (`handle_success`, `handle_error`). In
practice you'll also see **anonymous** callbacks: functions defined inline
at the exact point they're passed, with no separate name:

```python
fetch_data(
    "https://api.example.com/data",
    lambda data: print(f"Success! Got: {data}"),
    lambda message: print(f"Error: {message}")
)
```

```
Fetching https://api.example.com/data...
Success! Got: Data from https://api.example.com/data
```

**Walkthrough:** `lambda data: print(...)` is Python's syntax for a
small, unnamed, inline function — a **lambda** (covered fully in this
series' post on functional programming). The lambda takes one argument
(`data`) and its body is the single expression after the colon. Using
lambdas for short, one-use callbacks is common and readable; for longer or
reusable logic, a named function is clearer.

**What breaks without callbacks:** Without the ability to pass functions
as arguments, `fetch_data` would either need to hard-code exactly what to
do on success or failure (losing all flexibility) or return some kind of
result code and leave the caller to write `if result == "success":` — 
pushing the branching out of where the outcome is actually known and into
every call site separately.

### TypeScript

```typescript
type SuccessHandler = (data: string) => void;
type ErrorHandler = (message: string) => void;

function fetchData(
  url: string,
  onSuccess: SuccessHandler,
  onError: ErrorHandler
): void {
  console.log(`Fetching ${url}...`);
  if (url.includes("error")) {
    onError(`Could not reach ${url}`);
  } else {
    onSuccess(`Data from ${url}`);
  }
}
```

**Walkthrough:** `url.includes("error")` is JavaScript's built-in string
method for checking whether a string contains a given substring —
equivalent to Python's `"error" in url`. `type SuccessHandler = (data:
string) => void;` and `type ErrorHandler = (message: string) => void;`
are type aliases (introduced in the Pub/Sub section above) for the two
different callback shapes, named specifically so the function signature
reads clearly: `onSuccess: SuccessHandler` communicates *what the function
is for*, not just its mechanical shape.

```typescript
function handleSuccess(data: string): void {
  console.log(`Success! Got: ${data}`);
}

function handleError(message: string): void {
  console.log(`Error: ${message}`);
}

fetchData("https://api.example.com/data", handleSuccess, handleError);
fetchData("https://error.example.com", handleSuccess, handleError);

fetchData(
  "https://api.example.com/data",
  (data) => console.log(`Inline success: ${data}`),
  (message) => console.log(`Inline error: ${message}`)
);
```

```
Fetching https://api.example.com/data...
Success! Got: Data from https://api.example.com/data
Fetching https://error.example.com...
Error: Could not reach https://error.example.com
Fetching https://api.example.com/data...
Inline success: Data from https://api.example.com/data
```

**Walkthrough:** `(data) => console.log(...)` is an arrow function used
inline — the TypeScript equivalent of Python's `lambda`. Arrow functions
used this way — defined at the exact point they're passed, with no
separate name — are extremely common in TypeScript/JavaScript, far more so
than named functions for short callbacks. The compiler checks that the
inline arrow function's parameter type (`data`, inferred as `string` from
the `SuccessHandler` type alias it's being matched against) and return
type (implicitly `void`, since `console.log` returns nothing) match what
`fetchData` expects — catching a mismatched callback shape before the
program runs.

---

## Concept 4: Event and Listener

**Event** and **Listener** are vocabulary words more than distinct
patterns — but they're named here specifically because you'll see them
constantly in real code, and understanding exactly what they mean (and how
they relate to the three concepts above) is useful.

An **event** is a notification that something happened — "a button was
clicked," "a file finished downloading," "a user logged out." Events carry
information about what happened (the data) but don't prescribe what should
happen in response. A **listener** (also called an **event handler** or
**subscriber**) is a function or object that registers interest in a
specific type of event and runs when one occurs. An **emitter** is the
thing that produces events.

This is Observer/Pub/Sub vocabulary applied to a specific context — but
the terms "event," "listener," and "emitter" are more commonly used when
talking about user interfaces (browser DOM events, GUI frameworks) or I/O
(file reads, network connections completing). "Observer" and "subscriber"
are more commonly used when talking about pure object-to-object
communication in business logic. Mechanically, they are the same idea.

### Python

```typescript
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event_name, listener):
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(listener)

    def emit(self, event_name, *args):
        if event_name in self._listeners:
            for listener in self._listeners[event_name]:
                listener(*args)
```

Wait — that block was accidentally typed as TypeScript. Here's the correct
Python version:

```python
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event_name, listener):
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(listener)

    def emit(self, event_name, *args):
        if event_name in self._listeners:
            for listener in self._listeners[event_name]:
                listener(*args)
```

**Walkthrough:** `.on(event_name, listener)` is the conventional name for
"register a listener for this event" — you'll see this name in JavaScript's
built-in `EventEmitter`, in Node.js, in many Python frameworks, and in GUI
toolkits. `.emit(event_name, *args)` is the conventional name for "fire
this event with this data." `*args` is new syntax: the `*` before a
parameter name in a Python function definition means "collect any number of
additional positional arguments into a tuple named `args`" — making
`emit` able to pass along any number of values to each listener, regardless
of how many the specific event carries. `listener(*args)` uses the same `*`
syntax in reverse: "unpack the tuple and pass its items as separate
arguments" — so if `emit` was called with `("click", 42, "hello")`, each
listener would be called as `listener(42, "hello")`.

```python
emitter = EventEmitter()


def on_click(x, y):
    print(f"Button clicked at position ({x}, {y})")


def on_click_logger(x, y):
    print(f"Logger: recorded click at ({x}, {y})")


def on_hover(x, y):
    print(f"Hover detected at ({x}, {y})")


emitter.on("click", on_click)
emitter.on("click", on_click_logger)
emitter.on("hover", on_hover)

print("Emitting click event:")
emitter.emit("click", 150, 200)

print("\nEmitting hover event:")
emitter.emit("hover", 300, 100)

print("\nEmitting scroll event (no listeners):")
emitter.emit("scroll", 0, 50)
```

```
Emitting click event:
Button clicked at position (150, 200)
Logger: recorded click at (150, 200)

Emitting hover event:
Hover detected at (300, 100)

Emitting scroll event (no listeners):
```

**Walkthrough:** Two listeners registered for `"click"` both fire; one
listener registered for `"hover"` fires for that event; emitting `"scroll"`
does nothing because nothing registered for it. The pattern is identical to
Pub/Sub above — the vocabulary is what differs. In a browser, this same
shape is what JavaScript's `element.addEventListener("click", handler)` and
`element.dispatchEvent(event)` implement. Node.js has a built-in
`EventEmitter` class doing exactly this. What you've built here is a
minimal working version of the same mechanism.

### TypeScript

```typescript
type Listener = (...args: any[]) => void;
```

**Walkthrough — new syntax.** `...args: any[]` in a TypeScript function
type means "any number of arguments of any type" — the `...` is the
**rest parameter syntax** (TypeScript's equivalent of Python's `*args`),
and `any[]` is an array where each element can be of literally any type.
`any` is TypeScript's escape hatch from its own type system: a value of
type `any` bypasses all type checking. Using `any` is generally a last
resort, because it opts you out of the safety TypeScript provides — but
here it's justified: a generic event emitter genuinely doesn't know in
advance what shape each event's data will have, so insisting on a specific
type for all possible events would make the emitter unusable for most of
them. In production TypeScript code, more sophisticated generic types can
make this safer, but the pattern here makes the mechanism clear.

```typescript
class EventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(eventName: string, listener: Listener): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  emit(eventName: string, ...args: any[]): void {
    if (this.listeners[eventName]) {
      for (const listener of this.listeners[eventName]) {
        listener(...args);
      }
    }
  }
}

const emitter = new EventEmitter();

const onClick = (x: number, y: number) => {
  console.log(`Button clicked at position (${x}, ${y})`);
};

const onClickLogger = (x: number, y: number) => {
  console.log(`Logger: recorded click at (${x}, ${y})`);
};

const onHover = (x: number, y: number) => {
  console.log(`Hover detected at (${x}, ${y})`);
};

emitter.on("click", onClick);
emitter.on("click", onClickLogger);
emitter.on("hover", onHover);

console.log("Emitting click event:");
emitter.emit("click", 150, 200);

console.log("\nEmitting hover event:");
emitter.emit("hover", 300, 100);

console.log("\nEmitting scroll event (no listeners):");
emitter.emit("scroll", 0, 50);
```

```
Emitting click event:
Button clicked at position (150, 200)
Logger: recorded click at (150, 200)

Emitting hover event:
Hover detected at (300, 100)

Emitting scroll event (no listeners):
```

---

## Connect the pieces

All four concepts in this post are answers to the same problem — how does
one part of a program tell other parts something happened, without
hard-wiring knowledge of exactly who's listening into the thing that's
talking?

**Callback** is the primitive: pass a function to be called later.
**Observer** builds a *registry* of callbacks around a specific source of
events. **Pub/Sub** adds a *broker* in between, so publishers and
subscribers don't even need references to each other — they just agree on
topic names. **Event/Listener** is Observer/Pub/Sub vocabulary used
specifically in UI and I/O contexts, where the standard method names are
`.on()` and `.emit()` rather than `.subscribe()` and `.notify()`.

The progression from Callback → Observer → Pub/Sub isn't about one being
better than the others — it's about how much coupling is acceptable for a
given use case. A callback is fine when one function needs to tell its
immediate caller what happened. Observer is right when multiple things need
to react to a single source. Pub/Sub is right when publishers and
subscribers are in different modules, services, or systems, and shouldn't
even know each other exists.

In TypeScript, every mechanism above gained an explicit, compiler-checked
type for what a listener or callback must look like — meaning a wrongly
shaped function passed as an observer or callback becomes a compile error
rather than a runtime crash on the first event.

## What breaks without these patterns

Without any of these four tools, inter-object communication either
hard-codes all recipients directly in the thing that's sending (high
coupling, hard to add/remove recipients without modifying the sender) or
forces recipients to actively poll for changes at regular intervals ("has
anything changed? no. has anything changed? no."), which is wasteful,
slow, and still requires recipients to know what to poll.

## Definition of done

- [ ] You can explain, in your own words, what distinguishes Observer from
      Pub/Sub — specifically, why Pub/Sub introduces a broker and what
      problem that solves that Observer doesn't.
- [ ] You can explain what a callback is and what "passing a function as an
      argument" means mechanically in Python.
- [ ] You've run all four patterns in both Python and TypeScript and seen
      matching output.
- [ ] You can explain what `*args` does in Python and what `...args` does
      in TypeScript, and why the EventEmitter needs them.
- [ ] You can explain why the arrow function `.filter((obs) => obs !==
      observer)` in the TypeScript Observer's `unsubscribe` method produces
      a new array without the removed observer, rather than mutating the
      existing array.
- [ ] You can name at least two real-world systems or frameworks where you'd
      encounter each of the four concepts in this post.
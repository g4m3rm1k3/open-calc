# Lesson 4e: Message Passing Through a Broker

**What you will build:** A small, fully runnable, hand-rolled lab in
plain Java.

**What you need to know first:** Lesson 2e's `Activity`.

**Terms introduced in this lesson:**

- **Message passing through a broker** — two components communicate by
  each going through a separate, central dispatcher, describing what
  they want as data, rather than holding a direct reference to each
  other and calling one another's methods.

---

## Concept Unit: Message Passing Through a Broker

### The Problem

One component asking another to do something usually means holding a
direct reference to it and calling a method on it — exactly what every
lesson so far has done. Some systems deliberately avoid this: the
sender doesn't hold a reference to the receiver at all, and doesn't
even necessarily know which specific receiver, if any, will handle the
request. Instead, the sender describes *what it wants*, as data, and
hands that description to a separate, central dispatcher, which
decides what happens next.

### Introduce the Concept in Isolation

```
mkdir lesson-4e
cd lesson-4e
```

Create `Main.java`:

```java
class Request {
    String action;

    Request(String action) {
        this.action = action;
    }
}

class Broker {
    void dispatch(Request request) {
        if (request.action.equals("OPEN_SETTINGS")) {
            System.out.println("Broker: opening the settings screen.");
        } else if (request.action.equals("OPEN_PROFILE")) {
            System.out.println("Broker: opening the profile screen.");
        } else {
            System.out.println("Broker: no handler for " + request.action);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Broker broker = new Broker();
        broker.dispatch(new Request("OPEN_SETTINGS"));
        broker.dispatch(new Request("OPEN_PROFILE"));
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Broker: opening the settings screen.
Broker: opening the profile screen.
```

#### Execution Trace

Two separate `Request` objects are built and dispatched, one after the
other, each routed independently:

1. `new Request("OPEN_SETTINGS")` builds the first request object,
   holding only the string `"OPEN_SETTINGS"` — no connection to any
   real screen exists inside this object itself.
2. `broker.dispatch(...)` receives it and checks `request.action`
   against its own known cases; `"OPEN_SETTINGS"` matches the first
   branch, printing the settings message.
3. `new Request("OPEN_PROFILE")` builds a second, entirely independent
   request object.
4. `broker.dispatch(...)` receives this second object separately;
   `"OPEN_PROFILE"` matches the second branch this time, printing the
   profile message — proof the same dispatcher correctly routes
   different requests to different outcomes, based only on each
   request's own data.

`Main` never holds a reference to "the settings screen" or "the
profile screen" directly — it builds a `Request`, describing *what* it
wants as plain data, and hands it to `Broker`, which decides what
actually happens. This is `message passing through a broker` —
**first appearance**: two components communicate by each going through
a separate, central dispatcher, describing what they want as data,
rather than holding a direct reference to each other and calling one
another's methods.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `class Request { String action; Request(String action) { ... } }` —
   **(a) first appearance** of this shape: a plain data object
   describing a desired action, with no behavior of its own beyond
   holding that description.
2. `class Broker { void dispatch(Request request) { ... } }` — **(a)
   first appearance** of the dispatcher itself: the one piece of code
   that actually decides what a given request results in, based
   entirely on the data inside it.
3. `if (request.action.equals("OPEN_SETTINGS")) { ... } else if (...) {
   ... }` — genuinely basic conditional logic, applied here to route a
   request rather than validate input.
4. `broker.dispatch(new Request("OPEN_SETTINGS"));` — `Main`
   constructs the request and hands it to the broker; nothing in this
   line references "the settings screen" as an object at all — only as
   a string describing an intention.

### CS Lens

Message passing through a broker decouples *what* is requested from
*how* it's fulfilled — the sender never needs to know which piece of
code, if any, actually handles a given action, only how to describe
the request correctly. This is a genuinely different shape from every
direct method call this course has used so far, where the caller
always holds a direct reference to exactly what it's calling.

Also recognized in: actor-model concurrency (messages passed between
actors that never hold direct references to each other), pub/sub
message queues, HTTP requests routed to a named endpoint by a web
server rather than a client connecting directly to a specific handler
function.

### SE Lens

The alternative — `Main` holding direct references to a
`SettingsScreen` and a `ProfileScreen` object, calling methods on them
directly — was not chosen for cases where the sender genuinely
shouldn't need to construct, or even know about, the receiver
directly. The broker pattern trades a small amount of indirection
(describing a request as data, rather than calling a method directly)
for real decoupling: new request types, or new handlers, can be added
to `Broker` without `Main` ever changing.

---

## Connect the Pieces

`broker.dispatch(new Request("OPEN_SETTINGS"))` established the
general shape: describe a request as data, hand it to a central
dispatcher, never hold a direct reference to what actually handles it.
The next lesson (`Intent`) shows Android's own real version of exactly
this pattern.

## What Breaks Without This

`Main` holding a direct reference to a `SettingsScreen` object, calling
`.open()` on it directly, would need to know about and construct that
specific screen object itself — coupling `Main` to every possible
destination it might ever request, rather than describing the request
generically as data.

## Exercises

1. Add a third action, `"OPEN_HELP"`, to this lesson's own `Broker`
   example, and a matching `else if` branch, then confirm dispatching
   it produces the correct new message.
2. Add extra data to this lesson's own `Request` class (a `String
   payload` field) and thread a value through `dispatch` to be printed
   alongside the routed action.
3. Explain, in your own words, why `Main` never holds a direct
   reference to "the settings screen" as an object.

## Definition of Done

- [ ] You ran the `Broker`/`Request` example and saw the real, routed
      output for both actions.
- [ ] You completed Exercise 1 and added a working third action.
- [ ] You can state, without looking back at this lesson, what a
      sender describes instead of holding a direct reference to the
      receiver.

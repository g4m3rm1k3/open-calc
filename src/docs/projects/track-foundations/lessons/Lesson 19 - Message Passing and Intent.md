# Lesson 19: Message Passing and Intent

**What you will build:** The first unit is a small, fully runnable,
hand-rolled lab in plain Java. The second reads Android's real `Intent`
contract directly, connecting it back to the pattern already built and
run.

**What you need to know first:** Lesson 10's `Activity`.

**Terms introduced in this lesson:**

- **Message passing through a broker** — two components communicate by
  each going through a separate, central dispatcher, describing what they
  want as data, rather than holding a direct reference to each other and
  calling one another's methods.
- **`Intent`** — a data object describing a desired action or
  destination, handed to the Android OS to route, rather than the source
  component calling the destination directly.

---

## Concept Unit: Message Passing Through a Broker

### The Problem

One component asking another to do something usually means holding a
direct reference to it and calling a method on it — exactly what every
lesson so far has done. Some systems deliberately avoid this: the sender
doesn't hold a reference to the receiver at all, and doesn't even
necessarily know which specific receiver, if any, will handle the
request. Instead, the sender describes *what it wants*, as data, and
hands that description to a separate, central dispatcher, which decides
what happens next.

### Introduce the Concept in Isolation

```
mkdir lesson-19
cd lesson-19
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
   holding only the string `"OPEN_SETTINGS"` — no connection to any real
   screen exists inside this object itself.
2. `broker.dispatch(...)` receives it and checks `request.action` against
   its own known cases; `"OPEN_SETTINGS"` matches the first branch,
   printing the settings message.
3. `new Request("OPEN_PROFILE")` builds a second, entirely independent
   request object.
4. `broker.dispatch(...)` receives this second object separately;
   `"OPEN_PROFILE"` matches the second branch this time, printing the
   profile message — proof the same dispatcher correctly routes different
   requests to different outcomes, based only on each request's own data.

`Main` never holds a reference to "the settings screen" or "the profile
screen" directly — it builds a `Request`, describing *what* it wants as
plain data, and hands it to `Broker`, which decides what actually
happens. This is `message passing through a broker` — **first
appearance**: two components communicate by each going through a
separate, central dispatcher, describing what they want as data, rather
than holding a direct reference to each other and calling one another's
methods.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `class Request { String action; Request(String action) { ... } }` —
   **(a) first appearance** of this shape: a plain data object describing
   a desired action, with no behavior of its own beyond holding that
   description.
2. `class Broker { void dispatch(Request request) { ... } }` — **(a)
   first appearance** of the dispatcher itself: the one piece of code
   that actually decides what a given request results in, based entirely
   on the data inside it.
3. `if (request.action.equals("OPEN_SETTINGS")) { ... } else if (...) {
   ... }` — **(b) reappearing** command-dispatch shape, matching strings
   against known actions — genuinely basic conditional logic, sorted
   **(c)**, applied here to route a request rather than validate input.
4. `broker.dispatch(new Request("OPEN_SETTINGS"));` — `Main` constructs
   the request and hands it to the broker; nothing in this line
   references "the settings screen" as an object at all — only as a
   string describing an intention.

### CS Lens

Message passing through a broker decouples *what* is requested from *how*
it's fulfilled — the sender never needs to know which piece of code, if
any, actually handles a given action, only how to describe the request
correctly. This is a genuinely different shape from every direct method
call this curriculum has used so far, where the caller always holds a
direct reference to exactly what it's calling.

Also recognized in: actor-model concurrency (messages passed between
actors that never hold direct references to each other), pub/sub message
queues, HTTP requests routed to a named endpoint by a web server rather
than a client connecting directly to a specific handler function.

### SE Lens

The alternative — `Main` holding direct references to a `SettingsScreen`
and a `ProfileScreen` object, calling methods on them directly — was not
chosen for cases where the sender genuinely shouldn't need to construct,
or even know about, the receiver directly. The broker pattern trades a
small amount of indirection (describing a request as data, rather than
calling a method directly) for real decoupling: new request types, or new
handlers, can be added to `Broker` without `Main` ever changing.

---

## Concept Unit: `Intent` — Android's Real Broker

### The Problem

Lesson 10 built and ran `MainActivity`, but never showed how one Activity
could ask Android to open a *different* Activity. Activities cannot hold
direct references to each other and call `new` on one another — nothing
in Android permits an Activity to simply construct another Activity
object directly; the OS itself owns that entire lifecycle, exactly as
Lesson 10 established. Some indirection is required.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent intent = new Intent(this, SettingsActivity.class);
startActivity(intent);
```

This is an `Intent` — **first appearance**: a data object describing a
desired action or destination, handed to the Android OS to route, rather
than the source component calling the destination directly. `new
Intent(this, SettingsActivity.class)` does not construct a
`SettingsActivity` at all — it constructs a description: "open whatever
`SettingsActivity` is." `startActivity(intent)` hands that description
to the OS, which is what actually constructs and drives the real
`SettingsActivity` object, exactly as Lesson 10 established Android alone
does.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent(this, SettingsActivity.class)` — **(a) first appearance**
   of `Intent`'s own constructor shape: `this` identifies the requesting
   Activity (a `Context`, from Lesson 10's own `onCreate(Bundle
   savedInstanceState)` — the environment this request originates from);
   `SettingsActivity.class` names the *class* to route to, not an object
   of it — there is no `new SettingsActivity()` anywhere in this code.
2. `startActivity(intent)` — **(a) first appearance**: hands the
   `Intent`'s description to the Android OS. This call does not return
   the new screen, or block until it appears — it simply requests that
   the OS route this description somewhere, the same fire-and-describe
   shape as this lesson's own `broker.dispatch(new Request(...))`.

### CS Lens

`Intent` is this lesson's own broker pattern, applied at the scale of an
entire operating system: `SettingsActivity.class` plays the same role
this lesson's own `"OPEN_SETTINGS"` string did — a description of a
desired destination, not a direct reference to it — and the Android OS
plays the role `Broker` played, deciding what actually happens with that
description, including constructing and driving the real destination
Activity, which the requesting Activity itself never does directly.

Also recognized in: any OS-level inter-process communication mechanism
generally (one process can't hold a direct object reference into
another's memory space at all — some broker, mediated by the OS, is
always required), the same shape recurring wherever two independently-
running components need to communicate without shared memory.

### SE Lens

The alternative — Activities holding direct references to each other and
calling methods directly — was not chosen because Android's own
inversion of control (Lesson 10) already means no Activity constructs
another Activity directly; only the OS does. `Intent` is the required
description-based indirection that makes requesting a screen change
possible at all, given that the OS, not the requesting Activity, is
solely responsible for actually constructing and driving the next
screen.

---

## Connect the Pieces

`Broker.dispatch(new Request("OPEN_SETTINGS"))` established the general
shape: describe a request as data, hand it to a central dispatcher, never
hold a direct reference to what actually handles it. `new Intent(this,
SettingsActivity.class)` plus `startActivity(intent)` is that exact
pattern, real: `SettingsActivity.class` is the description, the Android
OS is the broker, and the requesting Activity never constructs the
destination Activity itself — the same indirection this lesson's own
hand-rolled `Broker` already demonstrated in miniature.

## What Breaks Without This

Constructing an Activity directly, bypassing `Intent` entirely, fails to
compile in the way this curriculum's own code has been written, but is
worth stating precisely: Android provides no supported way to do this at
all — there is no `new SettingsActivity()` call that would produce a
correctly OS-managed screen, because a directly-constructed Activity
object never receives the lifecycle calls (`onCreate`, `onStart`, and the
rest of Lesson 10's own sequence) the OS is solely responsible for
triggering. This is the concrete reason `Intent` exists at all: not
convenience, but the only sanctioned path to a real, working screen
transition.

## Exercises

1. Add a third action, `"OPEN_HELP"`, to this lesson's own `Broker`
   example, and a matching `else if` branch, then confirm dispatching it
   produces the correct new message.
2. Read `Intent`'s real constructor shape again and explain, in your own
   words, why `this` (a `Context`) is required as the first argument —
   connect it back to Lesson 10's own `Context` explanation.
3. Add extra data to this lesson's own `Request` class (a `String
   payload` field) and thread a value through `dispatch` to be printed
   alongside the routed action — a small-scale version of the way a real
   `Intent` can carry extra data alongside its destination.

## Definition of Done

- [ ] You ran the `Broker`/`Request` example and saw the real, routed
      output for both actions.
- [ ] You completed Exercise 1 and added a working third action.
- [ ] You read `Intent`'s real constructor and `startActivity` call and
      can explain what each of `Intent`'s two constructor arguments
      means.
- [ ] You can state, without looking back at this lesson, why
      `SettingsActivity.class` appears in `Intent`'s constructor instead
      of `new SettingsActivity()`.

---
concept: 024-observer-pattern
name: Observer Pattern
---

## Definition

The observer pattern lets one object (the subject) notify a list of other objects
(observers) automatically whenever something changes, without the subject needing
to know anything specific about who's listening.

## Problem

When several unrelated parts of a program all need to react to the same event —
a UI updating, a log being written, an email being sent, all when an order is
placed — hardcoding calls to all of them inside the order-placing code tightly
couples it to every one of those reactions, and adding a new reaction means
editing that code again.

## Execution

subject.subscribe(observerA)
↓
subject.subscribe(observerB)
↓
subject.notify(data) called
↓
Loop over every subscribed observer
↓
observerA.update(data) runs
↓
observerB.update(data) runs
↓
Subject never needed to know what either observer actually does with the data

## Computer Science

This is the same pattern behind the **publish-subscribe** model broadly:
decoupling "something happened" from "here's what to do about it." The subject
maintains a list of observers and calls a known method on each (`update`,
`notify`, `on_change`) — polymorphism (see that concept) is what lets each
observer respond differently despite being called identically.

Tags: Publish-subscribe, Decoupling, Event-driven programming

## Software Engineering

The observer pattern is what event listeners, reactive UI frameworks, and message
queues are all built on — a button's `addEventListener('click', ...)` is a
one-observer version of exactly this pattern. New reactions can be added by
subscribing a new observer, with zero changes to the subject that triggers them.

Tags: Event-driven architecture, Loose coupling, Reactive programming

## Common Mistakes

- Forgetting to unsubscribe an observer that's no longer needed, causing it to keep reacting to events (and holding memory) long after it should have been discarded — a common source of memory leaks in long-running UIs.
- Having observers depend on the order they're notified in — the pattern doesn't guarantee any particular order, and code that silently assumes one is fragile.

## Exercises

- In the JavaScript example, add a second observer function and confirm both run when `notify` is called.
- In Python, remove an observer with a new `unsubscribe` method you write yourself, and confirm it stops being called afterward.

## javascript

```javascript
class OrderSubject {
  observers = []
  subscribe(fn) { this.observers.push(fn) }
  notify(order) {
    for (const fn of this.observers) fn(order)
  }
}

const subject = new OrderSubject()
subject.subscribe(order => console.log('Emailing receipt for', order))
subject.subscribe(order => console.log('Logging order', order))
subject.notify('Order #42')
```
Walkthrough: `subscribe` adds a function to the observer list; `notify` calls
every one of them with the same data. `OrderSubject` never mentions emailing or
logging anywhere in its own code — those reactions live entirely in the functions
passed to `subscribe`, fully decoupled from the subject itself.

## python

```python
class OrderSubject:
    def __init__(self):
        self.observers = []

    def subscribe(self, fn):
        self.observers.append(fn)

    def notify(self, order):
        for fn in self.observers:
            fn(order)

subject = OrderSubject()
subject.subscribe(lambda order: print('Emailing receipt for', order))
subject.subscribe(lambda order: print('Logging order', order))
subject.notify('Order #42')
```
Walkthrough: identical structure to the JavaScript version, using Python's
`lambda` (an anonymous inline function) in place of JavaScript's arrow functions
for the observer callbacks — same mechanism either way.

## java

```java
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

class OrderSubject {
    List<Consumer<String>> observers = new ArrayList<>();
    void subscribe(Consumer<String> fn) { observers.add(fn); }
    void notify(String order) {
        for (Consumer<String> fn : observers) fn.accept(order);
    }
}

OrderSubject subject = new OrderSubject();
subject.subscribe(order -> System.out.println("Emailing receipt for " + order));
subject.subscribe(order -> System.out.println("Logging order " + order));
subject.notify("Order #42");
```
Walkthrough: `Consumer<String>` is Java's built-in type for "a function that takes
a `String` and returns nothing" — the observer's shape. `fn.accept(order)` calls
it, playing the same role as directly calling `fn(order)` does in JavaScript and
Python.

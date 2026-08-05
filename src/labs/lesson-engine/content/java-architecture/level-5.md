---
series: java-architecture
level: 5
title: The State Pattern
lang: java
---

# The State Pattern

An order is not just data — it moves through a lifecycle: placed, paid, shipped, delivered, or cancelled. The natural first instinct is a handful of booleans (`isPaid`, `isShipped`, `isCancelled`). This lesson shows exactly where that instinct breaks down, and replaces it with the **State pattern** — Gang of Four again — documented as: "allow an object to alter its behavior when its internal state changes; the object will appear to change its class."

## The boolean-flag version

```java
public class Main {
    static class Order {
        String customerEmail;
        boolean isPaid = false;
        boolean isShipped = false;
        boolean isDelivered = false;
        boolean isCancelled = false;

        Order(String customerEmail) {
            this.customerEmail = customerEmail;
        }

        void pay() {
            if (isCancelled) throw new IllegalStateException("Cannot pay a cancelled order");
            isPaid = true;
        }

        void ship() {
            if (!isPaid) throw new IllegalStateException("Cannot ship an unpaid order");
            if (isCancelled) throw new IllegalStateException("Cannot ship a cancelled order");
            isShipped = true;
        }

        void cancel() {
            if (isShipped) throw new IllegalStateException("Cannot cancel a shipped order");
            isCancelled = true;
        }
    }

    public static void main(String[] args) {
        Order order = new Order("alice@example.com");
        order.pay();
        order.ship();
        System.out.println("Paid: " + order.isPaid + ", Shipped: " + order.isShipped);

        try {
            order.cancel();
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}
```

```text
Paid: true, Shipped: true
Rejected: Cannot cancel a shipped order
```

**The problem, stated concretely:** four booleans describe `2^4 = 16` theoretical combinations, but only five are actually valid order states (placed, paid, shipped, delivered, cancelled) — the other eleven (`isShipped = true` while `isPaid = false`, for instance) are nonsense states the type system does nothing to prevent. Every method has to re-check every other flag to guard against combinations that should never exist in the first place, and that guard logic only grows as more states are added (`isRefunded`? `isReturned`?).

## Naming the real states with an interface

```java
public class Main {
    static class Order {
        String customerEmail;
        OrderState state;

        Order(String customerEmail) {
            this.customerEmail = customerEmail;
            this.state = new PlacedState();  // every order starts here
        }

        void pay()   { state.pay(this); }
        void ship()  { state.ship(this); }
        void cancel(){ state.cancel(this); }

        void transitionTo(OrderState newState) {
            System.out.println(customerEmail + ": " + state.name() + " -> " + newState.name());
            this.state = newState;
        }
    }

    // STATE interface: every real state implements this shape.
    interface OrderState {
        String name();
        void pay(Order order);
        void ship(Order order);
        void cancel(Order order);
    }

    static class PlacedState implements OrderState {
        @Override public String name() { return "PLACED"; }
        @Override public void pay(Order order)  { order.transitionTo(new PaidState()); }
        @Override public void ship(Order order) { throw new IllegalStateException("Cannot ship an unpaid order"); }
        @Override public void cancel(Order order) { order.transitionTo(new CancelledState()); }
    }

    static class PaidState implements OrderState {
        @Override public String name() { return "PAID"; }
        @Override public void pay(Order order)  { throw new IllegalStateException("Order is already paid"); }
        @Override public void ship(Order order) { order.transitionTo(new ShippedState()); }
        @Override public void cancel(Order order) { order.transitionTo(new CancelledState()); }
    }

    static class ShippedState implements OrderState {
        @Override public String name() { return "SHIPPED"; }
        @Override public void pay(Order order)  { throw new IllegalStateException("Order is already paid"); }
        @Override public void ship(Order order) { throw new IllegalStateException("Order is already shipped"); }
        @Override public void cancel(Order order) { throw new IllegalStateException("Cannot cancel a shipped order"); }
    }

    static class CancelledState implements OrderState {
        @Override public String name() { return "CANCELLED"; }
        @Override public void pay(Order order)  { throw new IllegalStateException("Order is cancelled"); }
        @Override public void ship(Order order) { throw new IllegalStateException("Order is cancelled"); }
        @Override public void cancel(Order order) { throw new IllegalStateException("Order is already cancelled"); }
    }

    public static void main(String[] args) {
        Order order = new Order("bob@example.com");
        order.pay();
        order.ship();

        try {
            order.cancel();
        } catch (IllegalStateException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}
```

```text
bob@example.com: PLACED -> PAID
bob@example.com: PAID -> SHIPPED
Rejected: Cannot cancel a shipped order
```

**Walkthrough:** `Order` no longer stores four independent booleans — it stores exactly one field, `state`, typed as the `OrderState` interface. Calling `order.pay()` does not check any flags itself; it simply delegates to `state.pay(this)`, and whichever concrete state object is currently assigned decides what happens — `PlacedState.pay` transitions to `PaidState`, but `ShippedState.pay` throws, because you cannot pay for an order that already shipped. `transitionTo` is the one place a state change actually happens, and it prints the transition so you can see the lifecycle as it moves.

**CS lens:** This is a **finite state machine**, made explicit as real code instead of implicit in scattered boolean checks: a fixed set of named states (`PLACED`, `PAID`, `SHIPPED`, `CANCELLED`), and for each state, a fixed set of allowed transitions. Every transition rule now lives inside the one state class it belongs to (`ShippedState` knows it cannot be cancelled) instead of being re-derived from a combination of flags every time a method runs.

## Only reachable states can exist

```java
public class Main {
    // (Order, OrderState, PlacedState, PaidState, ShippedState, CancelledState as above)

    public static void main(String[] args) {
        Order order = new Order("carol@example.com");

        // Attempting an invalid transition from PLACED:
        try {
            order.ship();  // cannot ship before paying
        } catch (IllegalStateException e) {
            System.out.println("Blocked: " + e.getMessage());
        }

        order.pay();
        try {
            order.pay();  // cannot pay twice
        } catch (IllegalStateException e) {
            System.out.println("Blocked: " + e.getMessage());
        }

        order.ship();
        System.out.println("Final state reached successfully.");
    }
}
```

```text
Blocked: Cannot ship an unpaid order
carol@example.com: PLACED -> PAID
Blocked: Order is already paid
carol@example.com: PAID -> SHIPPED
Final state reached successfully.
```

**SE lens:** With the boolean-flag version, "unpaid but shipped" was a state the *type system* allowed to exist — it just happened to be prevented by a guard clause someone remembered to write, in one specific method. With the State pattern, "unpaid but shipped" is not a state that can be *represented* at all: `order.state` can only ever be one concrete `OrderState` object at a time, and the only way to reach `ShippedState` is through `PaidState.ship()`, which only exists on `PaidState` in the first place. This is **making illegal states unrepresentable** — a stronger guarantee than "we remembered to check," because there is nothing left to remember.

## Recognition

```text
Today: State — an object's behavior changes based on which state object it currently holds

Also recognized in: TCP connection states (LISTEN, SYN_SENT, ESTABLISHED, CLOSED),
a traffic light controller, a video player (playing/paused/buffering/stopped),
a vending machine's coin-accepting logic, and every UI "wizard" component that
only allows Next/Back based on which step it's currently on.
```

## Challenge: order_state_machine

Implement the order lifecycle as a real state machine.

Write:
- `interface OrderState` with `String name()`, `void pay(Order order)`, `void ship(Order order)`, `void cancel(Order order)`
- `class PlacedState`, `class PaidState`, `class ShippedState`, `class CancelledState`, each implementing `OrderState` with the transition rules shown above (`PLACED` can pay or cancel; `PAID` can ship or cancel; `SHIPPED` can do nothing further — all three throw `IllegalStateException` for disallowed actions; `CANCELLED` allows nothing)
- `class Order` with a constructor taking `String customerEmail` (starts in `PlacedState`), methods `pay()`, `ship()`, `cancel()` that delegate to the current state, `void transitionTo(OrderState newState)` that reassigns `state`, and `String currentStateName()` returning `state.name()`

```challenge
class OrderState {
    // TODO: make this an interface
}

class PlacedState {
    // TODO
}

class PaidState {
    // TODO
}

class ShippedState {
    // TODO
}

class CancelledState {
    // TODO
}

class Order {
    // TODO
}
```

```test
Order order = new Order("alice@example.com");
assert order.currentStateName().equals("PLACED")

boolean blockedShipBeforePay = false;
try { order.ship(); } catch (IllegalStateException e) { blockedShipBeforePay = true; }
assert blockedShipBeforePay

order.pay();
assert order.currentStateName().equals("PAID")

order.ship();
assert order.currentStateName().equals("SHIPPED")

boolean blockedCancelAfterShip = false;
try { order.cancel(); } catch (IllegalStateException e) { blockedCancelAfterShip = true; }
assert blockedCancelAfterShip

Order cancelled = new Order("bob@example.com");
cancelled.cancel();
assert cancelled.currentStateName().equals("CANCELLED")
```

# SE Masterclass — LAB-19 — Composition over Inheritance

**Language: TypeScript (Node.js)** — same phase as LAB-17–18.

**Prerequisites:** LAB-18 (SOLID Principles). LSP's Square/Rectangle failure was one symptom of a bigger disease — this lab names the disease (fragile inheritance hierarchies) and the cure (composition).

**What this lab adds:**
- Why deep inheritance hierarchies break as requirements grow (the "fragile base class" problem)
- Composition: building behavior by COMBINING small pieces instead of inheriting from a class
- Mixins: adding a capability to several unrelated classes without a shared rigid hierarchy
- Why modern frameworks (React, Vue, hooks) chose composition over class inheritance

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `Duck extends Animal`, `Duck extends Flyable`, `Duck extends Swimmable` — most languages don't even allow inheriting from three classes at once. Why might that restriction actually be a hint, not just an annoyance?
> 2. A `RubberDuck` inherits `quack()` from `Duck` but should NOT be able to `fly()`, even though `Duck` can fly. What does forcing `RubberDuck extends Duck` get wrong?
> 3. If two unrelated classes, `Order` and `User`, both need a `createdAt` timestamp and a `toJSON()` method, does giving them a shared PARENT class make sense?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Inheritance: The Duck Problem ===
MallardDuck.fly(): flying with wings
MallardDuck.quack(): Quack!
RubberDuck.fly(): flying with wings   ← BUG: rubber ducks can't fly!
RubberDuck.quack(): Squeak!

=== Composition: Behaviors as Injected Objects ===
mallard.performFly(): flying with wings
mallard.performQuack(): Quack!
rubberDuck.performFly(): cannot fly
rubberDuck.performQuack(): Squeak!
decoyDuck.performFly(): cannot fly
decoyDuck.performQuack(): cannot quack

=== Composition: Swap Behavior at Runtime ===
mallard before: flying with wings
mallard.setFlyBehavior(new NoFly()) — a mallard raised in captivity, injured wing
mallard after: cannot fly

=== Mixins: Shared Capability, No Rigid Hierarchy ===
Order.createdAt: 2026-01-01T00:00:00.000Z
Order.toJSON(): {"id":"order-1","createdAt":"2026-01-01T00:00:00.000Z"}
User.createdAt: 2026-01-01T00:00:00.000Z
User.toJSON(): {"name":"Alice","createdAt":"2026-01-01T00:00:00.000Z"}
  ← Order and User share NO common parent class, yet both got the same capability

=== New Duck Type, Zero Existing Code Changed ===
JetDuck.performFly(): flying with jet engines
```

---

### Concept: The Fragile Base Class Problem

**What it is:** Deep inheritance hierarchies tend to accumulate behavior at the TOP that doesn't fit every class further down, forcing subclasses to override, disable, or fight against behavior they never wanted in the first place.

**The problem before:**

```ts
class Duck {
  quack(): string { return 'Quack!' }
  fly(): string { return 'flying with wings' }    // most ducks fly...
}

class MallardDuck extends Duck {}   // fine — inherits both correctly

class RubberDuck extends Duck {
  quack(): string { return 'Squeak!' }
  // ...but RubberDuck INHERITS fly() from Duck, even though rubber ducks obviously can't fly!
}
```

`RubberDuck` is forced to either silently inherit an INCORRECT `fly()` method, or override it to throw/return something nonsensical — LAB-18's LSP violation, in a new costume. As MORE duck types are added (decoy ducks, wooden ducks, robotic ducks with jet engines), the inheritance tree has to keep being reorganized to accommodate each new COMBINATION of "can fly or not" and "can quack or not."

**The solution:** Stop trying to express "can fly" and "can quack" as INHERITED behavior. Express them as separate, swappable BEHAVIOR OBJECTS that a duck HOLDS (composition — "has-a"), not something a duck class INHERITS (inheritance — "is-a").

**Project Application (The "Why" here):** This is LAB-09's dispatch table AND LAB-18's OCP working together — a duck's flying behavior becomes a plug-in object, exactly like an operator was a plug-in function in the calculator's dispatch table.

---

## Step 1 — Feel the Inheritance Bug

```ts
// inheritance-ducks.ts
export class Duck {
  quack(): string { return 'Quack!' }
  fly(): string { return 'flying with wings' }
}

export class MallardDuck extends Duck {}

export class RubberDuck extends Duck {
  quack(): string { return 'Squeak!' }
  // fly() is inherited, unmodified — this is the bug
}
```

```ts
// main.ts
import { MallardDuck, RubberDuck } from './inheritance-ducks'

console.log('=== Inheritance: The Duck Problem ===')
const mallard = new MallardDuck()
console.log(`MallardDuck.fly(): ${mallard.fly()}`)
console.log(`MallardDuck.quack(): ${mallard.quack()}`)

const rubber = new RubberDuck()
console.log(`RubberDuck.fly(): ${rubber.fly()}   ← BUG: rubber ducks can't fly!`)
console.log(`RubberDuck.quack(): ${rubber.quack()}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Inheritance: The Duck Problem ===
MallardDuck.fly(): flying with wings
MallardDuck.quack(): Quack!
RubberDuck.fly(): flying with wings   ← BUG: rubber ducks can't fly!
RubberDuck.quack(): Squeak!
```

**The trap, made concrete:** `RubberDuck` needed to override `quack()` (different sound) but had NO reason to think about `fly()` at all when it was written — yet it silently inherited a WRONG behavior anyway, just by being a `Duck`. The bug isn't a typo; it's a direct structural consequence of inheritance forcing "all of the parent's behavior, whether it fits or not."

---

### Concept: Composition — "Has-A" Instead of "Is-A"

**What it is:** Instead of a duck INHERITING a fixed `fly()` implementation, give it a `flyBehavior` FIELD — an object implementing a small `FlyBehavior` interface (LAB-17's contract pattern) — and delegate to it. Different ducks HOLD different behavior objects; none of them inherit a behavior that doesn't fit.

**Canonical example (General Explanation):**

Think of a video game character's equipment slots — a "weapon" slot can hold a sword, a bow, or nothing, and the character doesn't need a different CLASS for every weapon combination; it just HOLDS whatever's currently equipped and delegates "attack" to it. Composition is exactly this: hold a piece of swappable behavior, delegate to it, and change what's held instead of changing what class something is.

```ts
interface FlyBehavior {
  fly(): string
}
class FlyWithWings implements FlyBehavior {
  fly() { return 'flying with wings' }
}
class NoFly implements FlyBehavior {
  fly() { return 'cannot fly' }
}

class Duck {
  constructor(private flyBehavior: FlyBehavior) {}   // ← HAS-A FlyBehavior, not IS-A flying thing
  performFly(): string { return this.flyBehavior.fly() }   // delegate, don't implement directly
}
```

**Project Application (The "Why" here):** This is LAB-17's `Repository<T>` interface pattern again — a duck DEPENDS on a `FlyBehavior` abstraction (LAB-18's DIP) instead of containing a hardcoded implementation, and different concrete behaviors (LAB-18's OCP) can be swapped in without touching the `Duck` class at all.

---

## Step 2 — Rebuild Ducks With Composition

```ts
// composed-ducks.ts

export interface FlyBehavior {
  fly(): string
}
export interface QuackBehavior {
  quack(): string
}

export class FlyWithWings implements FlyBehavior {
  fly(): string { return 'flying with wings' }
}
export class FlyWithJetEngine implements FlyBehavior {
  fly(): string { return 'flying with jet engines' }
}
export class NoFly implements FlyBehavior {
  fly(): string { return 'cannot fly' }
}

export class LoudQuack implements QuackBehavior {
  quack(): string { return 'Quack!' }
}
export class SqueakQuack implements QuackBehavior {
  quack(): string { return 'Squeak!' }
}
export class NoQuack implements QuackBehavior {
  quack(): string { return 'cannot quack' }
}

export class ComposedDuck {
  constructor(
    private flyBehavior: FlyBehavior,        // ← add: HAS-A, injected — not inherited
    private quackBehavior: QuackBehavior,
  ) {}

  performFly(): string { return this.flyBehavior.fly() }         // ← add: delegate
  performQuack(): string { return this.quackBehavior.quack() }    // ← add: delegate

  setFlyBehavior(behavior: FlyBehavior): void {                   // ← add: swappable AT RUNTIME — see Step 3
    this.flyBehavior = behavior
  }
}
```

Add to `main.ts`:

```ts
import { ComposedDuck, FlyWithWings, FlyWithJetEngine, NoFly, LoudQuack, SqueakQuack, NoQuack } from './composed-ducks'

console.log('\n=== Composition: Behaviors as Injected Objects ===')
const mallardC = new ComposedDuck(new FlyWithWings(), new LoudQuack())
console.log(`mallard.performFly(): ${mallardC.performFly()}`)
console.log(`mallard.performQuack(): ${mallardC.performQuack()}`)

const rubberC = new ComposedDuck(new NoFly(), new SqueakQuack())
console.log(`rubberDuck.performFly(): ${rubberC.performFly()}`)
console.log(`rubberDuck.performQuack(): ${rubberC.performQuack()}`)

const decoyC = new ComposedDuck(new NoFly(), new NoQuack())
console.log(`decoyDuck.performFly(): ${decoyC.performFly()}`)
console.log(`decoyDuck.performQuack(): ${decoyC.performQuack()}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Composition: Behaviors as Injected Objects ===
mallard.performFly(): flying with wings
mallard.performQuack(): Quack!
rubberDuck.performFly(): cannot fly
rubberDuck.performQuack(): Squeak!
decoyDuck.performFly(): cannot fly
decoyDuck.performQuack(): cannot quack
```

**The bug from Step 1 is now structurally impossible:** `rubberDuck` is constructed with `new NoFly()` explicitly — there's no inheritance chain to silently hand it a `fly()` implementation it never asked for. Every duck's ACTUAL capabilities are visible directly at the construction call, not buried several classes up an inheritance tree.

---

## Step 3 — Swap Behavior at Runtime

Composition has an ability inheritance fundamentally cannot offer: changing behavior AFTER an object already exists.

```ts
console.log('\n=== Composition: Swap Behavior at Runtime ===')
console.log(`mallard before: ${mallardC.performFly()}`)
console.log('mallard.setFlyBehavior(new NoFly()) — a mallard raised in captivity, injured wing')
mallardC.setFlyBehavior(new NoFly())
console.log(`mallard after: ${mallardC.performFly()}`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Composition: Swap Behavior at Runtime ===
mallard before: flying with wings
mallard.setFlyBehavior(new NoFly()) — a mallard raised in captivity, injured wing
mallard after: cannot fly
```

**Why inheritance cannot do this:** A class hierarchy is decided at CODE-WRITING time (`class RubberDuck extends Duck` is fixed forever once compiled) — an object cannot change WHICH CLASS it's an instance of after construction. A composed object's HELD behavior, by contrast, is just a field — reassignable any time, exactly like reassigning any other variable. This is the concrete, practical advantage composition has that inheritance structurally cannot match.

---

### Concept: Mixins — Shared Capability Without a Shared Ancestor

**What it is:** A **mixin** is a function that takes a class and returns a NEW class with extra capability added — letting UNRELATED classes (no shared parent at all) gain the same behavior, without forcing them into one artificial hierarchy.

**The problem before:** `Order` and `User` both need a `createdAt` timestamp and a `toJSON()` method. Giving them a shared parent class (`class Order extends Timestamped` and `class User extends Timestamped`) works ONLY if neither class already needs to extend something else — TypeScript/JavaScript classes can only have ONE parent. If `Order` also needs to extend some OTHER base class, this approach is stuck.

**The solution:** A mixin function wraps a class instead of requiring inheritance FROM a shared base:

```ts
function Timestamped<TBase extends new (...args: any[]) => {}>(Base: TBase) {
  return class extends Base {
    createdAt = new Date('2026-01-01')
  }
}
```

Any class can be wrapped: `class TimestampedOrder extends Timestamped(Order) {}` — `Order` never had to be RESTRUCTURED to inherit from a `Timestamped` base; the capability was ADDED, functionally, on top.

**Where you will see this:** React's hooks (`useEffect`, `useState`) largely REPLACED an earlier era of "mixin"-style and inheritance-heavy component composition for exactly this reason — composing small, independent pieces of behavior scales better than deep, rigid hierarchies as an application grows. LAB-33 (Component Architecture) picks this exact thread back up.

---

## Step 4 — A Timestamped/Serializable Mixin

```ts
// mixins.ts

type Constructor<T = {}> = new (...args: any[]) => T

export function Timestamped<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    createdAt = new Date('2026-01-01T00:00:00.000Z')     // fixed date for reproducible lab output
  }
}

export function Serializable<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    toJSON(): string {
      return JSON.stringify(this)
    }
  }
}
```

```ts
// entities.ts
import { Timestamped, Serializable } from './mixins'

class BaseOrder {
  id = 'order-1'
}
class BaseUser {
  name = 'Alice'
}

export class Order extends Serializable(Timestamped(BaseOrder)) {}   // ← add: stack mixins by composing function calls
export class User extends Serializable(Timestamped(BaseUser)) {}      // ← add: Order and User share NO common ancestor
```

Add to `main.ts`:

```ts
import { Order, User } from './entities'

console.log('\n=== Mixins: Shared Capability, No Rigid Hierarchy ===')
const order = new Order() as any
const user = new User() as any

console.log(`Order.createdAt: ${order.createdAt.toISOString()}`)
console.log(`Order.toJSON(): ${order.toJSON()}`)
console.log(`User.createdAt: ${user.createdAt.toISOString()}`)
console.log(`User.toJSON(): ${user.toJSON()}`)
console.log('  ← Order and User share NO common parent class, yet both got the same capability')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Mixins: Shared Capability, No Rigid Hierarchy ===
Order.createdAt: 2026-01-01T00:00:00.000Z
Order.toJSON(): {"id":"order-1","createdAt":"2026-01-01T00:00:00.000Z"}
User.createdAt: 2026-01-01T00:00:00.000Z
User.toJSON(): {"name":"Alice","createdAt":"2026-01-01T00:00:00.000Z"}
  ← Order and User share NO common parent class, yet both got the same capability
```

**Confirm the independence:** `BaseOrder` and `BaseUser` are completely unrelated classes — neither extends the other, neither extends any shared parent. `Timestamped` and `Serializable` were applied to BOTH, independently, by wrapping — this is composition at the CLASS level, the same "combine small pieces" idea as Step 2's behavior objects, just applied to adding capabilities instead of swapping them.

---

## 🎯 Challenge: Add a New Duck Type, Touch Nothing Existing

**You know:** Step 2's `FlyBehavior`/`QuackBehavior` interfaces are open for extension (LAB-18's OCP) — a new behavior is a new class, not an edit to an existing one.

**Task:** Add a `FlyWithJetEngine` duck (the class already exists from Step 2) as a new duck TYPE, without modifying `ComposedDuck`, `FlyWithWings`, `NoFly`, or any other existing class.

<details>
<summary>▶ Show Solution</summary>

```ts
console.log('\n=== New Duck Type, Zero Existing Code Changed ===')
const jetDuck = new ComposedDuck(new FlyWithJetEngine(), new LoudQuack())
console.log(`JetDuck.performFly(): ${jetDuck.performFly()}`)
```

**Key insight:** `FlyWithJetEngine` was ALREADY defined in Step 2 as just another `FlyBehavior` implementation — creating a new duck TYPE required zero new classes and zero edits to existing ones, just a new COMBINATION of already-existing, independently-testable pieces. This is the entire payoff of composition: the number of duck TYPES you can express grows by MULTIPLYING existing behaviors together, while the amount of CODE grows only by ADDING new behaviors, one at a time — the inheritance version from Step 1 would need a new explicit subclass for every new combination.

</details>

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== New Duck Type, Zero Existing Code Changed ===
JetDuck.performFly(): flying with jet engines
```

---

## Mental Model: Where This Shows Up

| System | Composition, not inheritance |
|---|---|
| React function components | Hooks (`useState`, `useEffect`) compose behavior; no component inheritance |
| Game engines | LAB-74's Entity-Component-System is composition taken to its logical extreme |
| Express/Koa middleware | Each middleware is a small composed function, not a subclass |
| Go (the language) | Has no class inheritance at all — only composition (embedding) and interfaces, by design |
| This curriculum's dispatch tables | LAB-09, LAB-13, LAB-18's OCP fix — all composition of small, swappable pieces |

**Where you will see this again:** LAB-33 (Component Architecture) applies this exact behavior-composition idea to UI components. LAB-74 (ECS Architecture) is the most extreme, fully-realized version of "has-a, not is-a" in this entire curriculum.

---

## Final Check

| Feature | How to verify |
|---|---|
| Inheritance-based `RubberDuck` incorrectly inherits `fly()` | Step 1 |
| Composition-based ducks each get EXACTLY the behaviors they're constructed with | Step 2 |
| A duck's fly behavior can change after construction | Step 3 |
| `Order` and `User`, with no shared ancestor, both gained `createdAt`/`toJSON` via mixins | Step 4 |
| A new duck combination requires zero changes to existing classes | Challenge |
| You can explain "has-a vs is-a" out loud, with your own example | Not just ducks |

---

## Quick Check Answers

**1. Why might "can't inherit from three classes at once" be a hint, not just a limitation?**

Because "this thing IS simultaneously an Animal, a Flyable, and a Swimmable" is usually a sign you're trying to express "has multiple independent CAPABILITIES" through inheritance, which inheritance isn't well-suited for — capabilities compose more naturally as HELD, swappable objects (Step 2) than as multiple parents. Most languages restricting multiple inheritance is a nudge toward composition, not an arbitrary annoyance.

**2. What does forcing `RubberDuck extends Duck` get wrong?**

It assumes ALL of `Duck`'s behavior applies to every subclass, when actually only PART of it does (quacking, in some form) while another part (flying) does not. Step 1 demonstrated the direct consequence: `RubberDuck` silently inherited a `fly()` implementation that makes no sense for it, because inheritance offers no way to accept SOME of a parent's behavior while rejecting other parts — you get all of it, or you override individual pieces one at a time, fighting the hierarchy as you go.

**3. Does a shared parent class make sense for `Order` and `User` needing the same timestamp/serialization capability?**

Not necessarily — and Step 4 demonstrated the alternative directly: a MIXIN gives both classes the identical capability (`createdAt`, `toJSON()`) without requiring them to share an ancestor, which matters especially if `Order` and `User` have OTHER, unrelated reasons to extend different base classes already. A shared parent forces a permanent "is-a" relationship for what's really just a shared, independent CAPABILITY — composition (via mixins here, via held objects in Step 2) expresses "gains this capability" without overcommitting to "is fundamentally the same kind of thing as."

---

*Next: [LAB-20 — Dependency Injection](LAB-20-dependency-injection.md) — TypeScript, same phase*

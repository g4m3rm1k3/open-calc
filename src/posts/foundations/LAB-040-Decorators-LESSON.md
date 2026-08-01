# FOUNDATIONS — LAB-040 — TypeScript: Decorators

**Series:** FOUNDATIONS — Part VII: TypeScript Type System
**Environment:** TypeScript playground with `experimentalDecorators: true` in tsconfig, or Node.js with `--experimental-decorators` flag.
**Time:** 50–65 minutes.

---

## What You Will Build

A method decorator that logs entry/exit, a class decorator that adds a timestamp, a parameter decorator that validates non-null, and a demonstration of the order in which decorators are evaluated. After this lab you will understand metaprogramming, why decorators are evaluated at class definition time, and when decorators are the right tool vs when they are not.

---

## What You Need to Know First

**From LAB-012 (Classes):** Decorators modify class members. You need to understand class structure — constructor, methods, prototype chain.

**From LAB-006 (First-Class Functions):** Decorators are functions that receive metadata about the decorated target and return a modified version.

**From LAB-022 (Function Composition):** A decorator is a higher-order function: it takes a function (method) and returns a new function (the decorated method).

---

> **Quick Check — try to answer before reading:**
>
> 1. A `@Logger` decorator is on a method. When does the decorator function run — when the class is defined, or each time the method is called?
> 2. How would you add logging to 50 methods without decorators?
> 3. What is a cross-cutting concern? Name two examples.
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — What a Decorator Is

A decorator is a function applied to a class, method, property, or parameter using the `@Name` syntax placed immediately before the declaration. The decorator function receives information about the target and can modify it.

Decorators are evaluated at class definition time, not when instances are created or methods are called. They are TypeScript's mechanism for **metaprogramming** — writing code that modifies other code.

**The CS lens — metaprogramming:** Metaprogramming is code that reads or modifies other code as data. Decorators are a compile-time (but evaluated at module load time) form of metaprogramming. Aspect-Oriented Programming (AOP) uses the same idea: cross-cutting concerns (logging, auth checks, caching) are applied to many functions declaratively rather than imperatively inside each function.

**Enable decorators:** In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "target": "ES2020"
  }
}
```

---

### Step 2 — Method Decorator: Logging

A method decorator receives three arguments:
1. `target`: the class prototype (for instance methods) or the constructor (for static methods)
2. `propertyKey`: the method name as a string
3. `descriptor`: a `PropertyDescriptor` — the object that describes the property's attributes

```typescript
function LogMethod(
  target: object,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;  // the original function

  // Replace the original method with a wrapper
  descriptor.value = function (...args: unknown[]) {
    const className = target.constructor.name;
    console.log(`[${className}.${propertyKey}] called with:`, args);

    const startTime = performance.now();
    const result = originalMethod.apply(this, args);  // call original
    const duration = (performance.now() - startTime).toFixed(2);

    console.log(`[${className}.${propertyKey}] returned:`, result, `in ${duration}ms`);
    return result;
  };

  return descriptor;
}
```

**The walkthrough:**

`descriptor.value` is the original function. We save it, then replace it with a new function that wraps the original. The wrapper logs before and after calling the original with `apply(this, args)` — `this` must be the actual instance at call time, so we use a regular function (not an arrow function) for the wrapper so that `this` is bound correctly at call time.

`originalMethod.apply(this, args)` — `apply` calls a function with an explicit `this` value and an array of arguments. Without it, `this` inside `originalMethod` would be wrong.

**Using the decorator:**

```typescript
class OrderService {
  @LogMethod
  calculateTotal(items: number[], taxRate: number): number {
    const subtotal = items.reduce((sum, price) => sum + price, 0);
    return subtotal * (1 + taxRate);
  }

  @LogMethod
  validateOrder(orderId: string): boolean {
    return orderId.length > 0;
  }
}

const service = new OrderService();
service.calculateTotal([10, 20, 30], 0.1);
// [OrderService.calculateTotal] called with: [[10, 20, 30], 0.1]
// [OrderService.calculateTotal] returned: 66 in 0.02ms
```

**The SE lens — decorator vs manual logging:** Without decorators, adding logging to each method means modifying 50 method bodies. Every method needs `console.log` at start and end. Adding a log field or format change requires touching 50 places — shotgun surgery. With `@LogMethod`, you apply it to any method declaratively. To change the format, you change the decorator — one place.

---

### Step 3 — Class Decorator

A class decorator receives the constructor. It can return a new constructor that extends the original.

```typescript
function WithTimestamp<T extends { new (...args: any[]): object }>(constructor: T) {
  return class extends constructor {
    readonly createdAt = new Date().toISOString();
  };
}

@WithTimestamp
class User {
  constructor(public name: string) {}
}

const user = new User('Alice');
console.log(user.name);       // "Alice"
console.log(user.createdAt);  // "2026-06-13T..."
```

**The walkthrough:** The class decorator returns an anonymous class that extends the original. Every new `User` instance now has `createdAt` added by the decorator. The original `User` constructor still runs first; then the decorator's class initialisation adds `createdAt`.

`T extends { new (...args: any[]): object }` is a constraint on the type parameter: T must be a constructor (a class). `new (...args: any[])` means T can be called with `new`. Without this constraint, TypeScript would not know that `constructor` is a class.

---

### Step 4 — Decorator Factory: Configurable Decorators

A decorator factory is a function that returns a decorator. This lets you pass configuration to the decorator.

```typescript
function Retry(maxAttempts: number, delayMs: number = 0) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          console.warn(`[${propertyKey}] Attempt ${attempt}/${maxAttempts} failed`);
          if (attempt < maxAttempts && delayMs > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
      }

      throw lastError;
    };

    return descriptor;
  };
}

class PaymentService {
  @Retry(3, 500)   // retry up to 3 times, 500ms between attempts
  async processPayment(amount: number): Promise<string> {
    // Simulate intermittent failure
    if (Math.random() < 0.7) throw new Error('Payment gateway timeout');
    return `Payment of $${amount} processed`;
  }
}
```

**The walkthrough:** `@Retry(3, 500)` calls `Retry(3, 500)`, which returns the actual decorator function. The decorator function receives the descriptor and replaces the method with a retry wrapper. The configuration (3 attempts, 500ms delay) is captured in the decorator factory's closure.

---

### Step 5 — Decorator Evaluation Order

When multiple decorators are stacked, they are evaluated bottom-to-top at class definition time, but applied top-to-bottom when the method is called.

```typescript
function First() {
  console.log('First: evaluated');
  return function (target: object, key: string, descriptor: PropertyDescriptor) {
    console.log('First: applied');
    return descriptor;
  };
}

function Second() {
  console.log('Second: evaluated');
  return function (target: object, key: string, descriptor: PropertyDescriptor) {
    console.log('Second: applied');
    return descriptor;
  };
}

class Example {
  @First()
  @Second()
  method() {}
}

// Output (at class definition time):
// First: evaluated
// Second: evaluated
// Second: applied
// First: applied
```

**The walkthrough:** Decorator expressions (the calls to `First()` and `Second()`) are evaluated top-to-bottom. The resulting decorator functions are then applied bottom-to-top. `@Second()` wraps the original method first; `@First()` wraps the result of that. When `method()` is called, `First`'s wrapper runs first (outermost), then `Second`'s wrapper (innermost), then the original method. This is the same as function composition: `First(Second(originalMethod))`.

---

## Connect the Pieces

- **NestJS** (the most popular Node.js enterprise framework) is built almost entirely on decorators: `@Controller('/users')`, `@Get('/:id')`, `@Injectable()`, `@Body()`. Understanding decorators is mandatory to understand NestJS.
- **TypeORM** uses `@Entity()`, `@Column()`, `@PrimaryGeneratedColumn()` to annotate database models.
- **Angular** uses `@Component`, `@Injectable`, `@Input` throughout.
- **Java's annotations** and **Python's decorators** are the same concept — Python's `@property`, `@staticmethod`, `@lru_cache` follow identical semantics to TypeScript decorators.

---

## What Breaks Without This

**Using `apply` correctly:**

```typescript
// BUG: arrow function in wrapper
descriptor.value = (...args: unknown[]) => {
  // Arrow functions capture 'this' lexically — 'this' here is the outer scope (undefined in strict mode)
  return originalMethod.apply(this, args);   // 'this' is wrong
};
```

An arrow function captures `this` from the lexical scope where the decorator is defined — not the scope where the method is called. For a method that uses `this.someProperty`, the arrow wrapper will use the wrong `this` and produce `undefined` property accesses. The wrapper must use a regular function (`function (...args)`) so `this` is bound dynamically at call time by the JavaScript engine.

---

## Definition of Done

- [ ] `@LogMethod` decorator — calling the decorated method prints entry and exit logs to the console
- [ ] `@WithTimestamp` class decorator — every instance has a `createdAt` field without modifying the class body
- [ ] `@Retry(3, 0)` — a failing method is retried three times and throws on the third failure
- [ ] Stack two decorators and observe the evaluation order in the console
- [ ] You can explain why the wrapper uses `function (...args)` instead of `(...args) =>` and what breaks if you use an arrow function

**Git commit:**

```
git add src/
git commit -m "LAB-040: TypeScript decorators — metaprogramming for cross-cutting concerns; decorator factories enable configuration; evaluation order is bottom-up application"
```

---

## Quick Check Answers

1. **When the class is defined.** The decorator function runs once, at the point where the JavaScript module is loaded and the class definition is evaluated. The wrapper function the decorator installs runs each time the method is called, but the decorator itself is called only once.
2. **Copy and paste the logging code into every method body.** That is 50 repetitions of the same pattern — a DRY violation. Every format change requires 50 edits. Every method added must remember to include the logging. Decorators centralise the pattern in one place.
3. **A cross-cutting concern is a behavior that spans many otherwise unrelated modules or classes.** Logging (every method in every service), authentication (every endpoint), caching (expensive read methods), and transaction management (every database write method) are cross-cutting concerns. They are "cross-cutting" because they cut across the primary decomposition of the system — you cannot put logging in one class when it applies to all classes.

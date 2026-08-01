# FOUNDATIONS — LAB-018 — Object Composition

**Series:** FOUNDATIONS — Part III: Object-Oriented Programming
**Environment:** Browser DevTools console (F12 → Console). All examples run directly there.
**Time:** 55–70 minutes.

---

## What You Will Build

A `Logger` class built from three independent components — a `Formatter` that handles message structure, a `Sink` that handles message delivery, and a `Filter` that handles which messages pass through — each composable in any combination. You will demonstrate that swapping one component changes only that component, and that behavior combinations impossible with inheritance are trivial with composition. After this lab, you will understand the "composition over inheritance" principle, recognize when inheritance creates problems, and design objects using has-a rather than is-a relationships.

---

## What You Need to Know First

**From LAB-014 (Inheritance):** Subclasses extend superclasses. Deep hierarchies create tight coupling between parent and child — a change to the parent can break every subclass.

**From LAB-015 (Polymorphism) and LAB-017 (Interfaces):** Objects that satisfy a contract are interchangeable. Composition assembles objects that each satisfy a small contract into a larger object.

**The key insight from LAB-014's quick check answer:** `Square extends Rectangle` is a problematic is-a relationship — they cannot be safely substituted. Composition avoids this by expressing has-a relationships instead.

---

> **Quick Check — try to answer before reading:**
>
> 1. You have `Animal → Bird → FlyingBird` and `Animal → Mammal → FlyingMammal` (bats). Where does `FlyingBat` go in this hierarchy? What about a flying squirrel that glides but does not truly fly?
> 2. A `Car` has an `Engine`. An `ElectricCar` has a `Motor`. Both are vehicles. Is this better modeled with `ElectricCar extends Car` or with composition?
> 3. If you use inheritance to share the "flying" behavior between `Bird` and `Bat`, what must a subclass inherit that it did not ask for?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Inheritance Problem: Fragile Base Classes

**The problem this step solves:** Show concretely why deep inheritance hierarchies become brittle.

**The code:**

```js
// A class hierarchy for loggers that tries to cover all combinations
class Logger {
  log(message) { /* base */ }
}

class TimestampLogger extends Logger {
  log(message) {
    super.log(`[${new Date().toISOString()}] ${message}`);
  }
}

class PrefixLogger extends TimestampLogger {
  constructor(prefix) {
    super();
    this.prefix = prefix;
  }
  log(message) {
    super.log(`${this.prefix} ${message}`);
  }
}

// What if we want a logger with a prefix but NO timestamp?
// We cannot create PrefixOnlyLogger from this hierarchy without duplicating code.
// What if we want timestamp + uppercase but no prefix?
// Requires a new class: TimestampUppercaseLogger extends TimestampLogger.
// What if we want prefix + uppercase but no timestamp?
// Another new class.
// N options × M options = N×M classes to cover all combinations.
```

**The walkthrough — the combinatorial explosion:**

With 3 independent options (timestamp, prefix, uppercase), the inheritance approach requires one class for every possible combination:
- `Logger` (none)
- `TimestampLogger`
- `PrefixLogger`
- `UppercaseLogger`
- `TimestampPrefixLogger`
- `TimestampUppercaseLogger`
- `PrefixUppercaseLogger`
- `TimestampPrefixUppercaseLogger`

8 classes for 3 options. With 4 options: 16 classes. With 5: 32. This is the **class explosion problem** — exponential growth of class count for linear growth of independent options. Real-world systems have dozens of orthogonal options.

**CS lens — the combinatorial explosion in inheritance:**

Inheritance forces a linear ordering on behavior. To get "A + B," you must subclass `A` with `B` or subclass `B` with `A`. To get "A + C" and "B + C," you need separate classes. Independent behaviors that should multiply freely cannot do so in an inheritance tree. Composition solves this because components combine multiplicatively — you can select any combination without defining a class for each.

**SE lens — the fragile base class problem:**

In a deep hierarchy, the base class is depended on by every subclass. A change to `Logger.log` may break `TimestampLogger`, which may break `PrefixLogger`, which may break every class that extends `PrefixLogger`. The base class is fragile because it cannot be changed safely. Every change requires understanding every class that inherits from it. As the hierarchy grows, this becomes impossible.

**What breaks as the hierarchy deepens:**

When `TimestampLogger` calls `super.log(...)`, it depends on `Logger`'s implementation. If `Logger` changes its internal behavior, `TimestampLogger` may break. When `PrefixLogger` calls `super.log(...)`, it depends on `TimestampLogger`. A change to `TimestampLogger` can break `PrefixLogger` without touching `PrefixLogger`'s code. This cascading effect — "I changed A and B and C broke" — is called the **fragile base class problem**.

---

### SAVE AND TRY

```js
class Logger {
  log(message) {
    console.log(message);
  }
}

class TimestampLogger extends Logger {
  log(message) {
    super.log(`[${new Date().toISOString()}] ${message}`);
  }
}

const timestampLog = new TimestampLogger();
timestampLog.log("server started");

// Demonstrate the limitation: how do you get PrefixLogger WITHOUT a timestamp?
// You would need to extend Logger directly again — duplicating the prefix logic.
```

Expected: a timestamped log message.

**Change something:** Create a `UppercaseLogger extends Logger` that uppercases messages. Now create a `TimestampUppercaseLogger extends ?` — there is no class to extend that gives both behaviors without duplicating code. You must choose one parent and re-implement the other. This is the inheritance ceiling.

---

### Step 2 — Composition: Components That Combine Freely

**The problem this step solves:** Replace the inheritance hierarchy with independent components that combine in any configuration.

**The code:**

```js
// Component 1: Formatters (responsible for message structure)
class PlainFormatter {
  format(message) { return message; }
}

class TimestampFormatter {
  format(message) {
    return `[${new Date().toISOString()}] ${message}`;
  }
}

class PrefixFormatter {
  constructor(prefix) {
    this.prefix = prefix;
  }
  format(message) {
    return `${this.prefix} ${message}`;
  }
}

class UppercaseFormatter {
  format(message) {
    return message.toUpperCase();
  }
}

// Component 2: Sinks (responsible for message delivery)
class ConsoleSink {
  write(message) { console.log(message); }
}

class ArraySink {
  constructor() { this.messages = []; }
  write(message) { this.messages.push(message); }
}

// Component 3: Filters (responsible for which messages pass)
class AllowAllFilter {
  shouldLog(message) { return true; }
}

class KeywordFilter {
  constructor(keyword) { this.keyword = keyword; }
  shouldLog(message) { return message.includes(this.keyword); }
}

// The Logger assembles components via composition
class Logger {
  #formatter;
  #sink;
  #filter;

  constructor(formatter, sink, filter) {
    this.#formatter = formatter;
    this.#sink = sink;
    this.#filter = filter;
  }

  log(message) {
    if (!this.#filter.shouldLog(message)) return;
    const formatted = this.#formatter.format(message);
    this.#sink.write(formatted);
  }
}
```

**The walkthrough — `logger.log("error: timeout")`:**

1. `this.#filter.shouldLog("error: timeout")` — calls whatever filter was injected. If `KeywordFilter("error")`, returns `true` (message contains "error"). If `AllowAllFilter`, also returns `true`.
2. `this.#formatter.format("error: timeout")` — calls whatever formatter was injected. If `TimestampFormatter`, returns `"[timestamp] error: timeout"`. If `UppercaseFormatter`, returns `"ERROR: TIMEOUT"`.
3. `this.#sink.write(formattedMessage)` — calls whatever sink was injected. If `ConsoleSink`, logs to console. If `ArraySink`, appends to the array.

**Creating combinations without new classes:**

```js
// Logger 1: Timestamp + Console + AllowAll
const logger1 = new Logger(
  new TimestampFormatter(),
  new ConsoleSink(),
  new AllowAllFilter()
);

// Logger 2: Uppercase + Array + Keyword filter
const logger2 = new Logger(
  new UppercaseFormatter(),
  new ArraySink(),
  new KeywordFilter("error")
);

// Logger 3: Prefix + Console + AllowAll
const logger3 = new Logger(
  new PrefixFormatter("[APP]"),
  new ConsoleSink(),
  new AllowAllFilter()
);

logger1.log("server started");         // → "[timestamp] server started"
logger2.log("info: disk usage 80%");   // → filtered out (no "error")
logger2.log("error: disk full");       // → "ERROR: DISK FULL"
logger3.log("request received");       // → "[APP] request received"
```

**CS lens — composition as Cartesian product:**

With 4 formatters, 2 sinks, and 2 filters, composition supports `4 × 2 × 2 = 16` combinations using `4 + 2 + 2 = 8` classes. Inheritance supports only as many combinations as you explicitly code. Each new component adds multiplicatively to the number of possible configurations; inheritance adds only linearly. This is why "composition over inheritance" is considered a fundamental principle.

**SE lens — runtime behavior swapping:**

Composition enables runtime reconfiguration. A method `setFormatter(formatter)` on `Logger` would allow changing the formatter after construction — without recreating the logger, without changing any other component. With inheritance, changing the formatter means creating a new object of a different class. This matters for features like: "use detailed logging in debug mode, minimal logging in production" — swappable at startup without a code change.

**What breaks if components are not isolated:**

If `Logger` directly imports and instantiates `TimestampFormatter` instead of accepting it as a constructor argument, the formatter cannot be swapped. The test cannot inject a `MockFormatter`. The production logger cannot switch to `PlainFormatter` without code changes. The injection seam is the key: the component is provided from outside, not created inside.

---

### SAVE AND TRY

```js
// Create a logger that captures messages for inspection (testing):
const arraySink = new ArraySink();
const testLogger = new Logger(
  new PlainFormatter(),
  arraySink,
  new AllowAllFilter()
);

testLogger.log("first message");
testLogger.log("second message");
testLogger.log("third message");

console.log("Captured:", arraySink.messages);
// → ["first message", "second message", "third message"]
```

Expected: three messages captured.

**Change something:** Create a `testLogger2` with `KeywordFilter("warning")`. Log `"info: ok"`, `"warning: high memory"`, `"error: crash"`. Expected: only `"warning: high memory"` is captured.

---

### Step 3 — Swapping Components Without Touching Logger

**The problem this step solves:** Demonstrate that changing behavior requires changing only the injected component, not the Logger class.

**The code:**

```js
// New requirement: add a "throttle" filter that only logs once per second
class ThrottleFilter {
  #minIntervalMs;
  #lastLoggedAt = 0;

  constructor(minIntervalMs) {
    this.#minIntervalMs = minIntervalMs;
  }

  shouldLog(message) {
    const now = Date.now();
    if (now - this.#lastLoggedAt >= this.#minIntervalMs) {
      this.#lastLoggedAt = now;
      return true;
    }
    return false;
  }
}

// New requirement: add a JSON formatter for log aggregation systems
class JsonFormatter {
  format(message) {
    return JSON.stringify({ timestamp: new Date().toISOString(), message });
  }
}

// Zero changes to Logger. Just create new loggers with the new components:
const throttledLogger = new Logger(
  new TimestampFormatter(),
  new ConsoleSink(),
  new ThrottleFilter(1000)   // max one log per second
);

const jsonLogger = new Logger(
  new JsonFormatter(),
  new ConsoleSink(),
  new AllowAllFilter()
);

throttledLogger.log("attempt 1");   // → logged
throttledLogger.log("attempt 2");   // → filtered (within 1 second)
throttledLogger.log("attempt 3");   // → filtered

jsonLogger.log("deployment started");
// → '{"timestamp":"...","message":"deployment started"}'
```

`Date.now()` — a static method that returns the current time as milliseconds since January 1, 1970 (Unix epoch). Used for timing comparisons: `now - lastLoggedAt` gives the elapsed milliseconds. More efficient than `new Date()` when you only need a numeric timestamp.

`JSON.stringify({ ... })` — converts a JavaScript object to a JSON string. The result is always a valid JSON string that can be parsed back with `JSON.parse`. Used in `JsonFormatter` to produce structured log output that log aggregation systems (Elasticsearch, Datadog, Splunk) can parse.

**The walkthrough — `ThrottleFilter.shouldLog`:**

1. First call: `now = 1000` (hypothetically), `lastLoggedAt = 0`. `1000 - 0 = 1000 >= 1000`. Returns `true`. Updates `lastLoggedAt = 1000`.
2. Second call (same second): `now = 1050`, `lastLoggedAt = 1000`. `1050 - 1000 = 50 < 1000`. Returns `false`. Does not log.
3. Call one second later: `now = 2000`, `lastLoggedAt = 1000`. `2000 - 1000 = 1000 >= 1000`. Returns `true`. Updates `lastLoggedAt = 2000`.

**CS lens — the open/closed principle through composition:**

`Logger` never changed. `ThrottleFilter` and `JsonFormatter` are new files. The system was **open for extension** (new behavior) and **closed for modification** (Logger untouched). This is the Open/Closed Principle in action — the same principle you saw with polymorphism in LAB-015, but implemented here through composition rather than inheritance.

**SE lens — components as lego bricks:**

Each component (formatter, sink, filter) is independently:
- **Testable:** `ThrottleFilter` can be tested alone by calling `shouldLog` and checking the boolean, without involving `Logger`.
- **Reusable:** `JsonFormatter` works with any `Logger` configuration — not just a specific Logger subclass.
- **Replaceable:** Swap the filter without touching the formatter or sink.

No inheritance relationship provides these three properties simultaneously. Composition does.

**What breaks if Logger hardcodes components:**

```js
class HardcodedLogger {
  log(message) {
    if (!this.#keywordFilter.shouldLog(message)) return;   // cannot be swapped
    const formatted = this.#timestampFormatter.format(message);  // cannot be swapped
    console.log(formatted);  // cannot be swapped
  }
}
```

Testing requires real console output. Changing the formatter requires editing `HardcodedLogger`. The filter behavior is fixed forever. Every feature request — "use JSON format in production," "silence logs during tests" — requires code changes.

---

### SAVE AND TRY

```js
// Verify that ThrottleFilter rate-limits correctly:
const throttle = new ThrottleFilter(100);   // 100ms minimum between logs

console.log(throttle.shouldLog("test 1"));  // → true  (first call)
console.log(throttle.shouldLog("test 2"));  // → false (immediately after)
console.log(throttle.shouldLog("test 3"));  // → false

// After 150ms:
setTimeout(() => {
  console.log(throttle.shouldLog("test 4"));  // → true  (enough time has passed)
}, 150);
```

Expected: `true`, `false`, `false`, then after 150ms: `true`.

**Change something:** Create a `MinLengthFilter` that only logs messages at least 10 characters long. No changes to `Logger` or any other component. Pass it to a new Logger. Log `"hi"` (short) and `"hello world"` (long). Expected: only the long one is logged.

---

## Connect the Pieces

**What you built:** A `Logger` class assembled from independent `Formatter`, `Sink`, and `Filter` components. New behavior added by writing new components — no changes to `Logger`. `4 × 2 × 2 = 16` combinations from `8` classes.

**How it connects to LAB-014 (Inheritance):** Inheritance is correct for true is-a relationships where the subclass honors the parent's full contract. Composition is correct when behavior is orthogonal (independent) and can vary along multiple axes. The `Logger` has-a `Formatter`; it is not a `Formatter`. The distinction guides the choice.

**How it connects to LAB-017 (Interfaces):** Each component satisfies a small contract: `{ format(message): string }`, `{ write(message): void }`, `{ shouldLog(message): boolean }`. The Logger depends on these contracts, not on concrete classes. Swapping is safe because the contracts are honored.

**How it connects to LAB-007 (Closures):** The `ThrottleFilter` uses a closure-like private state (`#lastLoggedAt`) to persist timing state across calls. This is the same pattern as the counter in LAB-007 — state that accumulates across invocations.

**How it connects forward:**

- **LAB-054 (Composition over Inheritance):** You will study this as a formal principle, name the fragile base class problem formally, and work through refactoring a deep hierarchy to composition.
- **LAB-073 (Decorator Pattern):** The Decorator pattern is composition applied specifically to "wrapping" — each decorator wraps the previous one. A `TimestampFormatter` that wraps a `PrefixFormatter` is a decorator chain.
- **LAB-084 (Strategy Pattern):** The `Formatter`, `Sink`, and `Filter` components are strategies — swappable algorithms passed as arguments.
- **LAB-077 (Chain of Responsibility):** The filter chain can be composed into a chain of responsibility — each filter passes to the next or stops the message.

**The real-world connection:**

Express middleware is composition: `app.use(loggerMiddleware).use(authMiddleware).use(bodyParser).use(rateLimiter)` — each middleware is an independent component with one job, composed into a pipeline. React hooks are composition: `useEffect`, `useState`, `useRef` are components assembled in any combination. Node.js streams are composable: `readStream.pipe(gzipStream).pipe(cryptoStream).pipe(writeStream)` — each stream is an independent component. Composition is the organizing principle of every modern framework.

---

## What Breaks Without This

**Concrete failure — the class explosion with 3 options × 2 values each:**

```js
// Without composition: 8 classes for 3 binary options
class Logger {}
class TimestampLogger extends Logger {}
class FilteredLogger extends Logger {}
class PrefixedLogger extends Logger {}
class TimestampFilteredLogger extends TimestampLogger {}   // inheritance chain grows
class TimestampPrefixedLogger extends TimestampLogger {}
class FilteredPrefixedLogger extends FilteredLogger {}
class TimestampFilteredPrefixedLogger extends TimestampFilteredLogger {}
// Each new option doubles the class count
```

Now add "colored output" as a 4th option: 16 classes. Add "JSON format": 32 classes. Each new requirement doubles the class count. This is the maintenance nightmare that composition eliminates.

---

## Definition of Done

Verify each item before moving to LAB-019.

- [ ] `Logger` accepts formatter, sink, and filter via constructor
- [ ] `TimestampFormatter`, `UppercaseFormatter`, `PrefixFormatter`, `PlainFormatter` each work independently
- [ ] `ConsoleSink` logs to console; `ArraySink` captures messages
- [ ] `AllowAllFilter` passes everything; `KeywordFilter("error")` only passes messages containing "error"
- [ ] Creating a new combination (e.g., JSON format + array sink + throttle filter) requires zero changes to `Logger`
- [ ] A new `MinLengthFilter` component works without touching any existing code

**Git commit:**

```
git add .
git commit -m "LAB-018: Logger built from composable Formatter/Sink/Filter components — demonstrates composition over inheritance"
```

---

## Quick Check Answers

**1. Where does a flying bat go in a `Bird → FlyingBird` hierarchy? What about a flying squirrel?**

A bat cannot extend `FlyingBird` — bats are mammals, not birds. A `FlyingMammal` class would require duplicating flying behavior. A flying squirrel glides but does not flap — `FlyingMammal` may not apply either. These are symptoms of the hierarchy's inability to represent orthogonal traits (flying-ness) independently from taxonomy (bird vs mammal). With composition: a `Locomotion` component handles movement. A bat gets `{ locomotion: new WingFlight() }`. A flying squirrel gets `{ locomotion: new Gliding() }`. A penguin gets `{ locomotion: new Swimming() }`. The locomotion behavior is independent of the animal's taxonomic classification.

**2. Is `ElectricCar extends Car` or composition the better model?**

Composition. An `ElectricCar` does not IS-A `Car` in the sense that its power system is entirely different. `Car.engine` and `ElectricCar.motor` are not substitutable — the electric motor has different methods, different performance characteristics, and different maintenance needs. Modeling as `ElectricCar extends Car` forces `ElectricCar` to inherit `engine` (which it does not have) or override it to throw "electric cars have no engine" (which violates the Liskov Substitution Principle). Composition: `Vehicle` has a `powerSystem` field — `Engine` for gasoline vehicles, `Motor` for electric. The vehicle's logic uses the `powerSystem` interface without caring which type it is.

**3. What must a subclass inherit that it did not ask for?**

Everything in the superclass — all public methods, all inherited behavior, all the superclass's dependencies on other classes. If `Animal` has a `speak()` method and `FlyingBird extends Animal`, `FlyingBird` inherits `speak()` whether or not flying birds speak the same way as all animals. If `Animal` changes `speak()` to require a `VocalCord` object, `FlyingBird` is now broken — it inherited a dependency it did not need. Inheritance is an "all or nothing" relationship. Composition allows selective assembly: take exactly the components you need.

---

*Next: LAB-019 — Pure Functions and Side Effects*

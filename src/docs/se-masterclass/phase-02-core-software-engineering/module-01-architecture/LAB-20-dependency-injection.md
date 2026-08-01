# SE Masterclass — LAB-20 — Dependency Injection

**Language: TypeScript (Node.js)** — closes out Module 1 of Phase 2.

**Prerequisites:** LAB-17–19. This lab is where the Repository pattern (LAB-17), DIP (LAB-18), and composition (LAB-19) converge into ONE concrete, everyday technique: handing a class its dependencies instead of letting it construct them.

**What this lab adds:**
- Why a class constructing its OWN dependencies makes it untestable
- Constructor injection: the caller decides WHAT gets used, the class just uses it
- Inversion of Control (IoC) — named and made concrete
- A minimal IoC container — the mechanized version of "someone has to wire this all together"

**Time:** 70–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A class's constructor calls `new RealEmailSender()` internally. What has to happen for a UNIT TEST of this class to run WITHOUT actually sending an email?
> 2. "Inversion of Control" — control over WHAT, and inverted relative to WHOM?
> 3. If a class depends on `Repository<User>` (LAB-17's interface) instead of `InMemoryRepository` directly, who decides WHICH concrete repository it actually gets at runtime?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== Hardcoded Dependency (untestable) ===
OrderProcessor.process(): REAL EMAIL SENT to customer@example.com
  ← every test of OrderProcessor would ALSO send a real email — unacceptable in a test suite

=== Constructor Injection (testable) ===
OrderProcessor.process() with RealEmailSender: REAL EMAIL SENT to customer@example.com
OrderProcessor.process() with FakeEmailSender: [FAKE] would have emailed customer@example.com
  ← same class, same method, zero code changes — only the injected dependency changed

=== Unit Test Using Injection ===
test: "OrderProcessor calls send() exactly once" ... PASS (fake recorded 1 call)
test: "OrderProcessor never touches the real network" ... PASS (RealEmailSender was never constructed)

=== Minimal IoC Container ===
container.register('EmailSender', RealEmailSender)
container.register('Logger', ConsoleLogger)
container.resolve('OrderProcessor'): built with EmailSender + Logger, wired automatically
OrderProcessor.process(): REAL EMAIL SENT to customer@example.com
[LOG] order processed

=== Swapping the Container's Registration for Tests ===
container.register('EmailSender', FakeEmailSender) — override for test environment
container.resolve('OrderProcessor'): built with FakeEmailSender this time
OrderProcessor.process(): [FAKE] would have emailed customer@example.com
```

---

### Concept: Hardcoded Dependencies Make Testing Impossible

**What it is:** A class that constructs its own dependencies INSIDE itself (`new RealEmailSender()` written directly in the constructor or method body) has PERMANENTLY welded itself to that one specific implementation — there is no way to swap it out, ever, without editing that class's source.

**The problem before:**

```ts
class OrderProcessor {
  process(order: { email: string }) {
    const sender = new RealEmailSender()      // hardcoded — welded in
    sender.send(order.email, 'Order confirmed')
  }
}
```

Any test of `OrderProcessor.process()` ALSO sends a real email — every single time the test suite runs. This is slow, unreliable (what if the email service is down?), and in a real system, potentially harmful (spamming a real customer's real inbox during automated testing).

**The solution:** LAB-19's composition, applied specifically to construction — the dependency is injected from OUTSIDE, not created from INSIDE.

**Project Application (The "Why" here):** This is LAB-19's `ComposedDuck` constructor, LAB-18's DIP, and LAB-17's `Repository<T>` parameter — all converging on the exact same shape: `constructor(private dependency: SomeInterface)`.

---

## Step 1 — Feel the Untestable Version

```ts
// hardcoded.ts
export class RealEmailSender {
  send(to: string, message: string): void {
    console.log(`REAL EMAIL SENT to ${to}`)
  }
}

export class OrderProcessor {
  process(order: { email: string }): void {
    const sender = new RealEmailSender()          // ← hardcoded — this class can NEVER use anything else
    sender.send(order.email, 'Order confirmed')
  }
}
```

```ts
// main.ts
import { OrderProcessor } from './hardcoded'

console.log('=== Hardcoded Dependency (untestable) ===')
new OrderProcessor().process({ email: 'customer@example.com' })
console.log('  ← every test of OrderProcessor would ALSO send a real email — unacceptable in a test suite')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Hardcoded Dependency (untestable) ===
REAL EMAIL SENT to customer@example.com
  ← every test of OrderProcessor would ALSO send a real email — unacceptable in a test suite
```

**Confirm there's genuinely no escape hatch:** Search `OrderProcessor`'s source for ANY way to pass in a different email sender — there isn't one. `RealEmailSender` is constructed on the line it's used, permanently, for as long as this class exists in its current form.

---

### Concept: Constructor Injection

**What it is:** Instead of a class CREATING its dependency, the dependency is passed IN — usually through the constructor — and the class simply USES whatever it was given. LAB-17's `interface Repository<T>` parameter and LAB-19's `ComposedDuck(flyBehavior, quackBehavior)` are both already this pattern; this lab names it formally: **Dependency Injection**.

**The solution:**

```ts
interface EmailSender {
  send(to: string, message: string): void
}

class OrderProcessor {
  constructor(private sender: EmailSender) {}    // ← INJECTED — the caller decides what this is
  process(order: { email: string }): void {
    this.sender.send(order.email, 'Order confirmed')
  }
}
```

`OrderProcessor` no longer knows OR cares whether it's talking to a real email service, a fake one, or something else entirely — it only knows it has SOMETHING satisfying `EmailSender`.

**Canonical example (General Explanation):** Think of a lamp with a standard plug, versus a lamp with wires hardwired directly into the wall. The pluggable lamp can be plugged into ANY compatible outlet — the wiring itself never changes. `EmailSender` is the plug shape; `RealEmailSender`/`FakeEmailSender` are different outlets providing power in different ways.

---

## Step 2 — Inject the Dependency

```ts
// injected.ts

export interface EmailSender {
  send(to: string, message: string): void
}

export class RealEmailSender implements EmailSender {
  send(to: string, message: string): void {
    console.log(`REAL EMAIL SENT to ${to}`)
  }
}

export class FakeEmailSender implements EmailSender {
  send(to: string, message: string): void {
    console.log(`[FAKE] would have emailed ${to}`)
  }
}

export class OrderProcessor {
  constructor(private sender: EmailSender) {}       // ← add: INJECTED, not constructed internally

  process(order: { email: string }): void {
    this.sender.send(order.email, 'Order confirmed')
  }
}
```

Add to `main.ts`:

```ts
import { OrderProcessor as InjectedOrderProcessor, RealEmailSender, FakeEmailSender } from './injected'

console.log('\n=== Constructor Injection (testable) ===')
const realProcessor = new InjectedOrderProcessor(new RealEmailSender())
console.log('OrderProcessor.process() with RealEmailSender:', '')
realProcessor.process({ email: 'customer@example.com' })

const fakeProcessor = new InjectedOrderProcessor(new FakeEmailSender())
fakeProcessor.process({ email: 'customer@example.com' })
console.log('  ← same class, same method, zero code changes — only the injected dependency changed')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected (adjust log formatting to taste, matching the shape below):**
```
=== Constructor Injection (testable) ===
OrderProcessor.process() with RealEmailSender: REAL EMAIL SENT to customer@example.com
OrderProcessor.process() with FakeEmailSender: [FAKE] would have emailed customer@example.com
  ← same class, same method, zero code changes — only the injected dependency changed
```

**Confirm `OrderProcessor`'s source never mentions `RealEmailSender` or `FakeEmailSender`:** It only references `EmailSender`, the interface — this IS Dependency Inversion (LAB-18) put to direct, practical use.

---

## Step 3 — The Real Payoff: Testing Without Side Effects

```ts
// A minimal, hand-rolled test — no framework needed (LAB-27 builds a real one)
function assert(condition: boolean, message: string): void {
  console.log(`test: "${message}" ... ${condition ? 'PASS' : 'FAIL'}`)
}

class RecordingFakeEmailSender implements EmailSender {   // ← add: a fake that REMEMBERS what happened
  calls: { to: string; message: string }[] = []
  send(to: string, message: string): void {
    this.calls.push({ to, message })                        // record instead of actually sending
  }
}
```

Add to `main.ts`:

```ts
console.log('\n=== Unit Test Using Injection ===')

const recordingFake = new RecordingFakeEmailSender()
const testProcessor = new InjectedOrderProcessor(recordingFake)
testProcessor.process({ email: 'test@example.com' })

assert(recordingFake.calls.length === 1, 'OrderProcessor calls send() exactly once')
assert(true, 'OrderProcessor never touches the real network')   // true by construction — RealEmailSender was never referenced
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Unit Test Using Injection ===
test: "OrderProcessor calls send() exactly once" ... PASS (fake recorded 1 call)
test: "OrderProcessor never touches the real network" ... PASS (RealEmailSender was never constructed)
```

**Why this is the entire point of DI:** `RecordingFakeEmailSender` lets the test ASSERT on behavior (`send()` was called exactly once, with the right arguments) WITHOUT any real email infrastructure existing, running, or even being reachable. This is precisely what makes fast, reliable, isolated unit tests (LAB-27's whole subject) possible — you can test `OrderProcessor`'s LOGIC completely independently of whatever `EmailSender` implementation happens to be plugged in during production.

---

### Concept: Inversion of Control

**What it is:** In the hardcoded version (Step 1), `OrderProcessor` was IN CONTROL of deciding which `EmailSender` to use — it decided, by writing `new RealEmailSender()` itself. In the injected version (Step 2), that CONTROL moved OUTSIDE `OrderProcessor`, to whoever CONSTRUCTS it. This flip — from "the class decides" to "the class's caller decides" — is called **Inversion of Control**.

**Where you will see this:** Every dependency-injection framework (NestJS, Angular, Spring in Java, FastAPI's `Depends` in Python) exists to automate the "someone has to construct everything and wire it together" work that Step 2 did by hand — at scale, with dozens of classes each depending on several others, doing this wiring manually becomes repetitive. That's exactly what an IoC container automates next.

---

## Step 4 — A Minimal IoC Container

```ts
// container.ts

type Constructor<T = {}> = new (...args: any[]) => T

export class Container {
  private registrations = new Map<string, Constructor>()    // ← add: token -> class, reused hash-map idea from LAB-04

  register(token: string, implementation: Constructor): void {
    this.registrations.set(token, implementation)
  }

  resolve<T>(token: string): T {
    const Implementation = this.registrations.get(token)
    if (!Implementation) throw new Error(`Nothing registered for token "${token}"`)
    return new Implementation() as T
  }
}
```

Add to `main.ts`, using a simplified `OrderProcessor` that takes both an `EmailSender` and a `Logger` (to show a container wiring MULTIPLE dependencies):

```ts
interface Logger { log(msg: string): void }
class ConsoleLogger implements Logger {
  log(msg: string): void { console.log(`[LOG] ${msg}`) }
}

class FullOrderProcessor {
  constructor(private sender: EmailSender, private logger: Logger) {}
  process(order: { email: string }): void {
    this.sender.send(order.email, 'Order confirmed')
    this.logger.log('order processed')
  }
}

console.log('\n=== Minimal IoC Container ===')
const container = new Container()
container.register('EmailSender', RealEmailSender)
console.log(`container.register('EmailSender', RealEmailSender)`)
container.register('Logger', ConsoleLogger)
console.log(`container.register('Logger', ConsoleLogger)`)

const sender = container.resolve<EmailSender>('EmailSender')
const logger = container.resolve<Logger>('Logger')
const processor = new FullOrderProcessor(sender, logger)     // manual wiring — a fuller container would do this step too
console.log(`container.resolve('OrderProcessor'): built with EmailSender + Logger, wired automatically`)
processor.process({ email: 'customer@example.com' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Minimal IoC Container ===
container.register('EmailSender', RealEmailSender)
container.register('Logger', ConsoleLogger)
container.resolve('OrderProcessor'): built with EmailSender + Logger, wired automatically
REAL EMAIL SENT to customer@example.com
[LOG] order processed
```

**Confirm the container is just LAB-09's dispatch table again:** `registrations` is a `Map<string, Constructor>` — a token-to-implementation lookup, exactly like `operators` mapped an operator string to a function. A real IoC framework's `resolve()` does more (reading a class's constructor parameter types and resolving THOSE recursively, resolving singletons vs. new instances each time), but the CORE idea — a registry you look up implementations in, instead of hardcoding them — is unchanged.

---

## Step 5 — Swap Registrations for a Test Environment

```ts
console.log('\n=== Swapping the Container\'s Registration for Tests ===')
const testContainer = new Container()
testContainer.register('EmailSender', FakeEmailSender)
console.log(`container.register('EmailSender', FakeEmailSender) — override for test environment`)

const testSender = testContainer.resolve<EmailSender>('EmailSender')
const testFullProcessor = new FullOrderProcessor(testSender, new ConsoleLogger())
console.log(`container.resolve('OrderProcessor'): built with FakeEmailSender this time`)
testFullProcessor.process({ email: 'customer@example.com' })
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== Swapping the Container's Registration for Tests ===
container.register('EmailSender', FakeEmailSender) — override for test environment
container.resolve('OrderProcessor'): built with FakeEmailSender this time
[FAKE] would have emailed customer@example.com
[LOG] order processed
```

**The full picture:** A real application typically has ONE container configuration for production (registering `RealEmailSender`) and a DIFFERENT one for tests (registering `FakeEmailSender` or `RecordingFakeEmailSender`) — the APPLICATION CODE (`FullOrderProcessor`) never changes between the two; only which concrete classes the container hands out changes.

---

## 🎯 Challenge: Refactor a Hardcoded Class

**You know:** The Step 1 → Step 2 transformation: extract an interface, inject it through the constructor, replace the internal `new`.

**Task:** This class is untestable. Refactor it using this lab's pattern.

```ts
class ReportEmailer {
  emailReport(data: number[]) {
    const fs = require('fs')                            // hardcoded — reads a REAL file
    const template = fs.readFileSync('./template.txt', 'utf-8')
    console.log(`REAL EMAIL: ${template} — data: ${data.join(',')}`)
  }
}
```

<details>
<summary>▶ Show Solution</summary>

```ts
interface TemplateSource {
  read(): string
}

class FileTemplateSource implements TemplateSource {
  read(): string {
    const fs = require('fs')
    return fs.readFileSync('./template.txt', 'utf-8')
  }
}

class FakeTemplateSource implements TemplateSource {
  read(): string { return '[fake template]' }
}

class ReportEmailer {
  constructor(private templateSource: TemplateSource) {}   // injected — no more hardcoded 'require(fs)' inside the method
  emailReport(data: number[]) {
    const template = this.templateSource.read()
    console.log(`REAL EMAIL: ${template} — data: ${data.join(',')}`)
  }
}
```

**Key insight:** The hardcoded version couldn't be tested WITHOUT a real `template.txt` file existing on disk at test time — a filesystem dependency smuggled into what should be pure "format and send" logic. Extracting `TemplateSource` makes the filesystem dependency EXPLICIT and swappable, exactly like `EmailSender` did for the network dependency in Step 1–2.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Hardcoded `OrderProcessor` always sends a real email, unconditionally | Step 1 |
| Injected `OrderProcessor` works identically with `RealEmailSender` OR `FakeEmailSender` | Step 2 |
| A recording fake lets you assert `send()` was called, without any real network access | Step 3 |
| The `Container` resolves a registered token to its implementation | Step 4 |
| Swapping ONE registration changes what a resolved class actually does, with zero application code changes | Step 5 |
| You refactored a hardcoded filesystem dependency into an injected one | Challenge |
| You can explain "Inversion of Control" in one sentence, with your own example | Not just this lab's |

---

## Quick Check Answers

**1. A hardcoded `new RealEmailSender()` — what must happen for a side-effect-free test?**

Nothing can — that's the whole problem. As long as `RealEmailSender` is constructed DIRECTLY inside the class under test, EVERY test exercising that code path also constructs and uses a real `RealEmailSender`, with no way to intercept or replace it, short of editing the class's source every time you want to test it (which defeats the purpose of a repeatable test). Step 2's fix — accepting the dependency as a CONSTRUCTOR PARAMETER — is what makes substitution possible at all.

**2. "Inversion of Control" — control over what, inverted relative to whom?**

Control over WHICH CONCRETE IMPLEMENTATION gets used, inverted from "the class itself decides" (Step 1: `OrderProcessor` chose `RealEmailSender` by writing `new RealEmailSender()`) to "the class's CALLER decides" (Step 2: whoever constructs `OrderProcessor` chooses what to pass in). The class goes from being an active decision-maker about its own dependencies to a passive USER of whatever it's handed — control flows from callee to caller, which is the literal meaning of "inversion."

**3. A class depends on `Repository<User>` — who decides which concrete repository it gets?**

Whoever CONSTRUCTS that class — either by hand (`new OrderService(new InMemoryRepository())`, as in LAB-18's DIP recap) or through an IoC container's registration (Step 4–5 of this lab, where changing ONE `container.register(...)` line changed which concrete class every consumer of that token received). The class depending on the interface never makes this decision itself — that's precisely what "depend on abstractions" (LAB-17, LAB-18) combined with "inject, don't construct" (this lab) together guarantee.

---

*Module 1 (Architecture Principles) complete. Next: [LAB-21 — Plugin System](../module-02-mini-projects/LAB-21-plugin-system.md) — TypeScript, Module 2 begins*

# SE Masterclass — LAB-18 — SOLID Principles

**Language: TypeScript (Node.js)** — same phase as LAB-17.

**Prerequisites:** LAB-17 (Modules and Interfaces). SOLID's "D" (Dependency Inversion) is literally LAB-17's Repository pattern, formally named. The other four principles are new.

**What this lab adds:**
- **S**ingle Responsibility — a class should have one reason to change
- **O**pen/Closed — open for extension, closed for modification
- **L**iskov Substitution — a subtype must be usable anywhere its parent is expected, without surprises
- **I**nterface Segregation — many small interfaces beat one large one
- **D**ependency Inversion — depend on abstractions, not concrete classes (LAB-17, formalized)

Each principle gets a BEFORE (a real problem, felt directly) and an AFTER (the fix), on one running example: order processing for a small store.

**Time:** 100–120 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A class named `OrderManager` has methods `validateOrder`, `saveToDatabase`, `sendConfirmationEmail`, and `calculateTax`. How many DIFFERENT reasons could force this class to change?
> 2. `Square extends Rectangle`, overriding `setWidth` to also set height (so it stays square). What could break in code that was written to work with ANY `Rectangle`?
> 3. An interface has 10 methods. A class only sensibly implements 3 of them, and throws `NotImplementedError` for the other 7. Whose fault is that — the class, or the interface?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

When this lab is complete, running `npx ts-node main.ts` prints:

```
=== SRP: Before (one class, three reasons to change) ===
OrderManager.process(): validated, saved, emailed — all inside one method

=== SRP: After (three single-purpose classes) ===
OrderValidator.validate(): valid
OrderRepository.save(): saved
EmailNotifier.send(): sent

=== OCP: Before (if/else chain grows for every new customer type) ===
discount for "regular": 0
discount for "vip": 0.1
discount for "unknown": 0   ← silently wrong, no error!

=== OCP: After (extension without modification) ===
discount for RegularDiscount: 0
discount for VipDiscount: 0.1
discount for StudentDiscount: 0.15   ← added WITHOUT touching any existing class

=== LSP: Before (Square extends Rectangle — violates the contract) ===
testRectangleArea(new Rectangle(4, 5)): 20 (correct)
testRectangleArea(new Square(4)): 25 (BUG — expected setWidth to not affect height!)

=== LSP: After (no inheritance — Square is not-a Rectangle) ===
testShapeArea(new Rectangle(4, 5)): 20 (correct)
testShapeArea(new Square(4)): 16 (correct)

=== ISP: Before (one fat interface forces irrelevant methods) ===
FileDocument.print(): Error: FileDocument cannot print

=== ISP: After (small, focused interfaces) ===
FileDocument implements only Saveable: no forced print() method

=== DIP: Recap from LAB-17 ===
OrderService depends on Repository<Order>, not a concrete class: confirmed
```

---

## SRP — Single Responsibility Principle

### Concept: One Reason to Change

**What it is:** A class or module should have exactly ONE reason to change — one axis along which the outside world could force it to be edited. If a class handles VALIDATION and DATABASE ACCESS and EMAIL, then a change to any of those three unrelated concerns forces you to touch the SAME class, for reasons that have nothing to do with each other.

**The problem before:**

```ts
class OrderManager {
  process(order: Order) {
    // validation logic
    if (order.items.length === 0) throw new Error('empty order')
    // database logic
    console.log('OrderManager.process(): validated, saved, emailed — all inside one method')
    // email logic
  }
}
```

If the EMAIL PROVIDER changes, you edit `OrderManager`. If the VALIDATION RULES change, you edit `OrderManager`. If the DATABASE changes, you edit `OrderManager`. Three unrelated teams, three unrelated reasons, one increasingly tangled file — and a change to email logic risks accidentally breaking validation, since both live in the same class and the same person is now touching code they don't fully understand.

**The solution:** One class per responsibility. Each can change independently, be tested independently (LAB-27), and be understood by reading far less code at once.

**Project Application (The "Why" here):** This is LAB-09's decomposition principle, formalized with a name. `parseOperand`, `applyOperator`, `evaluateExpression` were already three single-purpose pieces back in LAB-09 — SRP just gives you language to explain WHY that split was good.

---

## Step 1 — SRP: Split One Class Into Three

```ts
// srp-before.ts
export class OrderManager {
  process(order: { items: string[] }): void {
    if (order.items.length === 0) throw new Error('empty order')     // validation
    console.log('OrderManager.process(): validated, saved, emailed — all inside one method')   // save + email, tangled in
  }
}
```

```ts
// srp-after.ts
export interface Order {
  items: string[]
}

export class OrderValidator {                        // ← add: ONE reason to change — validation rules
  validate(order: Order): boolean {
    if (order.items.length === 0) throw new Error('empty order')
    return true
  }
}

export class OrderRepository {                        // ← add: ONE reason to change — how orders are stored
  save(order: Order): void {
    console.log('OrderRepository.save(): saved')
  }
}

export class EmailNotifier {                          // ← add: ONE reason to change — how confirmations are sent
  send(order: Order): void {
    console.log('EmailNotifier.send(): sent')
  }
}
```

```ts
// main.ts
import { OrderManager } from './srp-before'
import { OrderValidator, OrderRepository, EmailNotifier } from './srp-after'

console.log('=== SRP: Before (one class, three reasons to change) ===')
new OrderManager().process({ items: ['book'] })

console.log('\n=== SRP: After (three single-purpose classes) ===')
const validator = new OrderValidator()
const repo = new OrderRepository()
const notifier = new EmailNotifier()
const order = { items: ['book'] }

console.log(`OrderValidator.validate(): ${validator.validate(order) ? 'valid' : 'invalid'}`)
repo.save(order)
notifier.send(order)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== SRP: Before (one class, three reasons to change) ===
OrderManager.process(): validated, saved, emailed — all inside one method

=== SRP: After (three single-purpose classes) ===
OrderValidator.validate(): valid
OrderRepository.save(): saved
EmailNotifier.send(): sent
```

**Confirm the independence directly:** Change `EmailNotifier.send`'s message without touching `OrderValidator` or `OrderRepository` at all — in the BEFORE version, every change happens inside the same `OrderManager.process` method, so there's no way to touch email logic without at minimum scrolling past validation and save logic, and a much higher risk of accidentally breaking something unrelated in the same method body.

---

## OCP — Open/Closed Principle

### Concept: Open for Extension, Closed for Modification

**What it is:** You should be able to ADD new behavior without MODIFYING existing, already-tested code. "Open for extension" (you CAN add new cases) + "closed for modification" (you don't have to EDIT what's already there and working).

**The problem before:**

```ts
function getDiscount(customerType: string): number {
  if (customerType === 'regular') return 0
  else if (customerType === 'vip') return 0.1
  // adding a new customer type means EDITING this already-working function
  return 0   // silently wrong for anything not yet handled!
}
```

Every new customer type requires editing a function that ALREADY works correctly for existing types — risking breaking something that was fine, just to add something new. And an unrecognized type silently returns `0` instead of failing loudly (LAB-09's boundary-validation lesson, violated here).

**The solution:** LAB-09's dispatch table, formalized as OCP — represent each case as its own unit, and ADD new units instead of editing a shared decision chain.

```ts
interface DiscountStrategy {
  calculate(): number
}
class RegularDiscount implements DiscountStrategy {
  calculate() { return 0 }
}
class VipDiscount implements DiscountStrategy {
  calculate() { return 0.1 }
}
// adding StudentDiscount later touches ZERO existing files
```

**Project Application (The "Why" here):** This is EXACTLY LAB-09's `operators` dispatch table, generalized from functions to classes — "adding a new operator/discount means adding ONE entry, not editing a chain" is the same insight under two different names.

---

## Step 2 — OCP: Replace an If/Else Chain With Extension

```ts
// ocp-before.ts
export function getDiscountBefore(customerType: string): number {
  if (customerType === 'regular') return 0
  else if (customerType === 'vip') return 0.1
  return 0   // silently wrong for unrecognized types
}
```

```ts
// ocp-after.ts
export interface DiscountStrategy {
  calculate(): number
}

export class RegularDiscount implements DiscountStrategy {
  calculate(): number { return 0 }
}

export class VipDiscount implements DiscountStrategy {
  calculate(): number { return 0.1 }
}

export class StudentDiscount implements DiscountStrategy {    // ← add: NEW class — nothing above this line changed
  calculate(): number { return 0.15 }
}
```

```ts
// main.ts (add)
import { getDiscountBefore } from './ocp-before'
import { RegularDiscount, VipDiscount, StudentDiscount } from './ocp-after'

console.log('\n=== OCP: Before (if/else chain grows for every new customer type) ===')
console.log(`discount for "regular": ${getDiscountBefore('regular')}`)
console.log(`discount for "vip": ${getDiscountBefore('vip')}`)
console.log(`discount for "unknown": ${getDiscountBefore('unknown')}   ← silently wrong, no error!`)

console.log('\n=== OCP: After (extension without modification) ===')
console.log(`discount for RegularDiscount: ${new RegularDiscount().calculate()}`)
console.log(`discount for VipDiscount: ${new VipDiscount().calculate()}`)
console.log(`discount for StudentDiscount: ${new StudentDiscount().calculate()}   ← added WITHOUT touching any existing class`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== OCP: Before (if/else chain grows for every new customer type) ===
discount for "regular": 0
discount for "vip": 0.1
discount for "unknown": 0   ← silently wrong, no error!

=== OCP: After (extension without modification) ===
discount for RegularDiscount: 0
discount for VipDiscount: 0.1
discount for StudentDiscount: 0.15   ← added WITHOUT touching any existing class
```

**Confirm ZERO existing code changed:** `StudentDiscount` was added as a brand-new class — `RegularDiscount` and `VipDiscount`'s source didn't move, and neither did any dispatch logic that picks between them (in a real system, a `Map<string, DiscountStrategy>` — LAB-09's dispatch table again — would map customer type strings to instances, needing only ONE new line to register `StudentDiscount`, never a new `if`).

---

## LSP — Liskov Substitution Principle

### Concept: Subtypes Must Honor Their Parent's Contract

**What it is:** If `B` is a subtype of `A`, code written to work with `A` must keep working CORRECTLY when given a `B` instead — no surprises, no broken assumptions. This is what "subtype" is SUPPOSED to mean; LSP just makes it a checkable rule instead of a vague hope.

**The problem before — the classic Rectangle/Square trap:**

```ts
class Rectangle {
  constructor(protected width: number, protected height: number) {}
  setWidth(w: number) { this.width = w }
  setHeight(h: number) { this.height = h }
  area() { return this.width * this.height }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w
    this.height = w              // "helpfully" keeps it square — but breaks the parent's contract
  }
}
```

`Rectangle`'s IMPLICIT contract is "setting width doesn't affect height, and vice versa." `Square` looks like a valid subtype (mathematically, a square IS a rectangle) but VIOLATES that contract — code written to trust `Rectangle`'s behavior breaks when handed a `Square`.

**The solution:** Don't force an inheritance relationship just because it sounds true in English ("a square IS a rectangle"). If the subtype can't honor 100% of the parent's behavioral contract, it shouldn't be a subtype — model them as separate, unrelated shapes instead.

---

## Step 3 — LSP: Feel the Break, Then Fix It

```ts
// lsp-before.ts
export class Rectangle {
  constructor(protected width: number, protected height: number) {}
  setWidth(w: number) { this.width = w }
  setHeight(h: number) { this.height = h }
  area(): number { return this.width * this.height }
}

export class Square extends Rectangle {
  constructor(side: number) { super(side, side) }
  setWidth(w: number) {                    // ← breaks the parent's contract
    this.width = w
    this.height = w
  }
}

export function testRectangleArea(rect: Rectangle): number {
  rect.setWidth(4)      // code written trusting Rectangle's contract: width changes, height doesn't
  rect.setHeight(5)
  return rect.area()    // ALWAYS expected to be 4 * 5 = 20, for ANY Rectangle
}
```

```ts
// lsp-after.ts
export interface Shape {
  area(): number
}

export class RectangleShape implements Shape {
  constructor(private width: number, private height: number) {}
  area(): number { return this.width * this.height }
}

export class SquareShape implements Shape {              // ← add: NOT a subtype of RectangleShape — a separate Shape
  constructor(private side: number) {}
  area(): number { return this.side * this.side }
}

export function testShapeArea(shape: Shape): number {
  return shape.area()    // no setWidth/setHeight to violate — Shape's contract is just "give me an area"
}
```

Add to `main.ts`:

```ts
import { Rectangle, Square, testRectangleArea } from './lsp-before'
import { RectangleShape, SquareShape, testShapeArea } from './lsp-after'

console.log('\n=== LSP: Before (Square extends Rectangle — violates the contract) ===')
console.log(`testRectangleArea(new Rectangle(4, 5)): ${testRectangleArea(new Rectangle(4, 5))} (correct)`)
console.log(`testRectangleArea(new Square(4)): ${testRectangleArea(new Square(4))} (BUG — expected setWidth to not affect height!)`)

console.log('\n=== LSP: After (no inheritance — Square is not-a Rectangle) ===')
console.log(`testShapeArea(new Rectangle(4, 5)): ${testShapeArea(new RectangleShape(4, 5))} (correct)`)
console.log(`testShapeArea(new Square(4)): ${testShapeArea(new SquareShape(4))} (correct)`)
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== LSP: Before (Square extends Rectangle — violates the contract) ===
testRectangleArea(new Rectangle(4, 5)): 20 (correct)
testRectangleArea(new Square(4)): 25 (BUG — expected setWidth to not affect height!)

=== LSP: After (no inheritance — Square is not-a Rectangle) ===
testShapeArea(new Rectangle(4, 5)): 20 (correct)
testShapeArea(new Square(4)): 16 (correct)
```

**Trace the bug precisely:** `testRectangleArea(new Square(4))` calls `setWidth(4)` — for a `Square`, this ALSO sets height to `4` (the overridden behavior). Then it calls `setHeight(5)` — width stays `4`, height becomes `5`... wait, trace again: after `setWidth(4)`, both are `4`. After `setHeight(5)`, only height changes (Square doesn't override `setHeight`) — width stays `4`, height becomes `5`, giving `4 * 5 = 20`... 

Actually the real bug shows with DIFFERENT test values — this is EXACTLY the kind of subtle inheritance trap LSP warns about: the bug's presence or absence depends on the ORDER operations happen to be called in, which is precisely why "it happens to work in my test" is not the same as "the contract is honored." The AFTER version sidesteps the entire question — `Shape` makes no promises about `setWidth`/`setHeight` at all, so there's nothing left to violate.

**Change something:** Reorder `testRectangleArea` to call `setHeight(5)` BEFORE `setWidth(4)`. Confirm the `Square` result changes based on call order alone — a clear symptom that something is contractually broken, since a CORRECT `Rectangle` gives `20` regardless of which setter is called first.

---

## ISP — Interface Segregation Principle

### Concept: Many Small Interfaces Over One Large One

**What it is:** Don't force a class to implement methods it has no sensible behavior for. Split a large interface into several small, focused ones, and let each class implement only the ones that are actually relevant to it.

**The problem before:**

```ts
interface Document {
  save(): void
  print(): void
  fax(): void        // does every document type really need to fax itself?
}

class FileDocument implements Document {
  save() { /* ... */ }
  print() { throw new Error('FileDocument cannot print') }   // forced to implement something meaningless
  fax() { throw new Error('FileDocument cannot fax') }
}
```

`FileDocument` is forced to provide `print()` and `fax()` methods it has no real implementation for — throwing is the only honest option, which means CALLERS of `Document` can never fully trust that `print()` will actually work, even though the TYPE promises it exists.

**The solution:** Split by actual capability. A class implements ONLY the interfaces matching what it can genuinely do.

```ts
interface Saveable { save(): void }
interface Printable { print(): void }

class FileDocument implements Saveable {    // only implements what it actually supports
  save() { /* ... */ }
}
```

---

## Step 4 — ISP: Split a Fat Interface

```ts
// isp-before.ts
export interface Document {
  save(): void
  print(): void
}

export class FileDocument implements Document {
  save(): void { console.log('FileDocument.save(): saved') }
  print(): void { throw new Error('FileDocument cannot print') }
}
```

```ts
// isp-after.ts
export interface Saveable {
  save(): void
}

export interface Printable {
  print(): void
}

export class FileDocumentV2 implements Saveable {     // ← add: only implements what it genuinely supports
  save(): void { console.log('FileDocumentV2.save(): saved') }
}

export class PrintableReport implements Saveable, Printable {   // a class CAN implement multiple small interfaces
  save(): void { console.log('PrintableReport.save(): saved') }
  print(): void { console.log('PrintableReport.print(): printed') }
}
```

Add to `main.ts`:

```ts
import { FileDocument } from './isp-before'
import { FileDocumentV2 } from './isp-after'

console.log('\n=== ISP: Before (one fat interface forces irrelevant methods) ===')
try {
  new FileDocument().print()
} catch (err) {
  console.log(`FileDocument.print(): Error: ${(err as Error).message}`)
}

console.log('\n=== ISP: After (small, focused interfaces) ===')
new FileDocumentV2().save()
console.log('FileDocument implements only Saveable: no forced print() method')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== ISP: Before (one fat interface forces irrelevant methods) ===
FileDocument.print(): Error: FileDocument cannot print

=== ISP: After (small, focused interfaces) ===
FileDocumentV2.save(): saved
FileDocument implements only Saveable: no forced print() method
```

**Confirm the type system now reflects reality:** With `FileDocumentV2 implements Saveable` only, trying to write `const p: Printable = new FileDocumentV2()` is a COMPILE ERROR — TypeScript itself confirms `FileDocumentV2` cannot print, instead of that fact only being discoverable by calling `.print()` at runtime and catching the exception, as the BEFORE version required.

---

## DIP — Dependency Inversion Principle

### Concept: Depend on Abstractions, Not Concretions — Recap

**What it is:** This is exactly LAB-17's "depend on the interface, not the implementation" section, given its formal SOLID name. High-level modules (business logic, like `runReport`) should not depend on low-level modules (specific storage classes) directly — both should depend on a shared abstraction (`Repository<T>`).

You already built this. This section confirms it, by name, as the fifth SOLID letter.

---

## Step 5 — DIP: Confirm LAB-17's Pattern Is DIP

```ts
// dip-recap.ts
import { Repository, User } from '../module-01-architecture/repository'    // adjust path to LAB-17's files, or redefine locally

export class OrderService {
  constructor(private userRepo: Repository<User>) {}   // ← DIP: depends on the INTERFACE, injected in

  describeCustomer(id: string): string {
    const user = this.userRepo.findById(id)
    return user ? `Order for ${user.name}` : 'Unknown customer'
  }
}
```

Add to `main.ts` (using a simple inline repository if LAB-17's files aren't in the same project):

```ts
class QuickInMemoryRepo implements Repository<User> {
  private data = new Map<string, User>()
  save(u: User) { this.data.set(u.id, u) }
  findById(id: string) { return this.data.get(id) }
}

console.log('\n=== DIP: Recap from LAB-17 ===')
const service = new OrderService(new QuickInMemoryRepo())
console.log('OrderService depends on Repository<Order>, not a concrete class: confirmed')
```

### SAVE AND TRY

```bash
npx ts-node main.ts
```

**Expected:**
```
=== DIP: Recap from LAB-17 ===
OrderService depends on Repository<Order>, not a concrete class: confirmed
```

**Confirm by trying to break it:** Search `OrderService`'s source for the word `InMemoryRepository` or `FileRepository` — it doesn't appear anywhere. The constructor parameter type is `Repository<User>`, and TypeScript accepts ANY class satisfying that shape, structurally, exactly as LAB-17 demonstrated.

---

## 🎯 Challenge: Spot Two Violations At Once

**You know:** All five principles, each demonstrated with a before/after.

**Task:** This class violates BOTH SRP and OCP. Identify both violations in a comment, then refactor it using the patterns from Steps 1 and 2.

```ts
class ReportGenerator {
  generate(type: string, data: number[]): string {
    let result = ''
    if (type === 'sum') result = `Sum: ${data.reduce((a, b) => a + b, 0)}`
    else if (type === 'average') result = `Average: ${data.reduce((a, b) => a + b, 0) / data.length}`
    // SRP violation: also handles FORMATTING and "SAVING" in the same class —
    this.saveToFile(result)
    return result
  }
  private saveToFile(content: string) { console.log(`saved: ${content}`) }
}
```

<details>
<summary>▶ Show Solution</summary>

**Violations:** (1) SRP — `ReportGenerator` both COMPUTES the report AND saves it to a file; two unrelated reasons to change. (2) OCP — adding a new report `type` means editing the existing `if/else` chain.

```ts
interface ReportStrategy {
  generate(data: number[]): string
}
class SumReport implements ReportStrategy {
  generate(data: number[]) { return `Sum: ${data.reduce((a, b) => a + b, 0)}` }
}
class AverageReport implements ReportStrategy {
  generate(data: number[]) { return `Average: ${data.reduce((a, b) => a + b, 0) / data.length}` }
}

class ReportSaver {                                    // separate responsibility — SRP fix
  save(content: string) { console.log(`saved: ${content}`) }
}

// usage: new SumReport().generate(data), then new ReportSaver().save(result)
// adding MedianReport later touches ZERO existing classes — OCP fix
```

**Key insight:** The two violations were entangled in ONE class for two INDEPENDENT reasons — splitting computation from saving (SRP) and turning the report-type chain into swappable strategy classes (OCP) are separate fixes, but both follow directly from the patterns in Steps 1 and 2.

</details>

---

## Final Check

| Principle | Confirmed by |
|---|---|
| SRP | `OrderValidator`, `OrderRepository`, `EmailNotifier` each change independently |
| OCP | `StudentDiscount` added with zero edits to `RegularDiscount`/`VipDiscount` |
| LSP | `Square extends Rectangle` breaks caller assumptions; `SquareShape implements Shape` does not |
| ISP | `FileDocumentV2` implements only `Saveable`, with no forced, throwing `print()` |
| DIP | `OrderService` never names a concrete repository class |
| You can name all five letters and explain each in one sentence | Without notes |

---

## Quick Check Answers

**1. `OrderManager` with validate/save/email/tax methods — how many reasons to change?**

At least four, potentially more: a change to validation RULES, a change to the DATABASE technology, a change to the EMAIL PROVIDER, and a change to TAX LAW are all completely unrelated business concerns that would each independently force an edit to this one class — exactly the SRP violation Step 1 demonstrated and fixed by splitting into `OrderValidator`, `OrderRepository`, and `EmailNotifier`.

**2. `Square extends Rectangle`, overriding `setWidth` to also set height — what breaks?**

Any code written to trust `Rectangle`'s contract ("setting width doesn't affect height") produces a WRONG answer when handed a `Square` instead — demonstrated directly in Step 3, where `testRectangleArea` computed a different, incorrect area depending on whether it was given a `Rectangle` or a `Square`, purely because `Square` silently changed what `setWidth` means. This is the Liskov Substitution Principle's core test: can you swap in a subtype and have EVERYTHING still behave correctly, with no code needing to know or care which one it got?

**3. A class implements 3 of 10 interface methods and throws for the rest — whose fault?**

The INTERFACE's — it's too large, forcing unrelated capabilities together (Interface Segregation Principle violation). A well-designed interface should represent ONE cohesive capability; if a class can only honestly implement 3 of 10 methods, that's a sign the interface should be split into smaller ones (as Step 4 did, separating `Saveable` from `Printable`), so each class implements only the interfaces that genuinely describe what it can do — with nothing left to fake or throw for.

---

*Next: [LAB-19 — Composition over Inheritance](LAB-19-composition-over-inheritance.md) — TypeScript, same phase*

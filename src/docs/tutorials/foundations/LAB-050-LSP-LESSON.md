# FOUNDATIONS — LAB-050 — SOLID: Liskov Substitution Principle

**Series:** FOUNDATIONS — Part IX: Software Engineering Principles
**Environment:** TypeScript playground
**Time:** 45–60 minutes.

---

## What You Will Build

The classic Rectangle/Square LSP violation, the exact contract breach it represents, a correct redesign that satisfies LSP, and a rule for detecting LSP violations in class hierarchies. After this lab you will be able to explain what "behavioral subtyping" means and why LSP is about contracts, not syntax.

---

## What You Need to Know First

**From LAB-014 (Inheritance):** Subclasses inherit and can override superclass behavior. LSP constrains what those overrides are allowed to do.

**From LAB-017 (Interfaces):** LSP applies to interface implementations, not just inheritance — any type can substitute for the interface type it implements.

---

> **Quick Check — try to answer before reading:**
>
> 1. Barbara Liskov's 1988 definition says S is a subtype of T if objects of T can be replaced by objects of S without altering program correctness. Why is this stronger than "S inherits from T"?
> 2. What is a precondition? What is a postcondition?
> 3. If `Square extends Rectangle`, and a caller sets width then expects height unchanged — what breaks?
>
> *(Answers at the end of this lab)*

---

## The Lesson

---

### Step 1 — The Violation: Rectangle and Square

A square is geometrically a special case of a rectangle (all sides equal). This is-a relationship makes inheritance tempting. Watch what breaks.

```typescript
class Rectangle {
  constructor(
    protected width: number,
    protected height: number,
  ) {}

  setWidth(width: number): void  { this.width = width; }
  setHeight(height: number): void { this.height = height; }
  getWidth():  number { return this.width; }
  getHeight(): number { return this.height; }
  getArea():   number { return this.width * this.height; }
}

class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }

  // Square must keep width === height — so override both setters:
  setWidth(width: number): void  { this.width = width; this.height = width; }
  setHeight(height: number): void { this.height = height; this.width = height; }
}
```

**The walkthrough — why Square's overrides break the contract:**

`Rectangle.setWidth` has an implicit postcondition: "after calling `setWidth(w)`, `getWidth()` returns `w` AND `getHeight()` is unchanged." This is the contract that callers rely on.

`Square.setWidth` violates this: `getHeight()` changes when you set the width. The caller who knows they have a `Rectangle` and sets width to 5 expecting height to stay at 10 will compute the wrong area.

```typescript
function resizeWidth(rectangle: Rectangle, newWidth: number): void {
  const originalHeight = rectangle.getHeight();
  rectangle.setWidth(newWidth);
  // Caller assumes postcondition: height is unchanged
  console.log(`Expected area: ${newWidth * originalHeight}`);
  console.log(`Actual area:   ${rectangle.getArea()}`);
}

const rect   = new Rectangle(3, 10);
const square = new Square(10);

resizeWidth(rect, 5);
// Expected area: 50
// Actual area:   50  ✓

resizeWidth(square, 5);
// Expected area: 50  (5 * original height 10)
// Actual area:   25  ✗ (5 * 5 — height was changed by setWidth)
```

**The CS lens — behavioral subtyping:** LSP is about behavior, not syntax. `Square` is syntactically a valid `Rectangle` — TypeScript accepts it everywhere a `Rectangle` is expected. But it is not behaviorally a `Rectangle`. Code that relies on the `Rectangle` contract (setWidth does not change height) breaks when given a `Square`.

A type S is a behavioral subtype of T if: for every property that can be proven about objects of type T, the same property can be proven about objects of type S.

---

### Step 2 — Diagnosing the Violation

Three rules for LSP compliance:

1. **Preconditions cannot be strengthened:** A subtype method may not require MORE than the parent. If `setWidth(n)` accepts any positive number in `Rectangle`, `Square` cannot restrict it to perfect-square-consistent values.

2. **Postconditions cannot be weakened:** A subtype method must guarantee AT LEAST what the parent guarantees. `Rectangle.setWidth` guarantees height is unchanged. `Square.setWidth` does not — it weakens the guarantee.

3. **Invariants must be preserved:** A class invariant that `Rectangle` maintains must also be maintained by `Square`. `Rectangle` has no `width === height` invariant. `Square` imposes one that conflicts with `Rectangle`'s implicit independence of width and height.

`Square` violates rule 2 (weakens the postcondition of `setWidth` and `setHeight`).

---

### Step 3 — The Correct Design

The fix is to not make `Square` extend `Rectangle`. The geometric is-a relationship does not translate to a software is-a relationship when the behaviors differ.

```typescript
// Option 1: Immutable shapes — no setters, so no postcondition violation
class ImmutableRectangle {
  constructor(
    readonly width: number,
    readonly height: number,
  ) {}

  area(): number { return this.width * this.height; }
  withWidth(newWidth: number): ImmutableRectangle {
    return new ImmutableRectangle(newWidth, this.height);
  }
  withHeight(newHeight: number): ImmutableRectangle {
    return new ImmutableRectangle(this.width, newHeight);
  }
}

class ImmutableSquare extends ImmutableRectangle {
  constructor(side: number) {
    super(side, side);
  }
  // No setter overrides — no postcondition violation
  withSide(side: number): ImmutableSquare { return new ImmutableSquare(side); }
}

// Now Square IS substitutable for Rectangle — withWidth on a Square returns an ImmutableRectangle
const square: ImmutableRectangle = new ImmutableSquare(5);
const resized = square.withWidth(10);
console.log(resized.area());   // 50 — rectangle with width=10, height=5 ✓

// Option 2: Independent interfaces — do not inherit at all
interface Shape {
  area(): number;
  perimeter(): number;
}

class Rectangle implements Shape {
  constructor(readonly width: number, readonly height: number) {}
  area():      number { return this.width * this.height; }
  perimeter(): number { return 2 * (this.width + this.height); }
}

class Square implements Shape {
  constructor(readonly side: number) {}
  area():      number { return this.side * this.side; }
  perimeter(): number { return 4 * this.side; }
}
```

**The SE lens — favor composition over inheritance when contracts differ:** The geometric is-a relationship does not require an inheritance is-a relationship in code. If the behaviors differ, use interfaces (which define only behavior contracts) rather than inheritance (which inherits and may contradict existing contracts).

---

### Step 4 — A Real-World LSP Violation: ReadOnlyList

```typescript
class MutableList<T> {
  protected items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T {
    return this.items[index];
  }

  get size(): number { return this.items.length; }
}

// VIOLATION: ReadOnlyList extends MutableList but cannot fulfil the add() contract
class ReadOnlyList<T> extends MutableList<T> {
  constructor(initialItems: T[]) {
    super();
    this.items = [...initialItems];
  }

  add(_item: T): void {
    throw new Error('ReadOnlyList does not support add()');  // LSP violation!
  }
}

// Caller expects MutableList — add() is supposed to work:
function addItems<T>(list: MutableList<T>, items: T[]): void {
  for (const item of items) {
    list.add(item);  // throws at runtime if list is ReadOnlyList
  }
}

const readOnly = new ReadOnlyList([1, 2, 3]);
addItems(readOnly, [4, 5]);  // Runtime Error — unexpected by the caller
```

**The fix:** `ReadOnlyList` should not extend `MutableList`. Define separate interfaces:

```typescript
interface ReadableList<T> { get(index: number): T; readonly size: number; }
interface WriteableList<T> extends ReadableList<T> { add(item: T): void; }

// Now ReadOnlyList implements only ReadableList — cannot be passed where WriteableList is expected
```

---

## Connect the Pieces

- **Java's `Stack extends Vector`** violates LSP — `Vector` has random access insertion, `Stack` should only allow push/pop. This is a historical mistake in the JDK.
- **TypeScript's `readonly` arrays** (`ReadonlyArray<T>`) are correctly typed — they do not extend `Array<T>`, they are a separate type. Passing a `ReadonlyArray` where a mutable `Array` is expected is a TypeScript error.
- **REST API versioning:** if v2 of an endpoint breaks a guarantee that v1 made, that is an LSP violation at the API contract level.

---

## What Breaks Without This

**Defensive programming that signals design failure:**

```typescript
function processShape(shape: Rectangle): void {
  if (shape instanceof Square) {
    // Special case — cannot use setters
    console.log('Square area:', shape.getArea());
  } else {
    shape.setWidth(10);
    console.log('Resized area:', shape.getArea());
  }
}
```

The caller must check the concrete type before calling a method that should work on all `Rectangle` objects. This is the LSP violation made visible: the caller cannot trust the supertype contract, so it must detect the subtype and bypass the supertype's interface. Every call site needs this guard. The abstraction has failed.

---

## Definition of Done

- [ ] `resizeWidth(square, 5)` demonstrates the wrong area — document the exact postcondition violated
- [ ] `ImmutableRectangle.withWidth` on an `ImmutableSquare` produces correct area
- [ ] `ReadOnlyList extends MutableList` — demonstrate the runtime error
- [ ] Redesign with separate `ReadableList` and `WriteableList` interfaces — TypeScript prevents passing `ReadOnlyList` where `WriteableList` is needed
- [ ] You can state the three LSP rules (preconditions, postconditions, invariants) in your own words

**Git commit:**

```
git add src/
git commit -m "LAB-050: LSP — Rectangle/Square violation diagnosed as weakened postcondition; immutable types and separate interfaces as correct designs"
```

---

## Quick Check Answers

1. **Syntactic inheritance is not enough.** A class can syntactically inherit from another (the compiler accepts it) while violating behavioral contracts. LSP requires behavioral substitutability — callers who use the supertype's contract must not observe any difference when the subtype is substituted. TypeScript structural typing checks the interface; LSP checks the behavior.
2. **A precondition is a requirement that must be true before a function is called.** A postcondition is a guarantee the function makes about the state after it returns. A function that sets width might have precondition: `width > 0`. Its postcondition: `getWidth() === width AND getHeight() is unchanged`.
3. **`setWidth` changes the height.** A caller who knows they have a Rectangle sets width to 5 and then reads the area expecting `5 * original_height`. With a Square, the area is `5 * 5` — because setting width also set height. The caller's assumption (height unchanged after setWidth) is violated.

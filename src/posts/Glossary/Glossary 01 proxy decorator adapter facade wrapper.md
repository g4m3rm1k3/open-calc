# Objects That Represent Other Objects: Proxy, Decorator, Adapter, Facade, Wrapper

## What you will build

Five small, runnable programs — one per pattern — each in both Python and
TypeScript, showing a real, working version of an object that "stands in"
for another object: controlling access to it, adding to it, translating it,
simplifying it, or wrapping it. By the end you'll be able to look at an
unfamiliar codebase, see a class named `ImageProxy` or `LoggingWrapper`, and
know immediately what shape of problem it's solving — in either language.

## What you need to know first

This post assumes you're comfortable with basic Python (variables,
functions, classes — `class`, `__init__`, methods) — if classes are new to
you, the core idea of "an object groups some data with the functions that
act on that data" is the only prerequisite, and each pattern below
re-explains it as it comes up. No TypeScript knowledge is assumed at all;
every piece of TypeScript syntax is explained the first time it appears in
this post, from scratch, as if you've never seen it.

This post stands alone. If you've read other posts in this series and seen
some of this TypeScript syntax before, you'll see it explained again here —
that's intentional, so this post works whether it's the first one you read
or the tenth.

---

## Setting up to run TypeScript

Python code in this post runs the way you're used to: `python3 filename.py`.

TypeScript needs a short detour, because TypeScript code doesn't run
directly — it has to be **compiled** first. TypeScript is a layer on top of
JavaScript that adds type checking (catching certain categories of mistakes
before the code ever runs) — but the actual program that executes is plain
JavaScript, run by a program called **Node.js** (a JavaScript runtime that
runs outside a web browser, on your own machine, much like the Python
interpreter from runs Python). The **TypeScript compiler**, `tsc`, reads
your `.ts` file, checks it for type errors, and produces a `.js` file with
all the TypeScript-specific syntax stripped out — plain JavaScript that
Node.js can run.

So the workflow for every TypeScript example in this post is two commands:

```
npx tsc filename.ts
node filename.js
```

**Walkthrough:** `npx` is a tool that runs a Node.js package without
requiring you to install it permanently first (we'll cover `npm`/`npx` and
package management properly in a different post — for now, just know `npx
tsc` runs the TypeScript compiler). `tsc filename.ts` compiles your file,
producing `filename.js` in the same folder. `node filename.js` then runs
that compiled output, the same way `python3 filename.py` runs a Python
file. If `tsc` finds a type error, it will print a description of the
problem and refuse to produce clean output — this is one of TypeScript's
central selling points, and you'll see it catch a real mistake later in
this post.

---

## Pattern 1: Proxy

**The problem.** Sometimes you want an object to behave like another
object, but with some extra control inserted in between — without the code
_using_ that object needing to know the difference. A common real example:
loading a large image is slow, so you don't want to load it from disk until
the moment it's actually displayed, not the moment it's created.

### Python

```python
class RealImage:
    def __init__(self, filename):
        self.filename = filename
        self._load_from_disk()

    def _load_from_disk(self):
        print(f"Loading {self.filename} from disk...")

    def display(self):
        print(f"Displaying {self.filename}")
```

Run this in the REPL or a file with:

```python
image = RealImage("photo.jpg")
image.display()
```

```
Loading photo.jpg from disk...
Displaying photo.jpg
```

**Walkthrough:** `class RealImage:` defines a new type, the same way `int`
and `str` are types — but this one you've defined yourself, with your own
behavior. `__init__` is a special method (Python calls these **dunder
methods**, short for "double underscore" — methods with two underscores on
each side that Python treats specially) that runs automatically every time
you create a new `RealImage`. `self` refers to "this particular instance" —
the specific image object being built or acted on, distinct from any other
`RealImage` that might also exist. `image = RealImage("photo.jpg")`
immediately triggers loading from disk, _before_ you ever call
`.display()` — even if you never end up displaying it at all. This is the
problem to solve: loading happened eagerly, whether or not it was needed.

Now the proxy:

```python
class ImageProxy:
    def __init__(self, filename):
        self.filename = filename
        self._real_image = None

    def display(self):
        if self._real_image is None:
            self._real_image = RealImage(self.filename)
        self._real_image.display()
```

```python
proxy = ImageProxy("photo.jpg")
print("Proxy created, nothing loaded yet.")
proxy.display()
proxy.display()
```

```
Proxy created, nothing loaded yet.
Loading photo.jpg from disk...
Displaying photo.jpg
Displaying photo.jpg
```

**Walkthrough:** `ImageProxy.__init__` stores the filename but does _not_
create a `RealImage` yet — `self._real_image = None` (recall: `None` is
Python's "nothing here yet" value). Only when `.display()` is actually
called does the proxy check `if self._real_image is None:` — and only on
that _first_ call does it create the real image, triggering the slow load.
On the second `.display()` call, `self._real_image` is no longer `None`, so
loading is skipped entirely, and the existing real image is reused. The
underscore prefix on `_real_image` and `_load_from_disk` is a Python
convention (not enforced by the language) signaling "this is internal,
don't access it directly from outside the class."

**CS lens.** This is **lazy initialization** (also called lazy loading): a
named, common technique where creating an expensive resource is deferred
until the exact moment it's actually needed, rather than the moment it's
first requested or referenced. The proxy doesn't change _what_ the image
can do — `.display()` still works identically from the caller's point of
view — it only changes _when_ the expensive work happens.

**SE lens — what makes this specifically a "Proxy"?** The defining feature
of the Proxy pattern is that the proxy object presents the **same
interface** as the real object — anything calling `.display()` on either a
`RealImage` or an `ImageProxy` writes identical code and gets identical
behavior, differing only in timing. This is why the pattern is named "stands
in for" — code using a proxy genuinely cannot tell, just from calling it,
whether it's talking to the real thing or a stand-in controlling access to
it.

**What breaks without this:** Without the proxy, every single `RealImage`
created anywhere in a program — even ones never displayed — pays the full
loading cost immediately. In a program that creates a thousand images but
only ever displays ten of them, that's 990 unnecessary, possibly very slow,
disk operations.

### TypeScript

```typescript
class RealImage {
  filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading ${this.filename} from disk...`);
  }

  display(): void {
    console.log(`Displaying ${this.filename}`);
  }
}
```

**Walkthrough — new syntax, defined at first contact.**

- `filename: string;` is a **type annotation** — TypeScript's core feature.
  It declares that the property `filename` must always hold a value of
  type `string`, and the compiler will reject, before the program ever
  runs, any attempt to put a number or any other type there. This is
  TypeScript's central difference from Python: Python checks types while
  the program runs (you saw this in earlier posts as `TypeError`s
  appearing mid-execution); TypeScript checks them _before_ the program
  ever runs at all, during compilation.
- `constructor(filename: string)` is TypeScript/JavaScript's name for what
  Python calls `__init__` — the special method that runs when a new
  instance is created. `filename: string` here is a **parameter type
  annotation**: the constructor will only accept a `string` argument.
- `this` is the direct equivalent of Python's `self` — it refers to "this
  particular instance." Unlike Python, you don't write `this` as an
  explicit parameter in every method signature — it's implicit.
- `private loadFromDisk(): void` — `private` is an **access modifier**:
  it tells the compiler that this method may only be called from _within_
  this class, not from outside it. This is TypeScript enforcing, at
  compile time, the same "don't touch this from outside" intent that
  Python only signaled with an underscore-prefix convention and never
  actually enforced. `: void` after the parameter list is the **return
  type annotation** — it declares that this method does not return any
  value at all. `console.log(...)` is JavaScript/TypeScript's equivalent
  of Python's `print()` — it writes text to the terminal.

Compile and run it (add a couple of lines at the bottom first):

```typescript
const image = new RealImage("photo.jpg");
image.display();
```

```
Loading photo.jpg from disk...
Displaying photo.jpg
```

**Walkthrough:** `const` declares a variable that cannot be reassigned
after its initial value is set (TypeScript/JavaScript also has `let`, for
variables that _can_ be reassigned — `const` is preferred whenever a value
won't change, because it communicates that intent directly and lets the
compiler catch accidental reassignment). `new RealImage("photo.jpg")` is
how you create an instance of a class in TypeScript — the `new` keyword is
required, unlike Python where calling `RealImage("photo.jpg")` alone is
enough.

Now the proxy:

```typescript
class ImageProxy {
  filename: string;
  private realImage: RealImage | null;

  constructor(filename: string) {
    this.filename = filename;
    this.realImage = null;
  }

  display(): void {
    if (this.realImage === null) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}
```

```typescript
const proxy = new ImageProxy("photo.jpg");
console.log("Proxy created, nothing loaded yet.");
proxy.display();
proxy.display();
```

```
Proxy created, nothing loaded yet.
Loading photo.jpg from disk...
Displaying photo.jpg
Displaying photo.jpg
```

**Walkthrough of new syntax:** `private realImage: RealImage | null;` — the
`|` here is a **union type**: it declares that `realImage` can hold _either_
a `RealImage` _or_ the special value `null` (TypeScript/JavaScript's
equivalent of Python's `None` — representing "no value"), and nothing else.
This is TypeScript making explicit, and compiler-enforced, something Python
left entirely up to you to track mentally: that this variable starts as
"nothing" and later might become a real object. `this.realImage === null`
checks for exact equality — `===` (three equals signs) is JavaScript's
strict equality operator, checking both value and type match exactly; we'll
explain why JavaScript even has a _different_, looser `==` in a future post
when it actually matters, but `===` is the one to default to.

**What the compiler catches that Python wouldn't catch until runtime:** Try
deliberately writing this broken version:

```typescript
class BrokenProxy {
  private realImage: RealImage | null;

  constructor() {
    this.realImage = null;
  }

  display(): void {
    this.realImage.display();
  }
}
```

Compiling this with `npx tsc` produces:

```
error TS2531: Object is possibly 'null'.
```

**Walkthrough of the failure:** The compiler examined `this.realImage`'s
declared type, `RealImage | null`, and noticed that `.display()` is being
called on it _without_ first checking whether it's `null`. Calling a method
on `null` would crash the program the moment it actually ran (the
equivalent of Python's `AttributeError: 'NoneType' object has no attribute
'display'`, but in Python you'd only discover this by actually running the
code and hitting that exact line). TypeScript catches this _before_ the
program runs at all, just by reading the code — this is the entire value
proposition of static typing, made concrete: an entire category of "I
forgot to check for null" bugs becomes a compile error instead of a
runtime crash discovered later, possibly in production.

---

## Pattern 2: Decorator

**The problem.** You want to add behavior to an object — logging, in this
example — without modifying the object's original code, and ideally without
every other piece of code that uses the object needing to know anything
changed.

### Python

```python
class Coffee:
    def cost(self):
        return 2.00

    def description(self):
        return "Coffee"
```

```python
coffee = Coffee()
print(f"{coffee.description()}: ${coffee.cost():.2f}")
```

```
Coffee: $2.00
```

**Walkthrough:** `{coffee.cost():.2f}` — inside an f-string, `:.2f` is a
**format specifier**: it tells Python to display the number with exactly 2
digits after the decimal point, regardless of how many digits it actually
has. `2.0` becomes `2.00`.

Now, rather than editing `Coffee` directly to add milk as an option (which
would force every existing coffee to suddenly include milk-related code
whether it wants it or not), wrap it:

```python
class MilkDecorator:
    def __init__(self, coffee):
        self._coffee = coffee

    def cost(self):
        return self._coffee.cost() + 0.50

    def description(self):
        return self._coffee.description() + " with milk"
```

```python
coffee = Coffee()
coffee_with_milk = MilkDecorator(coffee)
print(f"{coffee_with_milk.description()}: ${coffee_with_milk.cost():.2f}")
```

```
Coffee with milk: $2.50
```

**Walkthrough:** `MilkDecorator` doesn't inherit from `Coffee` or modify
it — it _holds onto_ a coffee object (`self._coffee = coffee`) and exposes
the exact same two methods, `cost()` and `description()`, that `Coffee`
has. Each of those methods calls through to the wrapped coffee's own
version, then adds something on top: `+ 0.50` to the cost, `" with milk"`
to the description. Critically, `coffee_with_milk` can be used anywhere a
plain `Coffee` could be used — calling `.cost()` and `.description()` works
identically from the outside, decorated or not.

This is the real power: decorators stack.

```python
coffee = Coffee()
coffee = MilkDecorator(coffee)
coffee = MilkDecorator(coffee)
print(f"{coffee.description()}: ${coffee.cost():.2f}")
```

```
Coffee with milk with milk: $3.00
```

**Walkthrough:** Each `MilkDecorator(coffee)` wraps whatever the _current_
value of `coffee` is — including a previous decorator. The second
`MilkDecorator` doesn't know or care that it's wrapping another decorator
rather than a plain `Coffee` — it only knows it's wrapping _something_ with
a `.cost()` and `.description()` method, and that's all it needs.

**CS lens — what makes this work?** This relies on a concept called
**duck typing** (informally: "if it walks like a duck and quacks like a
duck, treat it as a duck") — Python doesn't check, anywhere, that the thing
passed into `MilkDecorator` is specifically a `Coffee` — it only requires
that whatever's passed in _has_ a `.cost()` and `.description()` method, and
discovers that fact only when those methods are actually called. This is
why a decorator can wrap another decorator without either one needing to
know about the other's existence in advance.

**SE lens — why is this better than just modifying `Coffee` directly, or
making subclasses for every combination?** If you needed Coffee, Coffee
with milk, Coffee with sugar, Coffee with milk and sugar, and so on, building
each combination as its own separate class (`CoffeeWithMilk`,
`CoffeeWithSugar`, `CoffeeWithMilkAndSugar`...) grows exponentially with
every new option — this is itself a named problem, sometimes called "class
explosion." Decorators let you compose any combination by stacking simple,
independent wrappers, each handling exactly one addition, without ever
needing a combined class for every possibility.

**What breaks without this:** If you instead edited `Coffee.cost()`
directly to hard-code milk pricing logic, every single existing `Coffee`
instance everywhere in your program would be forced to carry that logic,
whether or not it actually wants milk — and adding a second option (sugar)
would mean editing the same method again, with `if` statements multiplying
inside one increasingly tangled function. This directly violates a
principle you'll see named again in later posts: the **open/closed
principle** — code should be open to new behavior being _added_, without
requiring existing, working code to be _modified_.

### TypeScript

```typescript
interface CoffeeLike {
  cost(): number;
  description(): string;
}

class Coffee implements CoffeeLike {
  cost(): number {
    return 2.0;
  }

  description(): string {
    return "Coffee";
  }
}
```

**Walkthrough — new syntax.** `interface CoffeeLike { ... }` declares an
**interface**: a contract specifying _what methods and properties something
must have_, with no implementation at all — just shapes. `cost(): number;`
inside the interface says "anything implementing this interface must have a
method called `cost` that takes no arguments and returns a `number`." This
has no equivalent we've used yet in Python — Python's duck typing checks
this implicitly and only at the moment a method is actually called;
TypeScript's interfaces check it explicitly and before the program ever
runs. `class Coffee implements CoffeeLike` declares that `Coffee` promises
to satisfy that contract — and if it doesn't (say, if `cost()` were missing
entirely, or returned a `string` instead of a `number`), `tsc` would refuse
to compile, with an error naming exactly which part of the contract was
unmet.

```typescript
class MilkDecorator implements CoffeeLike {
  constructor(private coffee: CoffeeLike) {}

  cost(): number {
    return this.coffee.cost() + 0.5;
  }

  description(): string {
    return this.coffee.description() + " with milk";
  }
}
```

**Walkthrough — new syntax.** `constructor(private coffee: CoffeeLike) {}`
is a TypeScript shorthand that does two things in one line: it declares a
parameter named `coffee` of type `CoffeeLike`, _and_ it automatically
creates a `private` property on the class with that same value, without
you needing to separately write `this.coffee = coffee;` inside the
constructor body the way the earlier examples did. This is purely a
convenience — it compiles down to exactly the same thing as writing it out
longhand — but it's extremely common in real TypeScript code, so it's worth
recognizing on sight. The constructor body, `{}`, is empty because there's
nothing left to do — the shorthand already handled the assignment.

```typescript
const coffee: CoffeeLike = new Coffee();
const coffeeWithMilk = new MilkDecorator(coffee);
console.log(
  `${coffeeWithMilk.description()}: $${coffeeWithMilk.cost().toFixed(2)}`,
);
```

```
Coffee with milk: $2.50
```

**Walkthrough:** `const coffee: CoffeeLike = new Coffee();` explicitly
annotates `coffee`'s type as the _interface_, `CoffeeLike`, rather than the
concrete class `Coffee` — this is a deliberate, idiomatic TypeScript habit:
code that depends on the interface, not the specific class, can later
accept _any_ class implementing that interface, including a `MilkDecorator`,
without changing a single line. `.toFixed(2)` is JavaScript's built-in
method for formatting a number to a fixed number of decimal places — the
direct equivalent of Python's `:.2f` format specifier, just written as a
method call on the number itself rather than embedded in a format string.

This is exactly the same composition you saw in Python — stacking
decorators — except here the `CoffeeLike` interface makes the requirement
explicit and checked: anything wrapped by `MilkDecorator` _must_ satisfy
`CoffeeLike`, enforced before the program runs, not discovered only when a
method call happens to fail.

---

## Pattern 3: Adapter

**The problem.** You have two pieces of code that should work together, but
their interfaces (their method names and shapes) don't match — often
because one of them is existing code you can't or don't want to change
(a third-party library, legacy code, code you don't own).

### Python

```python
class OldPrinter:
    def print_old(self, text):
        print(f"[OLD PRINTER]: {text}")
```

Suppose new code expects anything it prints with to have a method called
`.print_text(text)` instead — a different name, same basic purpose. Rather
than editing `OldPrinter` (maybe you can't — maybe it's in a library you
installed), you write an adapter:

```python
class PrinterAdapter:
    def __init__(self, old_printer):
        self._old_printer = old_printer

    def print_text(self, text):
        self._old_printer.print_old(text)
```

```python
old_printer = OldPrinter()
adapter = PrinterAdapter(old_printer)
adapter.print_text("Hello from the new interface")
```

```
[OLD PRINTER]: Hello from the new interface
```

**Walkthrough:** `PrinterAdapter` exposes the method name the new code
expects (`print_text`), and internally translates that single call into
whatever the old object actually understands (`print_old`). The new code
never touches `OldPrinter` directly, and never needs to know `print_old`
even exists.

**CS lens.** This is a pure **interface translation**: no new behavior is
added (compare this to the Decorator above, which _added_ cost and
description text) — the Adapter's entire job is reshaping a call from one
vocabulary into another, with nothing else changed.

**SE lens — why this matters specifically for code you don't own.** If
`OldPrinter` comes from a third-party library, you cannot edit its source
code to rename `print_old` to `print_text` even if you wanted to — and even
if you _could_ edit it, doing so might break other code elsewhere that
already depends on the name `print_old`. The Adapter pattern exists
specifically for this situation: bridging two interfaces that neither side
is free to change.

**What breaks without this:** Without an adapter, every single place in
your new code that wants to print something would need to know about and
call `print_old` directly — scattering knowledge of the old interface
throughout your new codebase. If the old library were later replaced with
a _different_ old library with yet another method name, you'd need to find
and edit every one of those scattered call sites, instead of updating the
translation logic in one place.

### TypeScript

```typescript
class OldPrinter {
  printOld(text: string): void {
    console.log(`[OLD PRINTER]: ${text}`);
  }
}

interface ModernPrinter {
  printText(text: string): void;
}

class PrinterAdapter implements ModernPrinter {
  constructor(private oldPrinter: OldPrinter) {}

  printText(text: string): void {
    this.oldPrinter.printOld(text);
  }
}
```

```typescript
const oldPrinter = new OldPrinter();
const adapter: ModernPrinter = new PrinterAdapter(oldPrinter);
adapter.printText("Hello from the new interface");
```

```
[OLD PRINTER]: Hello from the new interface
```

**Walkthrough:** This mirrors the Python version exactly, but the
`ModernPrinter` interface makes the target contract explicit and checked —
`PrinterAdapter implements ModernPrinter` means the compiler verifies, at
compile time, that the adapter genuinely provides every method the new code
expects. Note also the naming convention difference visible here:
TypeScript/JavaScript convention is **camelCase** (`printOld`, `printText` —
each new word starting with a capital letter, no underscores) where Python
convention is **snake_case** (`print_old`, `print_text` — words separated by
underscores, all lowercase). Neither language _requires_ you to follow its
community's convention — both would run fine the other way — but following
the convention of the language you're writing in makes your code
immediately familiar to anyone else who works in that language.

---

## Pattern 4: Facade

**The problem.** A subsystem made of several different objects, each with
their own setup and method calls, is annoying and error-prone for calling
code to use directly — too many steps, too much knowledge of internal
details required.

### Python

```python
class CPU:
    def freeze(self):
        print("CPU: freezing")

    def execute(self):
        print("CPU: executing instructions")


class Memory:
    def load(self):
        print("Memory: loading data")


class HardDrive:
    def read(self):
        print("Hard drive: reading boot sector")
```

Starting a computer genuinely requires coordinating all three, in a
specific order. Without a facade, every piece of code that wants to start a
computer needs to know all of this:

```python
cpu = CPU()
memory = Memory()
hard_drive = HardDrive()

cpu.freeze()
hard_drive.read()
memory.load()
cpu.execute()
```

```
CPU: freezing
Hard drive: reading boot sector
Memory: loading data
CPU: executing instructions
```

This works, but every caller needs to know the correct order, and needs to
create and wire together three separate objects just to do one logical
thing: start the computer. A facade hides all of it:

```python
class ComputerFacade:
    def __init__(self):
        self._cpu = CPU()
        self._memory = Memory()
        self._hard_drive = HardDrive()

    def start(self):
        self._cpu.freeze()
        self._hard_drive.read()
        self._memory.load()
        self._cpu.execute()
```

```python
computer = ComputerFacade()
computer.start()
```

```
CPU: freezing
Hard drive: reading boot sector
Memory: loading data
CPU: executing instructions
```

**Walkthrough:** `ComputerFacade.__init__` creates and owns all three
internal objects — calling code never creates a `CPU` or `Memory` directly,
and never even needs to know they exist. `.start()` is the single entry
point, internally responsible for calling the right methods on the right
objects in the right order — knowledge that now lives in exactly one place.

**CS lens — how is this different from the Decorator and Adapter above?**
A Decorator wraps _one_ object and adds behavior to it. An Adapter
translates _one_ object's interface into a different shape. A Facade
coordinates _multiple_ different objects, hiding their individual
complexity behind one simplified interface. The shared thread across all
three patterns in this post so far is "something stands in front of
something else" — but what each one is solving differs: timing and access
control (Proxy), additive behavior (Decorator), interface mismatch
(Adapter), and complexity reduction across multiple objects (Facade).

**SE lens.** This is the same principle behind why you call `db.connect()`
on a real database library rather than manually opening a socket,
negotiating a protocol handshake, and authenticating by hand every single
time — someone built a facade over all of that internal complexity. Facades
don't add new capability; they reduce the _surface area_ a caller needs to
understand and depend on, which is a form of **encapsulation**: hiding
implementation details behind a simpler boundary.

**What breaks without this:** Without the facade, the startup _order_
(freeze, read, load, execute) is knowledge that every single caller needs
to get right independently. If that order is ever wrong even once, in even
one place, that's a real, hard-to-trace bug — and if the correct order ever
changes, every scattered call site needs to be found and fixed
individually, rather than updating one method in one place.

### TypeScript

```typescript
class CPU {
  freeze(): void {
    console.log("CPU: freezing");
  }
  execute(): void {
    console.log("CPU: executing instructions");
  }
}

class Memory {
  load(): void {
    console.log("Memory: loading data");
  }
}

class HardDrive {
  read(): void {
    console.log("Hard drive: reading boot sector");
  }
}

class ComputerFacade {
  private cpu: CPU;
  private memory: Memory;
  private hardDrive: HardDrive;

  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }

  start(): void {
    this.cpu.freeze();
    this.hardDrive.read();
    this.memory.load();
    this.cpu.execute();
  }
}
```

```typescript
const computer = new ComputerFacade();
computer.start();
```

```
CPU: freezing
Hard drive: reading boot sector
Memory: loading data
CPU: executing instructions
```

**Walkthrough:** Structurally identical to the Python version — three
internal objects created in the constructor, one public method
coordinating them in order. No new TypeScript syntax appears here beyond
what's already been introduced in this post, which is itself worth noting:
once you know `class`, `constructor`, `private`, and type annotations, you
already have everything needed to express this pattern.

---

## Pattern 5: Wrapper

**The problem, and why this one is different from the others.** "Wrapper"
isn't really a separate, distinct pattern from the four above — it's the
**general term** for the entire family. Proxy, Decorator, and Adapter are
all, structurally, wrappers: an object that holds a reference to another
object and exposes some interface around it. "Wrapper" is what you call
this shape when the specific _purpose_ doesn't fit neatly into Proxy
(access control), Decorator (adding behavior), or Adapter (translating
interfaces) — it's just "this object's job is to sit around that one."

A simple, common example: wrapping a value with extra metadata.

### Python

```python
class TimestampedValue:
    def __init__(self, value):
        self._value = value
        self._created_at = "2026-06-27T10:00:00"

    def get(self):
        return self._value

    def created_at(self):
        return self._created_at
```

```python
wrapped = TimestampedValue(42)
print(wrapped.get())
print(wrapped.created_at())
```

```
42
created_at
```

Wait — that's wrong. Let's actually run it to see what really happens:

```
42
2026-06-27T10:00:00
```

**Walkthrough:** `TimestampedValue` doesn't add behavior to `42` (you can't
— it's just a number) and doesn't translate any interface — it simply holds
the value alongside some extra information _about_ that value, and exposes
both through its own methods. This is the most general, least specific use
of "wrapping" — bundling a value together with context about it.

**SE lens — why even bother naming this if it's "just" a general term?**
Recognizing "this class is a wrapper" — even without it being specifically a
Proxy, Decorator, or Adapter — is still useful vocabulary. When you see a
class whose constructor takes one main object and stores it, and whose
methods mostly delegate to that stored object, "wrapper" is the accurate,
honest description, even before you've figured out (or even if it turns
out it doesn't matter) which more specific pattern it might also be.

### TypeScript

```typescript
class TimestampedValue<T> {
  private value: T;
  private createdAt: string;

  constructor(value: T) {
    this.value = value;
    this.createdAt = "2026-06-27T10:00:00";
  }

  get(): T {
    return this.value;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }
}
```

**Walkthrough — new syntax.** `class TimestampedValue<T>` — the `<T>` is a
**generic type parameter**. It declares that this class can wrap _any_
type, and `T` is a placeholder standing in for "whatever type you actually
use when you create one." When you write `value: T` inside the class,
you're saying "this property holds a value of whatever type `T` turns out
to be for this particular instance" — decided at the moment you create one.
This has no direct equivalent in Python, because Python's `__init__` would
happily accept any type for `value` with no declared restriction at all
(recall: Python checks types at runtime, not before). TypeScript's generics
let you say "this works with any type, but once you pick one, stay
consistent" — checked at compile time.

```typescript
const wrapped = new TimestampedValue<number>(42);
console.log(wrapped.get());
console.log(wrapped.getCreatedAt());
```

```
42
2026-06-27T10:00:00
```

**Walkthrough:** `new TimestampedValue<number>(42)` explicitly states that,
for this particular instance, `T` is `number`. From this point on, the
compiler knows `wrapped.get()` returns specifically a `number`, not just
"some value of unknown type" — and would reject, before running, any
attempt to use the result as if it were a `string` or anything else.

This is also a good place to see the compiler catch a real mistake:

```typescript
const wrapped2 = new TimestampedValue<number>("not a number");
```

```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**Walkthrough of the failure:** You declared `<number>`, promising this
particular wrapper holds a `number` — then tried to pass in a `string`
anyway. The compiler checked the declared type parameter against the
actual argument and rejected the mismatch immediately, without running
anything. This is the payoff of generics: the flexibility of "works with
any type" combined with the safety of "but it's still checked."

---

## Connect the pieces

All five patterns in this post share one shape: an object that sits in
front of, or around, another object. What distinguishes them is _purpose_,
not structure — Proxy controls _when_ and _whether_ access happens,
Decorator _adds_ behavior while preserving the original interface, Adapter
_translates_ between two incompatible interfaces, Facade _simplifies_
access to multiple objects behind one, and Wrapper is the general term
covering all of the above plus any other case where one object's main job
is holding and exposing another. In TypeScript, the `interface` keyword
made the contracts each of these patterns relies on explicit and checked at
compile time — in Python, the exact same contracts existed, just enforced
implicitly, discovered only at the moment a method is actually called.
Both languages can express every one of these patterns; TypeScript simply
makes you write the contract down.

## What breaks without these patterns

Without this vocabulary and these structures, the same problems still
exist — expensive resources still get loaded too eagerly, behavior still
needs to be added without breaking existing code, interfaces still
mismatch, subsystems are still complex to use directly — but the solutions
to them get reinvented ad hoc, inconsistently, every time, by every team,
with no shared name to communicate the design decision to someone else
reading the code later.

## Definition of done

- [ ] You can explain, in your own words, what distinguishes a Proxy from a
      Decorator from an Adapter from a Facade.
- [ ] You've run all five patterns in both Python and TypeScript and seen
      matching output.
- [ ] You've deliberately caused and read at least one TypeScript compiler
      error (the null-check one or the generic-type-mismatch one) and can
      explain what it caught and why Python wouldn't have caught the
      equivalent mistake until runtime, if at all.
- [ ] You can explain what an `interface` is in TypeScript and why
      `Coffee implements CoffeeLike` is checked, while Python's duck typing
      checks the equivalent requirement only when a method is actually
      called.
- [ ] You can explain what a generic type parameter (`<T>`) does and why
      `TimestampedValue<number>` is different from `TimestampedValue<string>`
      from the compiler's point of view.

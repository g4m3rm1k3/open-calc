# TypeScript Prerequisite 01: TypeScript Fundamentals

## What this post is for

This post is orientation, not mastery. Its job is to give you a mental
map of TypeScript's core ideas before you encounter them mid-concept in
the glossary posts. You will see every concept here again, re-taught in
depth, inside real pattern implementations. Read this once, get the shape
of things, and move on. The glossary does the actual teaching.

## What you need to know first

Basic Python — variables, functions, classes. This post teaches TypeScript
entirely through Python comparisons, because you already know what a
variable, a function, and a class *are* — the only new thing is how
TypeScript expresses those same ideas, and what it adds on top.

---

## Part 1: What TypeScript actually is

Python is an **interpreted** language — you write `python3 file.py` and
the Python interpreter reads and runs your code directly, line by line,
checking types as it goes, reporting errors only when a problematic line
is actually reached and executed.

TypeScript is a **compiled** language — or more precisely, a **transpiled**
one. You write `.ts` files, then run `tsc` (the TypeScript compiler) to
produce plain `.js` (JavaScript) files, and then run those with `node`
(Node.js, a program that runs JavaScript on your machine, outside a
browser). The TypeScript-specific syntax — all the type annotations — is
checked during compilation and then stripped out. The `.js` file that
results is pure JavaScript with no type annotations at all.

The workflow for every TypeScript file in this series:

```
npx tsc filename.ts
node filename.js
```

`npx` runs a tool (here, `tsc`) without a separate global install step.
`tsc filename.ts` reads the file, checks all the types, and — if
everything is valid — writes `filename.js`. If there's a type error, it
describes the problem and stops. `node filename.js` runs the compiled
output.

**The core promise TypeScript makes:** Python catches type errors at
runtime — at the exact line where something goes wrong, when the program
is already running. TypeScript catches them at compile time — before the
program runs at all, by reading and analyzing the code. A Python
`TypeError` you'd only discover by running your code and hitting that
specific branch is a TypeScript compile error you discover the moment you
save the file.

---

## Part 2: Variables — `const`, `let`, and type annotations

Python:

```python
name = "Alice"
age = 30
is_active = True
```

TypeScript equivalent:

```typescript
const name: string = "Alice";
const age: number = 30;
const isActive: boolean = true;
```

**`const` vs `let`:** TypeScript/JavaScript has two ways to declare a
variable. `const` declares a variable that cannot be *reassigned* after
its initial value — `name = "Bob"` after a `const` declaration is a
compile error. `let` declares a variable that *can* be reassigned.
Python has no direct equivalent of this distinction — every Python
variable can always be rebound to a new value. In TypeScript, `const` is
the strong default choice and you should reach for it whenever a variable
won't be reassigned; `let` is used only when reassignment is actually
needed.

**Type annotations — the `: string` part:** The colon followed by a type
name after a variable (or parameter, or return value) is a **type
annotation** — you're explicitly declaring what type this variable is
allowed to hold. TypeScript will reject, at compile time, any attempt to
assign a value of the wrong type.

**Type inference — when you don't need to write it:** TypeScript is smart
enough to figure out the type in many cases just from context:

```typescript
const name = "Alice";
```

Here, TypeScript *infers* that `name` is a `string` because `"Alice"` is
a string literal — you don't need to write `: string` explicitly. Type
inference means TypeScript code often looks almost as clean as plain
JavaScript while still being fully type-checked underneath. You'll see
both forms in the glossary posts — explicit annotations when clarity helps,
inferred types when they're obvious from context.

**Primitive types:** The basic types you'll see constantly:

| TypeScript type | Python equivalent | Holds |
|---|---|---|
| `string` | `str` | Text: `"hello"` |
| `number` | `int` / `float` | Any number: `42`, `3.14` |
| `boolean` | `bool` | `true` or `false` (lowercase in TS) |
| `null` | `None` | Explicit "no value" |
| `undefined` | *(no direct equivalent)* | "never set" — distinct from `null` |

**`null` vs `undefined`:** Python has only `None`. TypeScript/JavaScript
has both `null` (explicitly set to mean "no value") and `undefined`
(a variable or property that was declared but never given any value at
all). In practice in this series you'll mostly interact with `null`, and
the distinction mostly matters when dealing with object properties and
function return values that were never set.

---

## Part 3: Functions

Python:

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

TypeScript:

```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

**Differences to notice:**

- `function` keyword instead of `def`
- Parameter types written *after* the parameter name with a colon:
  `name: string` instead of `name: str`
- Return type written *after* the closing parenthesis with a colon:
  `: string` instead of `-> str`
- Curly braces `{ }` define the body instead of indentation — indentation
  is stylistic in TypeScript (the braces are what actually defines the
  block)
- Template literals use backticks `` ` `` and `${}` instead of `f""` and
  `{}` — identical idea, different syntax

**Arrow functions:** TypeScript/JavaScript has a second, shorter function
syntax you'll see constantly, especially for short, inline functions:

```typescript
const square = (n: number): number => n * n;
```

`(n: number): number => n * n` is an **arrow function**: parameters in
parentheses, a colon with the return type, then `=>`, then the expression
to return. For single-expression functions like this, no `return` keyword
and no curly braces are needed — the expression's value is returned
automatically. For multi-line bodies, curly braces and an explicit
`return` are needed:

```typescript
const greetLong = (name: string): string => {
  const message = `Hello, ${name}!`;
  return message;
};
```

Arrow functions in TypeScript/JavaScript are like Python's `lambda`, but
without Python's restriction to a single expression — they can be as long
as needed. You'll see them constantly as inline callbacks, as values stored
in variables, and anywhere a short function needs to be expressed quickly.

---

## Part 4: Interfaces — describing the shape of an object

Python has no direct equivalent of this. In Python, if you expect a
function's argument to be "an object with a `.draw()` method," you just
write the function and rely on duck typing — Python checks whether the
method actually exists only when you try to call it. If the method is
missing, you get an `AttributeError` at runtime.

TypeScript's `interface` lets you describe that expectation *explicitly*
and have it checked *before* the program runs:

```typescript
interface Shape {
  draw(): void;
  area(): number;
}
```

**Reading this:** `interface Shape` declares a named contract — any object
claiming to be a `Shape` must have a `draw` method (taking no arguments,
returning nothing — `void` means "no return value") and an `area` method
(taking no arguments, returning a `number`). The interface has no
implementation — no actual code, just declarations of what must exist.

A class *implements* an interface by declaring it explicitly:

```typescript
class Circle implements Shape {
  constructor(public radius: number) {}

  draw(): void {
    console.log(`Drawing circle with radius ${this.radius}`);
  }

  area(): number {
    return Math.PI * this.radius * this.radius;
  }
}
```

`class Circle implements Shape` is a promise to the compiler: "this class
will provide everything `Shape` requires." If `area()` were missing or
returned a `string` instead of a `number`, `tsc` would tell you
immediately, by name, exactly which part of the contract was unmet —
before the program ever ran.

**Why this matters:** In Python's duck typing world, you discover "this
object doesn't have the method I expected" only when you actually call it
at runtime, possibly deep in a real execution path. TypeScript's interfaces
move that discovery to compile time, where the error message is precise
and immediate, not a traceback from a running program.

---

## Part 5: Classes

Python:

```python
class BankAccount:
    def __init__(self, owner: str, balance: float = 0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount: float) -> None:
        self.balance += amount
```

TypeScript:

```typescript
class BankAccount {
  owner: string;
  balance: number;

  constructor(owner: string, balance: number = 0) {
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}
```

**Differences to notice:**

- Properties must be *declared* at the top of the class body with their
  types (`owner: string; balance: number;`) — Python just creates them
  inside `__init__` without a separate declaration step
- `constructor` instead of `__init__`
- `this` instead of `self` — and unlike Python's `self`, `this` is *not*
  an explicit parameter in the method signature; it's implicit
- Access modifiers — `public`, `private`, `readonly`:

```typescript
class BankAccount {
  public owner: string;
  private balance: number;

  constructor(owner: string, balance: number = 0) {
    this.owner = owner;
    this.balance = balance;
  }

  deposit(amount: number): void {
    this.balance += amount;
  }
}
```

`public` means accessible from anywhere (this is the default — writing
`public` explicitly is optional but sometimes done for clarity). `private`
means accessible only from within this class — the compiler will reject
any attempt to read or write `balance` from outside `BankAccount`. Python
has no enforced equivalent — the `_` prefix convention signals "don't
touch this" but the language itself won't stop you.

**Constructor shorthand:** TypeScript has a shortcut that declares
*and* initializes a property in one step, right in the constructor
parameter list:

```typescript
class BankAccount {
  constructor(
    public owner: string,
    private balance: number = 0
  ) {}
}
```

`public owner: string` in the constructor parameter list automatically
creates a `public` property called `owner` and assigns the argument to it
— no separate `this.owner = owner` line needed. This is purely a
convenience shorthand; it compiles to the same thing as the longer form.
You'll see this constantly in the glossary posts, and it can look
surprising the first time — a constructor that appears to have an empty
body `{}` but is actually setting up properties through its parameters.

---

## Part 6: Union types and null safety

One of TypeScript's most practically useful features is its handling of
`null`:

```typescript
function findUser(id: number): User | null {
  // might return a User, might return null
}
```

`User | null` is a **union type** — the `|` reads as "or": this function
returns either a `User` or `null`. TypeScript tracks this through your
code: if you try to call a method on the result without checking for
`null` first, the compiler refuses:

```typescript
const user = findUser(42);
user.name;  // compile error: Object is possibly 'null'
```

The fix — check first:

```typescript
const user = findUser(42);
if (user !== null) {
  user.name;  // fine — TypeScript knows it's not null here
}
```

After the `if` check, TypeScript **narrows** the type from `User | null`
to just `User`, because the `null` case was handled. This is called **type
narrowing** and it's one of TypeScript's genuinely clever features — it
tracks what you've checked and updates what it knows about a type as a
result.

Two related operators for dealing with nullable values gracefully:

**Optional chaining `?.`:** "access this property/method, but only if the
value isn't null/undefined — otherwise just give me `undefined`":

```typescript
const name = user?.name;  // undefined if user is null, user.name otherwise
```

**Nullish coalescing `??`:** "use the left side if it's not null/undefined,
otherwise use the right side as a fallback":

```typescript
const name = user?.name ?? "Anonymous";  // "Anonymous" if user is null
```

Python has no direct equivalent of either — Python's `None` checks are all
manual `if x is not None:` blocks. TypeScript's `?.` and `??` are
convenience shorthand for the same pattern, built into the language.

---

## Part 7: `readonly`

Python's closest equivalent to immutable object fields is either the
`@property` decorator (which requires writing a getter method) or
`@dataclass(frozen=True)` (which freezes the whole object). TypeScript
has a single keyword:

```typescript
class Coordinate {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {}
}

const point = new Coordinate(40.7, -74.0);
point.latitude = 41.0;  // compile error: Cannot assign to 'latitude'
                        // because it is a read-only property
```

`readonly` means "set once, in the constructor, never again." The compiler
enforces this before the program ever runs — in Python, you'd only
discover the violation at the line that tried to set the frozen field,
when the program was already executing.

---

## Connect the pieces

TypeScript is, underneath, just JavaScript — and JavaScript is, underneath,
just a dynamically typed scripting language similar in spirit to Python.
TypeScript's contribution is a layer of static type checking *on top of*
that, checked before the program runs and then stripped away, leaving
plain JavaScript. The syntax differences from Python are mostly
mechanical: `const`/`let` instead of bare assignment, `: type` annotations
on everything, `interface` for explicit contracts, curly braces instead of
indentation for blocks, `this` instead of `self`. The *concepts* —
variables, functions, classes, objects, methods — are identical to what
you already know. The *addition* — type annotations, interfaces, `private`,
`readonly`, compile-time null checking — is TypeScript's specific
contribution, and you'll see each piece of it do real, useful work in
every glossary post that follows.

## Definition of done

This is an orientation post, not a mastery post. The bar is recognition,
not recall:

- [ ] You can set up and run a TypeScript file with `npx tsc` + `node`.
- [ ] You can read a function signature like
      `function greet(name: string): string` and say what each part means.
- [ ] You can read an `interface` declaration and explain what it
      promises.
- [ ] You recognize the constructor shorthand
      `constructor(private balance: number)` as "declares and initializes
      a private property."
- [ ] You know what `|` means in `User | null` and why TypeScript requires
      a null check before accessing properties on that type.
- [ ] You can read `?.` and `??` and roughly describe what each does.
- [ ] You understand why TypeScript catches certain errors before Python
      would.

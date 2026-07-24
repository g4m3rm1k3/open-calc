# C# From Scratch — For Python/JavaScript Programmers

**Who this is for:** you know Python and some JavaScript, and nothing
here assumes Java. Where Java does something relevant, it's a small
side note in its own line — never the main explanation. This replaces
the earlier "diff from Java" file; that framing was the wrong starting
point for you.

**Unverified caveat, same as before:** no C# compiler exists in this
sandbox and I can't install one, so every "Predicted:" output block is
a careful guess, not a run result. Verify in Visual Studio; tell me if
anything's wrong and I'll fix it here.

---

## The Big Picture First: Two Real Paradigm Shifts

Skip past this section and everything below will feel like arbitrary
extra ceremony. Read it first and most of what follows is just "oh,
that's the syntax for the thing I already understand why we need."

### Shift 1: Nothing runs outside a method, and every method lives inside a class

In Python, this is a complete, runnable program:

```python
print("Hello")
```

In JavaScript, same thing:

```javascript
console.log("Hello");
```

In C#, the equivalent, in full:

```csharp
class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello");
    }
}
```

**This is not C# being needlessly verbose for no reason — it's a real
structural rule:** in C#, a statement can only exist inside a *method*,
and a method can only exist inside a *class* (or a couple of
class-like things you'll meet later). There is no such thing as a
"loose" top-level statement or function floating outside any class, the
way `print("Hello")` floats freely at the top of a Python file. Every
single line of executable code you will ever write in C# is inside some
method, which is inside some class.

Breaking down the skeleton above, piece by piece, since nothing here
should be assumed:

- `class Program` — declaring a class named `Program`. The name is
  arbitrary — could be anything — this is just the conventional name
  for "the class that happens to hold the starting point."
- `static void Main(string[] args)` — a method named `Main`, and this
  exact name and shape is *not* arbitrary: it's how the C# runtime
  knows where to start executing your program, the same role
  Python gives implicitly to "whatever's at the top of the file that
  gets run" and JS gives to "whatever script tag or entry file runs
  first." `static` means this method can be called without first
  creating an object (there's nothing to create an object *from* yet —
  your program hasn't started). `void` means this method returns
  nothing. `string[] args` holds command-line arguments, if any were
  passed — usually empty, rarely touched when you're starting out.
- `Console.WriteLine("Hello")` — C#'s `print`/`console.log`. `Console`
  is a built-in class; `WriteLine` is a method on it.

**Predicted output:**
```
Hello
```

Visual Studio's "New Project" templates generate this skeleton for
you automatically — you won't type it from scratch every time — but
now you know what every piece of it actually means instead of treating
it as boilerplate to not look at.

### Shift 2: types are fixed and checked before your program ever runs

In Python:

```python
x = 5
x = "now I'm a string"  # totally fine, Python doesn't care
```

In JavaScript, same freedom:

```javascript
let x = 5;
x = "now I'm a string"; // also fine
```

In C#:

```csharp
int x = 5;
x = "now I'm a string"; // does not compile
```

**Predicted (compile error):**
```
Program.cs(2,5): error CS0029: Cannot implicitly convert type 'string' to 'int'
```

Every variable in C# has a type, declared once, and the compiler
enforces it — this variable *is* an `int`, permanently, for its entire
life. This isn't a suggestion or a type hint the way `x: int` is in
modern Python (which Python itself doesn't enforce at all) — the
program simply will not compile if you violate it. This is the single
biggest daily-experience difference coming from either Python or JS:
**a whole category of bugs (passing the wrong type somewhere) gets
caught before the program ever runs, instead of surfacing as a crash
mid-execution, or never surfacing at all if that code path doesn't
happen to run during testing.**

The tradeoff, stated honestly: you write more upfront (every variable,
parameter, and return value needs a stated type) in exchange for the
compiler catching more for you. Neither language is "wrong" — they're
optimizing for different things.

**Small syntax note, easy to trip on:** every statement ends in a
semicolon, and blocks are delimited with `{ }`, not indentation.
Indentation is still expected for readability, but it's cosmetic —
the compiler only cares about the braces. Python's indentation is
load-bearing; C#'s is not. (JavaScript sits in between — semicolons are
technically optional there due to automatic insertion; in C# they are
never optional.)

---

## Variables and Basic Types

```csharp
int age = 30;
double price = 19.99;
string name = "Alex";
bool isActive = true;
```

Direct equivalents to Python's `int`/`float`/`str`/`bool` and JS's
`number`/`string`/`boolean` — except each one is now a fixed,
compiler-checked type, per the shift above. One extra piece C#
gives you:

```csharp
var age = 30; // compiler infers this is an int, from the value on the right
```

`var` still means a fixed, checked type underneath — `age` is
permanently an `int` here, same as if you'd written `int age = 30;` —
the compiler just figures out *which* type from context instead of you
spelling it out. This is closer to how it *feels* to write Python or
`let` in JS, but the enforcement underneath is identical to writing the
type explicitly. It's a readability choice, not a return to Python/JS's
actual flexibility.

---

## Control Flow — Familiar Logic, C-Style Punctuation

```csharp
int score = 85;

if (score >= 90)
{
    Console.WriteLine("A");
}
else if (score >= 80)
{
    Console.WriteLine("B");
}
else
{
    Console.WriteLine("C");
}
```

Same logic as Python's `if`/`elif`/`else`, with two syntax differences:
parentheses around the condition are required (Python doesn't use
them; JS does, so this one's already familiar from JS), and `{ }`
braces mark the block instead of Python's colon-plus-indentation.

**Loops** — this is where Python's syntax diverges the most:

```csharp
// C-style counting loop
for (int i = 0; i < 5; i++)
{
    Console.WriteLine(i);
}

// looping over a collection - this is C#'s equivalent of
// Python's "for x in list" and JS's "for (const x of list)"
List<string> tools = new List<string> { "Wrench", "Hammer", "Drill" };
foreach (string tool in tools)
{
    Console.WriteLine(tool);
}
```

`foreach` is the one to reach for whenever you'd write `for x in
some_list` in Python — the classic `for (int i = 0; ...)` form is for
when you specifically need the index/counter itself, same distinction
Python draws between `for x in items` and `for i in range(len(items))`.

---

## Methods (Functions) — Every Parameter and Return Type Is Declared

```csharp
static int Add(int a, int b)
{
    return a + b;
}
```

Compare to Python's `def add(a, b): return a + b` or JS's `function
add(a, b) { return a + b; }` — same idea, but every parameter's type
and the return type are stated explicitly, enforced the same way
variable types are. Pass a `string` where `Add` expects an `int` and it
won't compile, where Python would happily try and fail (or not fail) at
runtime instead.

**Important, connecting back to Shift 1:** a "function" in C# is always
a *method* — it lives inside some class, always. There's no bare
`function` keyword floating at file scope the way there is in
JavaScript.

---

## Classes and Objects

You already know classes from both languages, so this is mostly
syntax, with real differences flagged.

```csharp
class Dog
{
    public string Name;

    public Dog(string name)
    {
        Name = name;
    }

    public void Bark()
    {
        Console.WriteLine($"{Name} says Woof!");
    }
}

Dog rex = new Dog("Rex");
rex.Bark();
```

**Predicted output:**
```
Rex says Woof!
```

- The constructor is a method with the *same name as the class* — no
  `__init__` (Python), no `constructor` keyword (JS). `Dog(string
  name)` just is the constructor, by virtue of sharing the class's
  name.
- No `self` (Python) or implicit `this` binding weirdness (JS) to think
  about for a plain field assignment — `Name = name;` just works,
  referring to the object's own field, because inside a method, an
  unqualified name always means "this object's version" unless a local
  variable shadows it (see the earlier `this.x = x;` explanation from
  the Java doc if that's still in your folder — same rule applies
  here, C# has `this` too, used the same way, just not required as
  often as Python's explicit `self`).
- `new Dog("Rex")` — object creation always uses `new`, same as JS,
  unlike Python's plain `Dog("Rex")`.
- `$"{Name} says Woof!"` — **string interpolation**, C#'s equivalent of
  Python's f-strings (`f"{name} says Woof!"`) and JS template literals
  (`` `${name} says Woof!` ``) — the `$` before the quote is what turns
  on `{ }` substitution, the same role Python's `f` prefix plays.

**One real, important difference from both Python and JS: no duck
typing.** In Python, if an object has a `.bark()` method, you can call
it, regardless of what class it claims to be. In C#, `rex` is *declared*
as type `Dog`, and the compiler only lets you call methods that `Dog`
is actually known to have — checked before the program runs, same
static-typing theme as everything above.

---

## Access Modifiers — Real Enforcement, Not a Convention

Python's `self._internal` and JS's `#internal` (modern private class
fields) are the closest equivalents — but Python's underscore is a pure
social convention (nothing stops outside code from touching it anyway),
and while JS's `#` *is* genuinely enforced by the runtime, C# goes
further with more granularity:

```csharp
class Wallet
{
    public int VisibleBalance;
    private int hiddenPin;
    internal int projectOnlyValue; // new to you - see below
}
```

- `public` — anyone, anywhere.
- `private` — only code inside `Wallet` itself. Closest to JS's `#field`.
- `internal` — anyone in the same compiled project. No Python or JS
  equivalent at all — both those languages only really have "everyone"
  or "convention-only privacy," nothing in between at the project
  level.

Leave the modifier off entirely on a class member, and it defaults to
`private` — the strictest option, unlike Python (no real restriction)
or JS (also public by default for normal fields).

---

## Properties — Look Like Fields, Actually Aren't

This one lands closer to home for you than it would for a Java person,
because **JavaScript already has this exact feature** — `get`/`set`
accessors in a class:

```javascript
class Wallet {
  #balance = 0;
  get balance() { return this.#balance; }
  set balance(value) { this.#balance = value; }
}
```

C#'s version:

```csharp
public class Wallet
{
    public int Balance { get; set; }
}

Wallet w = new Wallet();
w.Balance = 100;
Console.WriteLine(w.Balance);
```

**Predicted output:**
```
100
```

Same underlying idea as the JS version above: `w.Balance = 100` *looks*
like direct field access but is secretly running a setter method. `{
get; set; }` is shorthand C# offers when you don't need custom logic in
the getter/setter — write it out longhand only when you actually need
to validate or transform the value on the way in or out, same as you'd
do in the JS version's `set balance(value) { ... }`.

---

## `static` — You Already Have This in Both Languages

Python: `@staticmethod` and `@classmethod`. JavaScript (since ES2022):
a real `static` keyword on class members, syntactically almost
identical to C#'s.

```csharp
class Counter
{
    public static int TotalCreated = 0;
    public Counter() { TotalCreated++; }
}

Counter a = new Counter();
Counter b = new Counter();
Console.WriteLine(Counter.TotalCreated);
```

**Predicted output:**
```
2
```

`TotalCreated` belongs to the class itself — one shared value, not one
per object — read off the class name (`Counter.TotalCreated`), same as
JS's `Counter.totalCreated` would be. If JS's `static` keyword already
makes sense to you, this section is done — the two are essentially the
same feature.

---

## `readonly` and `const`

- `const int MaxAttempts = 3;` — value must be known at compile time,
  can never change. Closest Python analogy: nothing real (Python has no
  true constants). Closest JS analogy: `const`, **except JS's `const`
  only prevents *reassigning the variable* — the object it points to
  can still be mutated** (`const arr = []; arr.push(1);` is legal in
  JS). C#'s `const` is stricter — it only works on values fixed at
  compile time in the first place (numbers, strings, not objects built
  at runtime).
- `readonly int instanceId;` — can be set once, in the constructor,
  then never again — this is the one that behaves like you'd *want*
  JS's `const` to behave on an object field, and doesn't quite exist in
  either Python or JS as a field-level guarantee.

---

## Inheritance — and the Rule Most Likely to Surprise You

```csharp
class Animal
{
    public virtual string MakeSound() => "...";
}

class Dog : Animal
{
    public override string MakeSound() => "Woof";
}
```

`:` for inheritance (not `extends` — that's Java, not relevant to your
background either). The real content here, genuinely new versus both
your languages: **Python and JavaScript both let a subclass override a
method just by redefining it — no special keyword needed, ever.** C#
requires **both** sides to opt in explicitly: the base method must say
`virtual`, and the subclass method must say `override`. Miss either one
and the "override" silently doesn't happen the way you'd expect —
calling the method through a variable typed as the base class calls
the *base* version, even if the actual object is a subclass:

```csharp
class Animal
{
    public string MakeSound() => "..."; // no "virtual"
}

class Dog : Animal
{
    public new string MakeSound() => "Woof"; // "new", not "override"
}

Animal creature = new Dog();
Console.WriteLine(creature.MakeSound());
```

**Predicted output:**
```
...
```

Even though `creature` really is a `Dog` at runtime, this prints the
*base* class's version — because C# decided this without `virtual`/
`override`, based on the variable's *declared* type, not the object's
*actual* type. This has no equivalent gotcha in Python or JS at all —
both those languages would print `"Woof"` here without a second
thought. **This is the one thing in this entire document worth
deliberately breaking on purpose in Visual Studio, just to see it for
yourself** — it's the single most likely place old habits produce a
real, silent bug.

---

## Interfaces — Genuinely New, No Direct Python or JS Equivalent

Python's closest cousin is `abc.ABC` (abstract base classes) — real,
but rarely used day-to-day; duck typing does this job informally, most
of the time, with no compiler check at all. JavaScript has nothing
built in — TypeScript adds `interface`, plain JS has no equivalent
whatsoever.

```csharp
interface IFlyer
{
    void Fly();
}

class Bird : IFlyer
{
    public void Fly() => Console.WriteLine("Flapping wings");
}

class Airplane : IFlyer
{
    public void Fly() => Console.WriteLine("Jet engines");
}

List<IFlyer> flyers = new List<IFlyer> { new Bird(), new Airplane() };
foreach (IFlyer f in flyers)
{
    f.Fly();
}
```

**Predicted output:**
```
Flapping wings
Jet engines
```

**The actual problem this solves, for you specifically:** in Python,
you'd informally trust that anything passed to a function "probably
has a `.fly()` method," with nothing checking that until it either
works or throws `AttributeError` at runtime. `IFlyer` makes that trust
a **compiler-enforced promise** instead of an assumption — `Bird` and
`Airplane` share no code and no common ancestor beyond the most basic
object type, only a guarantee about what methods they both provide,
checked before the program runs. This is the compiled-language answer
to duck typing: instead of "if it walks like a duck, treat it like
one, and find out if you were wrong at runtime," it's "declare, up
front, exactly which duck-shaped things are allowed here, and let the
compiler reject anything that doesn't qualify."

---

## Generics — The Compiler-Checked Version of "a List of Anything"

```python
things = [1, "two", 3.0]  # Python: totally fine, mixed types, no complaint
```

```csharp
List<int> things = new List<int> { 1, 2, 3 };
// things.Add("two"); // does not compile
```

Python's `list` (and JS's `Array`) hold anything, mixed freely, with no
complaint until something breaks *at the point of use* — calling
`.upper()` on what turns out to be an integer, discovered only when
that specific line actually runs. `List<int>` is a compile-time promise
that *this specific list* only ever holds `int`s, checked the moment
you try to violate it, not whenever that code path happens to execute
in production. `<int>` is called a **type parameter** — same concept
Python's optional type hints (`List[int]`) gesture at, except Python's
hints are pure documentation, never enforced by the language itself;
C#'s version is a real, compiler-checked guarantee.

---

## Casting and Type Checks

```csharp
object mystery = "a real string";

if (mystery is string realString)
{
    Console.WriteLine(realString.ToUpper());
}
```

**Predicted output:**
```
A REAL STRING
```

Python's `isinstance(mystery, str)` and JS's `typeof mystery ===
"string"` are the closest equivalents for the *check*. `object mystery`
declares the most general possible type — deliberately vague, the way
every Python/JS variable always is by default — and `is string
realString` both checks *and* creates a properly-typed variable
(`realString`) in one step, usable only inside that `if` block.

---

## Lambdas — This One's Already Almost Yours

```javascript
const add = (a, b) => a + b;
```

```csharp
Func<int, int, int> add = (a, b) => a + b;
Console.WriteLine(add(2, 3));
```

**Predicted output:**
```
5
```

The `(a, b) => ...` syntax is nearly identical to JS's arrow functions
— genuinely one of the smallest gaps in this whole document if you're
coming from JS. The real difference: C# needs a declared *type* for
what kind of function `add` is — `Func<int, int, int>` reads as "a
function taking two `int`s, returning an `int`" (the last type
parameter is always the return type). Python's `lambda a, b: a + b` is
close too, but Python restricts a lambda to a single expression — no
statements, no multi-line bodies — a real limitation C# doesn't share
(a C# lambda can have a full `{ }` block body when needed).

---

## Attributes — Not Python's Decorators, Despite Looking Similar

```python
@staticmethod
def helper(): ...
```

```csharp
[Obsolete("Use NewMethod instead")]
public void OldMethod() { }
```

**The `@`-vs-`[ ]` syntax looks like a direct match, but the mechanism
underneath is genuinely different, and this is worth being precise
about:** a Python decorator is real, executable code — it runs at the
moment the class body executes, and can actually transform or replace
the function it's attached to. A C# attribute does *nothing* on its
own — it's inert metadata, sitting there until some separate piece of
code (the compiler, a serializer, a test runner) explicitly goes
looking for it and decides to act. `[Obsolete]` only produces a warning
because the *compiler* specifically checks for it; a made-up
`[MyRandomAttribute]` with nothing reading it would compile and run
identically whether present or not — unlike a Python decorator, which
always executes.

---

## Exceptions — Nearly Identical to Both Languages

```csharp
string[] inputs = { "12", "not a number", "45" };

foreach (string input in inputs)
{
    try
    {
        int parsed = int.Parse(input);
        Console.WriteLine($"{input} parsed as: {parsed}");
    }
    catch (FormatException e)
    {
        Console.WriteLine($"{input} is not a valid number");
    }
}
```

**Predicted output:**
```
12 parsed as: 12
not a number is not a valid number
45 parsed as: 45
```

`try`/`catch` maps directly onto Python's `try`/`except` and JS's
`try`/`catch` — genuinely one of the smallest gaps in this whole
document, no real surprises waiting here.

---

## Null Handling — C# Has Tools Python Lacks, and JS Already Has

This section didn't exist in the earlier version of this lesson at
all — worth including on its own, since it's a real everyday feature.

```javascript
const name = user?.profile?.name ?? "Unknown";
```

```csharp
string name = user?.Profile?.Name ?? "Unknown";
```

If you know modern JavaScript's `?.` (optional chaining) and `??`
(nullish coalescing), **C# has the identical two operators, spelled
identically.** `user?.Profile` means "if `user` is `null`, stop right
here and the whole expression is `null` — don't even try `.Profile`
and crash." `?? "Unknown"` means "if everything up to here came out
`null`, use this fallback instead." Python has no direct equivalent to
either — the closest is a manually written `getattr(user, "profile",
None)` chain, considerably more verbose and easy to get wrong.

One more C#-specific piece: value types like `int` can't normally be
`null` at all (unlike Python, where any variable can be `None`, and JS,
where any variable can be `null`/`undefined`) — C# gives you an
explicit opt-in, `int? maybeAge = null;`, rather than every `int`
silently being nullable all the time.

---

## Closing

### Connect the pieces

The paradigm shift at the top — everything lives in a class, types are
fixed and checked before anything runs — explains almost every syntax
choice below it. Properties, `static`, lambdas, and null-handling will
feel closest to home, since JS already has near-identical features.
Interfaces and generics are the two genuinely new ideas with no real
Python or JS equivalent — worth spending the most deliberate practice
time there. The `virtual`/`override` rule under Inheritance is the one
actual trap: everything else here is "new syntax for a concept you
already have," but that one is a real behavioral difference, not just
new punctuation.

### What to verify yourself, in priority order

1. The `virtual`/`new` example — confirm which version of `MakeSound()`
   actually prints, and sit with why.
2. The static-typing compile error under "Shift 2" — watch the actual
   compiler message Visual Studio gives you.
3. Everything else, in any order — lower risk of a silent surprise.

### Exercises

- Write a Python function and its C# equivalent side by side for the
  same small task (e.g., filtering a list of numbers), and circle every
  place C# required a type annotation that Python didn't.
- Take the `IFlyer` example and add a third class, `Superhero`, that
  also implements `IFlyer` — confirm you didn't have to touch `Bird`,
  `Airplane`, or the `foreach` loop at all.
- Deliberately trigger the "does not compile" case from the Generics
  section (`things.Add("two");`) and read the actual compiler error
  Visual Studio shows you.

### Definition of done

- [ ] Ran every code block yourself in Visual Studio and compared real
      output against what's predicted here.
- [ ] Can explain, without looking back, why a plain `print("hi")`
      doesn't work in C# the way it does in Python.
- [ ] Found the `virtual`/`new` behavior genuinely surprising the first
      time you saw it run — if not, re-read that section.
- [ ] Can name which C# features here already felt familiar from
      JavaScript specifically (lambdas, `static`, `?.`/`??`, `get`/`set`).
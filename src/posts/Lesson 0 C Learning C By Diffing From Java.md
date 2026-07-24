# Lesson 0 (C#): Learning C# By Diffing From Java

**What this is:** the C# counterpart to your Java "Lesson 0," covering
the same ground, concept for concept, in the same order — but written as
a *diff*. For each concept, you'll see what's identical, what's just a
syntax swap, and what's genuinely a different rule you have to learn
fresh. Where C# has no equivalent at all, or Java has something C#
doesn't, that's called out explicitly rather than skipped.

**Important caveat, read this first:** this sandbox has no C# compiler
and no network access to install one, so unlike every Java lab so far,
**nothing in this file has actually been run.** Every "Expected output"
block is a prediction based on the language spec, not a verified result.
Run each one yourself in Visual Studio — that's not optional homework,
it's the actual verification step this schema normally does for you
automatically. If anything doesn't match, tell me and I'll correct it.

---

## Namespaces and `using` — C#'s Version of `package` and `import`

Java's `package io.upskillos.pocketinventroy;` plus `import java.util.List;`
becomes, in C#:

```csharp
namespace PocketInventory;

using System.Collections.Generic;
```

**Same idea, one real difference:** Java's package name is *required* to
match the folder path exactly — the compiler checks this. C#'s
`namespace` is just a label; it does not have to match your folder
structure at all, though Visual Studio's default project templates
nudge you toward matching them anyway, out of convention, not
enforcement.

---

## Access Modifiers — The Same Four, Plus a Fifth You Haven't Seen

`public`, `private`, and `protected` mean exactly what they meant in
Java — checked by the compiler, not a convention.

The real differences:

- **The unmarked default is different.** In Java, a field with no
  modifier at all is package-private. In C#, a class *member* with no
  modifier defaults to **`private`** — the opposite default. Leaving
  off a modifier in C# is closer to writing `private` explicitly in
  Java than to writing nothing.
- **A fifth option exists: `internal`.** Visible to any code in the same
  *assembly* (roughly: the same compiled project/DLL) — no direct Java
  equivalent, since Java has no concept of "assembly" at all. Think of
  it as package-private's C# cousin, just scoped to the whole project
  instead of one folder.
- A **top-level class** with no modifier defaults to `internal` in C#
  (versus package-private in Java) — this is a separate default from
  the member-level one above, worth not conflating.

```csharp
class Wallet
{
    public int VisibleBalance;
    private int hiddenPin;
}
```

Attempting `wallet.hiddenPin = 1234;` from outside `Wallet` fails to
compile — same enforcement, same reasoning as the Java version.

---

## Properties — C# Has No Direct Java Equivalent Here

This is the biggest genuinely new concept in this file, not a syntax
swap. Java's convention for controlled field access is: write a private
field, then hand-write `getBalance()`/`setBalance(int)` methods (you'll
meet this properly as "Lesson 7" in your Java track). C# builds this
directly into the language as a **property**:

```csharp
public class Wallet
{
    public int Balance { get; set; }
    public int HiddenPin { get; private set; }
}
```

**What this actually is:** `Balance` looks like a public field at the
call site —

```csharp
Wallet w = new Wallet();
w.Balance = 100;
Console.WriteLine(w.Balance);
```

— but it is not one. `{ get; set; }` tells the compiler to generate a
hidden private backing field plus a getter and setter method, and to
let you call them using *field syntax* instead of `w.setBalance(100)`.
`HiddenPin { get; private set; }` means: anyone can *read* it, but only
code inside `Wallet` itself can *set* it — a asymmetry Java's plain
getter/setter methods can express too, just with more manual code (skip
writing `setHiddenPin` entirely, or mark it `private`).

**Expected output:**
```
100
```

**Why this exists, honestly:** Java's answer to "I want controlled
access that still reads like a field" is "write the boilerplate getter
and setter yourself, every time." C# decided that boilerplate was
common enough to build directly into the language. The real cost: code
that *looks* like direct field access is secretly running a method call
underneath — usually harmless, but worth knowing when you're debugging
and a "field" assignment turns out to have side effects.

---

## `static` — Same Concept, Same Keyword, One Capitalization Difference

Identical idea to Java: belongs to the class, not any one object, shared
across every instance. Even the entry-point method is the same shape,
just capitalized differently — C# capitalizes method names by
convention:

```csharp
public static void Main(string[] args)
{
    Counter a = new Counter();
    Counter b = new Counter();
    Console.WriteLine(Counter.TotalCreated);
}

class Counter
{
    public static int TotalCreated = 0;
    public Counter() { TotalCreated++; }
}
```

**Expected output:**
```
2
```

No conceptual difference from the Java version — file this one under
"syntax familiar, don't overthink it."

---

## `readonly` and `const` — Java's `final` Gets Split Into Two Keywords

Java's `final` covers four different things (variable, field, method,
class) with one keyword. C# splits the "value can't change" half into
two separate, more specific keywords:

- **`readonly`** — closest match to Java's `final` on a field: can be
  set in the constructor, never reassigned after.
- **`const`** — stricter: the value must be knowable *at compile time*
  (a literal, not something computed from a constructor argument), and
  it's implicitly `static` — there's no per-object `const`, only one
  shared value for the whole class.

```csharp
public class Config
{
    public const int MaxAttempts = 3;      // compile-time constant
    public readonly int InstanceId;        // set once, per object, in the constructor

    public Config(int id)
    {
        InstanceId = id;
    }
}
```

**Java's other two `final` meanings** (preventing a method from being
overridden, preventing a class from being subclassed at all) map to a
*different* C# keyword entirely: **`sealed`** —
`public sealed class Item { }` (no subclassing, ever) and, on a method,
`sealed override void Save() { }` (this override is the last one
allowed in the chain). Worth noticing this isn't a 1-to-1 rename — it's
genuinely a different keyword for a related-but-separate idea, which
ties directly into the next section.

---

## Inheritance — `:` Instead of `extends`, and the Opposite Default Philosophy

Syntax swap first: C# uses one colon for inheritance, no `extends`
keyword:

```csharp
class Animal { }
class Dog : Animal { }
```

**Now the actual, important difference — not cosmetic.** In Java, every
method is overridable by default; you have to opt *out* with `final`.
**C# is the reverse: no method is overridable by default.** You must
mark the base method `virtual`, and the subclass method `override`, or
polymorphism simply does not happen:

```csharp
class Animal
{
    public virtual string MakeSound() => "...";
}

class Dog : Animal
{
    public override string MakeSound() => "Woof";
}

class Program
{
    static void Main()
    {
        Animal generic = new Animal();
        Animal dog = new Dog();
        Console.WriteLine(generic.MakeSound());
        Console.WriteLine(dog.MakeSound());
    }
}
```

**Expected output:**
```
...
Woof
```

That part matches Java's behavior. Here's the genuine trap: **omit
`virtual`/`override`, and this silently compiles into something
different.**

```csharp
class Animal
{
    public string MakeSound() => "..."; // no virtual
}

class Dog : Animal
{
    public new string MakeSound() => "Woof"; // "new" - hiding, not overriding
}
```

**Expected output, calling through an `Animal`-typed variable holding a
`Dog`:**
```
...
```

Even though the object really is a `Dog`, `dog.MakeSound()` prints
`"..."` — the *base* version — because without `virtual`/`override`,
C# resolves the method call based on the **declared type of the
variable**, not the actual object's type, which is the opposite of
Java's rule (Java *always* calls the real, runtime type's version — see
your Java lesson's `InheritanceDemo`). `new` here doesn't create an
object — it's a separate keyword meaning "this method deliberately hides
the base one instead of overriding it," and the compiler will actually
warn you if you write a same-named method with neither `override` nor
`new`, precisely because this mistake is so easy to make coming from a
language (Java) where it can't happen.

**This is worth verifying yourself first, before anything else in this
file** — it's the single difference most likely to produce a real,
silent bug once you're writing C# by muscle memory built from Java.

**Why C# chose the opposite default, honestly:** every `virtual` method
has a small runtime cost (the call has to be resolved dynamically
instead of directly), and it locks the base class author into supporting
being overridden there forever, in a way that's hard to walk back
later without breaking subclasses. Requiring an explicit opt-in was a
deliberate design choice, not an oversight — the tradeoff is exactly the
`new`-vs-`override` trap above.

---

## Interfaces — Same Idea, One Colon Covers Both

Java separates `extends` (one class) from `implements` (many
interfaces). C# uses the *same* colon for both, in one list:

```csharp
interface IFlyer
{
    void Fly();
}

class Bird : Animal, IFlyer
{
    public override string MakeSound() => "Tweet";
    public void Fly() => Console.WriteLine("Flapping wings");
}
```

One class, one colon, base class and interfaces all in the same
comma-separated list — Java would need `extends Animal implements
IFlyer` as two separate keywords. The underlying rule is identical to
Java's: still only one base class ever, still as many interfaces as you
want. (Naming convention worth knowing: C# interfaces are conventionally
prefixed with `I` — `IFlyer`, not `Flyer` — a pure convention, not
enforced by the compiler, but followed almost universally.)

---

## Nested Classes — Same Mechanism, Opposite Default Visibility

```csharp
class Toolbox
{
    public class Wrench
    {
        public void Turn() => Console.WriteLine("Turning");
    }
}
```

Referenced from outside exactly like Java: `Toolbox.Wrench wrench = new
Toolbox.Wrench();`. **The difference:** a nested class in C# defaults
to `private` (invisible outside `Toolbox` entirely) unless you mark it
`public`, as done above. Java's nested classes default to
package-private — visible more broadly by default. Miss the `public`
here and `Toolbox.Wrench` simply won't compile from outside the file at
all.

---

## Generics — Same Syntax, a Real Runtime Difference Underneath

```csharp
List<string> names = new List<string>();
names.Add("Alice");
// names.Add(42); // won't compile - same compile-time check as Java
```

Looks identical to Java's `List<String>`. The difference is invisible at
this level but matters later: **Java erases generic type information at
runtime** — a running Java program genuinely cannot ask "is this
specifically a `List<String>`?" (only "is this a `List`?"). **C#
generics are reified — the real type argument is known at runtime**,
so `list is List<string>` and `typeof(T)` inside a generic method both
work for real in C#, where Java has no equivalent at all. You likely
won't hit this difference immediately, but it's the reason certain
patterns that are awkward workarounds in Java (checking a collection's
actual element type at runtime) are simple and direct in C#.

---

## Casting and Pattern Matching — C# Adds a Shortcut Java Only Recently Got

```csharp
object mystery = "a real string";

if (mystery is string realString)
{
    Console.WriteLine(realString.ToUpper());
}
```

**Expected output:**
```
A REAL STRING
```

Same underlying idea as Java's `instanceof` + cast, but **C#'s `is`
combines the check and the cast into one expression** — `mystery is
string realString` both tests the type *and* creates `realString` as
that type, only inside the `if` block, in one line. Your Java lesson's
two-step version (`instanceof` check, then a separate `(String) mystery`
cast) is the older style; Java added its own version of this same
shortcut in more recent versions, so this is a case where C# got there
first but the two languages have since converged.

---

## Lambdas — `=>` Instead of `->`

```csharp
Func<string, string> formal = name => "Good day, " + name;
Console.WriteLine(formal("Dr. Alvarez"));
```

**Expected output:**
```
Good day, Dr. Alvarez
```

Same core idea as Java's lambdas — a chunk of behavior assigned to a
variable — with `=>` instead of `->`. The real difference is what a
lambda's *target type* is allowed to be: Java requires a user-defined
functional interface (exactly one abstract method) every time. C#
usually targets one of two **built-in generic delegate types** instead
of a custom interface — `Func<TInput, TOutput>` (a lambda that returns a
value, shown above) or `Action<T>` (a lambda that returns nothing).
You can still define your own single-method interface in C# and target
that too, the same way Java requires — it's just not the default,
everyday choice the way it is in Java.

---

## Attributes — C#'s Annotations, Square Brackets Instead of `@`

```csharp
[Obsolete("Use NewMethod instead")]
public void OldMethod() { }
```

Identical underlying idea to Java's `@Something` — metadata attached to
code, inert on its own, read by the compiler, a tool, or a library. Only
the bracket syntax differs (`[Attribute]` instead of `@Attribute`). Same
honest caveat from your Java lesson applies without modification: an
attribute does nothing by itself; something has to actually go looking
for it (the compiler, for `[Obsolete]`; ASP.NET's routing system, for
`[HttpGet]`; a serializer, for `[JsonProperty]`).

---

## Exceptions — The Single Biggest Simplification Coming From Java

Your Java lesson spent real effort on the checked-vs-unchecked
exception split. **C# has no checked exceptions at all — every
exception in C# behaves like Java's unchecked ones.** A method can
throw anything, of any type, without declaring it anywhere in its
signature, and no caller is ever compiler-forced to catch it.

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

**Expected output:**
```
12 parsed as: 12
not a number is not a valid number
45 parsed as: 45
```

Mechanically identical `try`/`catch` shape to Java (note `$"..."` — C#'s
string interpolation, roughly Python f-string equivalent, versus Java's
`+` concatenation). The entire "does the compiler force me to
acknowledge this failure" question from your Java lesson simply doesn't
exist in C# — one less category of ceremony to carry over.

---

## Constructors — Optional Parameters Replace Most Overloading

```csharp
class Point
{
    public int X;
    public int Y;

    public Point(int x = 0, int y = 0)
    {
        X = x;
        Y = y;
    }
}

Point origin = new Point();
Point custom = new Point(5, 10);
```

Your Java lesson's SE Lens asked, essentially, "why doesn't Java let you
just write default parameter values instead of multiple overloaded
constructors?" — **C# actually has this feature.** `int x = 0, int y =
0` means both parameters are optional; `new Point()` and `new Point(5,
10)` both work from this *one* constructor, no second overload needed.
C# still supports full overloading too (several constructors, different
parameter lists) for cases optional parameters can't express — but a lot
of what forced Java into overloading is a non-issue here.

Constructor chaining syntax also differs: where Java's `this(0, 0);` is
the first statement *inside* the constructor body, C# puts it *after*
the parameter list, before the body even opens: `public Point() :
this(0, 0) { }`.

---

## Value Types vs. Reference Types — `struct` Is the Real New Piece

The `int` vs. `Integer` split exists in C# too (`int` is a value type,
copied by value; every value type has a corresponding way to become
`null`-able — see below). The genuinely new C# concept: **you can
define your own value types**, using `struct` instead of `class`. Java
has no equivalent at all — every type you define yourself in Java is
always a reference type.

```csharp
struct Point3D
{
    public int X, Y, Z;
}
```

A `Point3D` variable copies its full contents on assignment, the same
way `int` does — never shares a reference the way a `class` instance
would. This matters for performance (small, simple data, copied often,
avoiding reference/heap overhead) but changes real behavior too — pass a
`struct` into a method and modify it there, and the caller's copy is
untouched, unlike passing a `class` instance.

One more difference worth naming: instead of Java's `Integer` wrapper
class for a nullable number, C# gives value types a direct nullable
form with `?`: `int? maybeMissing = null;` — legal, and checked with
`maybeMissing.HasValue` or a direct comparison to `null` — no separate
wrapper class needed.

---

## Closing

### Connect the pieces

Most of this file is C# wearing different punctuation over the exact
same ideas your Java lesson already gave you — `:` for `extends`, `=>`
for `->`, `[X]` for `@X`. The genuine new rules to actually remember,
not just relabel, are shorter than they look:

1. **Properties** — a language feature, not a convention, for what Java
   does by hand-writing getters/setters.
2. **`virtual`/`override` required** — the single most likely source of
   a real, silent bug if you carry Java habits over unexamined.
3. **No checked exceptions** — genuinely simpler, not a trap.
4. **`internal` and different default visibilities** — same spirit as
   Java's access control, different defaults underneath.
5. **`struct`** — a category of user-defined type Java doesn't have at
   all.

### What to actually verify yourself

Since none of this was run this session, prioritize confirming the
`virtual`/`new` example under Inheritance first — it's the one place a
wrong prediction from me would actually cost you a real bug later, not
just a wrong "expected output" line.

### Exercises

- Take your Java `AccessDemo` example and rewrite it in C#, including
  one `internal` field, and write one sentence on what `internal` would
  let you do that `private` wouldn't.
- Write a small class with both a plain public field and an equivalent
  property, and call both from another class — confirm the call syntax
  looks identical even though one is secretly a method pair.
- Deliberately reproduce the `virtual`/`new` trap above, run it, and
  confirm for yourself which version of `MakeSound()` actually printed.

### Definition of done

- [ ] You ran every code block in this file yourself, in Visual Studio,
      and confirmed the actual output against what's predicted here.
- [ ] You found the `virtual`/`new` example genuinely surprising the
      first time you ran it — if it wasn't surprising, re-read that
      section, since the whole point is that it silently differs from
      Java.
- [ ] You can explain, without looking back, what a property actually
      is underneath the field-like syntax.
- [ ] You can name at least one thing in this file that has zero Java
      equivalent (`struct` is the clearest candidate).
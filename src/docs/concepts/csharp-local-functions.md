# Concept: Local Functions

**What you'll understand by the end:** what a local function is (a
named function declared *inside* another function, or inside top-level
statements), how it differs from both a class method and a lambda
assigned to a variable, and specifically why it can be called before
its own textual declaration when a lambda-holding variable cannot.

**Prerequisites:** none beyond an ordinary method call.

## Setup

```
dotnet new console -o lab-local-functions
cd lab-local-functions
```

Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Some helper logic only ever makes sense next to the one place that
uses it — a small calculation used twice within a single method, say —
and doesn't need to be reachable from anywhere else in the class or
file. Making it a full, separate class method scatters it away from
its only caller and exposes it to every other method in the class,
whether or not that's actually wanted. A lambda assigned to a variable
is closer, but a variable declaration has its own rule — it must be
declared before anything uses it — which turns out to matter in
practice, shown below.

## The Isolated Example

**A function declared and called inside top-level statements, called
*before* its own declaration appears in the file:**

```csharp
Console.WriteLine(Add(2, 3));

int Add(int a, int b)
{
    return a + b;
}
```

**Real output — `dotnet run`:**
```
5
```

**What this proves:** the call to `Add(2, 3)` on the very first line
compiles and runs correctly even though `Add`'s own declaration
appears *after* that call in the source file. This is called a **local
function** — a named function declared inside another function (or, as
here, inside a file's top-level statements) rather than as its own
class member.

**A local function capturing a variable from its surrounding scope:**

```csharp
int taxRatePercent = 8;

int WithTax(int amount)
{
    return amount + (amount * taxRatePercent / 100);
}

Console.WriteLine(WithTax(100));
```

**Real output — `dotnet run`:**
```
108
```

**What this proves:** `WithTax` reads `taxRatePercent` directly, even
though `taxRatePercent` is a variable declared in the *surrounding*
scope, not a parameter `WithTax` was handed. A local function can see
and use every variable already in scope where it's declared, the same
way a lambda can.

**Now the contrast that matters — the same "call it early" attempt,
written as a lambda assigned to a variable instead of a local
function:**

```csharp
Console.WriteLine(WithTaxLambda(100));

int taxRatePercent = 8;
Func<int, int> WithTaxLambda = amount => amount + (amount * taxRatePercent / 100);
```

**Real output — `dotnet build`:**
```
Program.cs(4,19): error CS0841: Cannot use local variable 'WithTaxLambda' before it is declared
```

**What this proves:** a lambda is just a value, stored in an ordinary
local variable (`WithTaxLambda`) — and C# enforces, for every local
variable, that it can't be read before the line that declares it. A
local function is not a variable holding a value; it's a real,
named member the compiler processes across the whole enclosing method
(or top-level statement block) before generating code, which is
exactly why the first example's out-of-order call to `Add` was legal
while this one, with a lambda, is a compile error.

## Mechanical Walkthrough

- `int Add(int a, int b) { return a + b; }` — a **local function**
  declaration: a return type, a name, a parameter list, and a body,
  written with the exact same syntax as an ordinary method — the only
  difference is *where* it's declared: inside another function (or
  inside top-level statements) instead of directly inside a class.
- `Console.WriteLine(Add(2, 3))`, positioned *before* `Add`'s own
  declaration — legal specifically because local functions are not
  evaluated top-to-bottom the way ordinary statements are; the compiler
  registers every local function declared in a scope before checking
  any of the calls within that same scope, the same way it already
  does for a class's own methods.
- `int taxRatePercent = 8;` followed by `WithTax` reading
  `taxRatePercent` in its body — this is a **closure**: `WithTax`
  captures the surrounding variable by reference to the same storage,
  not by copying its value at declaration time. (If `taxRatePercent`
  were reassigned after `WithTax` was declared but before it was
  called, `WithTax` would see the new value — the same capturing
  behavior a lambda has.)
- `Func<int, int> WithTaxLambda = amount => ...;` — **not** a local
  function; this is an ordinary local variable, of delegate type
  `Func<int, int>`, whose *value* happens to be a lambda expression.
  Declaring it follows the exact same "must be declared before used"
  rule as any other local variable (`int x; Console.WriteLine(x);`
  before `x`'s declaration is the identical error, with nothing lambda-
  specific about it).
- `CS0841` — the specific compiler error produced by reading a local
  variable before the line that declares it, here triggered by the
  lambda-holding variable specifically because a variable, unlike a
  local function, has no existence at all until its declaration runs.

## CS Lens

A local function is a genuine third category, distinct from both of
the other two ways C# lets you package behavior: a **class method** is
a member of a type, reachable (subject to access modifiers) from
anywhere that has an instance or the type itself; a **lambda** is an
expression producing a value — a delegate — that happens to be
assignable to a variable, passed as an argument, or invoked directly,
but is still, at its core, a value like any other; a **local function**
is neither a type member nor a value — it's a named function scoped to
exactly the block that declares it, invisible outside that block, with
no variable or delegate object involved in calling it at all.

Also recognized in: JavaScript's function declarations (`function
add(a, b) { ... }`) inside another function, which are similarly
hoisted and callable before their textual position, in exact contrast
to a `const add = (a, b) => ...` arrow function assigned to a `const`,
which is not; Python's nested `def` inside another `def`, serving the
same "helper scoped to one function" purpose (though without C#'s
hoisting behavior — Python still requires the `def` to run before the
nested function is called).

## SE Lens

Why reach for a local function instead of just adding a private method
to the class? Because a local function makes its limited scope visible
directly in the code's structure, not just by convention — a private
method is still callable from every other method in the class, forever,
whether or not that was ever intended; a local function physically
cannot be called from anywhere outside the one method (or top-level
block) that declares it, so a reader never has to check the rest of the
class to know its full set of callers. The real cost: a local function
can't easily be unit-tested in isolation the way a class method can
(there's no way to call it directly from outside its enclosing
function), and if the same logic later turns out to be needed in a
second place, it has to be promoted into a real method or moved
somewhere shared — a local function is a deliberate bet that this
logic's usefulness stays confined to exactly where it's declared.

## Connection

Local functions commonly appear alongside closures over the enclosing
method's own parameters and local variables — the same capturing
behavior a lambda has, shown in this file's second example. They're a
frequent choice for a small, one-off helper used two or three times
within a single method (validating one piece of input several ways,
recursing on a private helper without exposing the recursive step as a
class member) where a full class method would expose more than the
method actually needs to expose.

## Try It Yourself

1. Declare a local function with no parameters and no return value
   (`void PrintHeader() { Console.WriteLine("---"); }`), call it twice
   from two different points in the same enclosing method, and confirm
   both calls run correctly.
2. Inside a local function, try to declare a second local function with
   the exact same name as one already declared in the *same* enclosing
   scope. Confirm the compiler rejects it, and compare the error to
   what happens if you instead declare two ordinary methods with the
   same name and different parameter lists on a class (legal —
   overloading) — local functions in the same scope don't support
   overloading by parameter list the way class methods do.
3. Write a local function that calls *itself* (recursion) to compute a
   factorial, and confirm it runs correctly — proving a local function
   can reference its own name in its own body, the same as any ordinary
   named method can.

# Lesson 06a: The Placeholder You Can Write Yourself

*(Prepended before Lesson 7 — see `CURRICULUM_NOTES.md`'s 2026-07-31
audit. Lesson 6 already named `List<T>`'s `T` a "generic type"
placeholder, in passing, and Lesson 1a briefly named `TKey`/`TValue` the
same way for `Dictionary<TKey, TValue>` — both as *users* of an
already-written generic type. This lesson proves the mechanism directly
and shows how to write one yourself — the exact tool a much later
lesson, 48, uses silently, with a `where T : DependencyObject`
constraint never explained until now.)*

**Developer Story**
> As a developer who has used `List<T>` and `Dictionary<TKey, TValue>`
> without ever writing a generic type myself, I want to understand what
> `<T>` really does, prove it catches a real mistake at compile time
> instead of at runtime, and understand what `where T : SomeType` adds.

**What you will build**
Nothing that survives — every example here is a throwaway lab, same as
every other prepended lesson. What you'll walk away with: a real,
tested reason generics exist at all (not just "so `List<T>` can hold
different types"), and the exact vocabulary a later lesson's own code
uses without explanation.

**What you need to know first**
Lesson 6: `List<T>`, "generic type" (briefly named). Lesson 0b:
`virtual`/`override`, inheritance basics needed for this lesson's second
unit.

**Terms introduced in this lesson:**
- **Generic type parameter (`<T>`)** — a placeholder for a real type,
  supplied when the generic class or method is actually used; the
  compiler treats every use of `T` inside the definition as "some type,
  not yet known, but consistent."
- **Type constraint (`where T : ...`)** — narrows a generic type
  parameter, promising the compiler `T` will always be *at least* the
  named type — unlocking access to that type's own members inside the
  generic code, at the cost of no longer accepting completely
  unrelated types.

**Objects and methods used**
- `Console.WriteLine` (Lesson 00a) and `List<T>` (Lesson 6) reappear in
  this lesson's own labs, already given full treatment — brief
  reminder only, per the Repetition Rule. Writing a generic type or
  method is this lesson's own subject, given full treatment below.

---

## Concept Unit: `Container<T>` — Catching a Mistake at Compile Time Instead of Runtime

### The Problem

A container holding "some one value, of some type, to be read back
later" is a genuinely reusable idea — but writing `ContainerOfInt`, `ContainerOfString`,
and a new one for every future type would duplicate identical code
every time. The obvious shortcut — one `Container` holding `object`, since
every type is an `object` — worth testing directly what that shortcut
actually costs.

### Introduce the Concept in Isolation
```bash
dotnet new console -o GenericsLab
```

Replace `Program.cs`:

```csharp
ContainerObject container = new ContainerObject();
container.Value = 42;

string text = (string)container.Value;
Console.WriteLine(text);

class ContainerObject
{
    public object? Value;
}
```

Run it:

```bash
dotnet run
```

Real, captured failure:

```text
Unhandled exception. System.InvalidCastException: Unable to cast object of type 'System.Int32' to type 'System.String'.
   at Program.<Main>$(String[] args) in Program.cs:line 4
```

*What this proves:* `ContainerObject.Value`, typed `object`, happily accepted
an `int` (`42`) — `object` accepts anything. The real cost only shows up
later, at the cast: `(string)container.Value` compiles cleanly (the compiler
has no way to know what's really inside an `object`) and then crashes
the running program with a real `InvalidCastException`. This mistake
was fully preventable, but nothing caught it until the program was
already running.

Now the same idea, generic instead:

```csharp
Container<int> intContainer = new Container<int>();
intContainer.Value = 42;
Console.WriteLine($"intContainer.Value: {intContainer.Value}");

Container<string> stringContainer = new Container<string>();
stringContainer.Value = "Hammer";
Console.WriteLine($"stringContainer.Value: {stringContainer.Value}");

class Container<T>
{
    public T? Value;
}
```

Real output:

```text
intContainer.Value: 42
stringContainer.Value: Hammer
```

Now try to reproduce the original mistake — assign an `int` into a
`Container<string>`:

```csharp
Container<string> stringContainer = new Container<string>();
stringContainer.Value = 42;
```

Real, captured failure:

```text
error CS0029: Cannot implicitly convert type 'int' to 'string'
```

#### Execution Trace

1. `Container<int> intContainer = new Container<int>()` — `T` is filled in as `int` for
   this specific instance; `intContainer.Value` really is typed `int`, not
   `object`.
2. `intContainer.Value = 42; Console.WriteLine($"intContainer.Value: {intContainer.Value}");`
   — no cast needed anywhere — `Value` was always genuinely `int`.
3. `Container<string> stringContainer = new Container<string>()` — a completely separate
   instantiation, `T` filled in as `string` this time; `stringContainer.Value`
   is genuinely `string`.
4. Attempting `stringContainer.Value = 42;` — the same mistake `ContainerObject`
   allowed silently — now fails immediately, at compile time, with a
   real `CS0029` error, because the compiler knows `T` is `string` for
   this specific `Container<string>` and `42` is not a `string`.

*What this proves:* `Container<T>` is one real class definition, reused for
`int`, `string`, or any other type — the identical code Lesson 6's own
`List<T>` glossary entry already described — and it converts the exact
mistake `ContainerObject` allowed to crash at runtime into a real compiler
error that never lets the program run at all. This is the actual reason
generics exist: not code reuse alone (`ContainerObject` reused code too), but
*type-safe* code reuse.

### Discard the Throwaway Example
Keep `GenericsLab` open — the type-constraint unit, next, reuses this
project.

### Mechanical Walkthrough

- `Container<T>` itself — **first appearance of writing your own generic
  type.** `<T>` is a placeholder, exactly as Lesson 6's own glossary
  named it for `List<T>` — the difference here is this project defines
  what `T` means, rather than only consuming a definition .NET already
  wrote.
- `public T? Value;` — a field typed as the placeholder itself; every
  real instantiation (`Container<int>`, `Container<string>`) replaces every `T`
  inside `Container`'s own body with that specific real type.
- Instantiating `Container` with `int` filled in for `T` — **first
  appearance of instantiating a self-written generic type**, the
  identical syntax shape `List<string>` (Lesson 6) already used, now on
  a type this project wrote itself.

### CS Lens

This is exactly why `List<T>` never needed a separate `ListOfInt`,
`ListOfString`, and so on: one real definition, `T` filled in at each
point of use, with the compiler enforcing that every use of a specific
`List<int>` genuinely only ever holds `int`s. `Container<T>`'s own real,
captured `CS0029` error is the concrete proof of the exact guarantee
`List<T>`'s glossary entry already claimed without demonstrating: "can
never accidentally receive" the wrong type.

### SE Lens

Why does this project's own real code — `InventoryItem`, `RelayCommand`,
`ItemRepository` (Lesson 50) — never define a generic type of its own,
despite generics clearly being useful? Because every one of those types
already has one specific, known job: `InventoryItem` always holds
inventory data, `ItemRepository` always talks to SQLite for
`InventoryItem`s specifically. Generics are the right tool exactly when
a type's *behavior* is identical regardless of *what* it holds — a box,
a list, a repository pattern reused across unrelated data types — not
when a type's whole reason to exist is being specific to one real
concept.

### Connection

`Container<T>` places no restriction on what `T` can be — it never needs to
call any member on the value it holds. The next unit needs to, and
proves what happens without a constraint, and what a constraint fixes.

---

## Concept Unit: `where T : ...` — Promising the Compiler More About `T`

### The Problem

A generic method that needs to *do* something with its `T` — not just
store and return it, but call a real member on it — runs into a
problem `Container<T>` never did: the compiler has no idea what members an
unconstrained `T` actually has.

### Introduce the Concept in Isolation

In the same `GenericsLab` project, replace `Program.cs`:

```csharp
void PrintName<T>(T item)
{
    Console.WriteLine(item.Name);
}

class Animal
{
    public string Name = "Generic Animal";
}
```

Run it:

```bash
dotnet run
```

Real, captured failure:

```text
error CS1061: 'T' does not contain a definition for 'Name' and no accessible extension method 'Name' accepting a first argument of type 'T' could be found (are you missing a using directive or an assembly reference?)
```

*What this proves:* `T`, with no constraint, could be *anything* —
`int`, `string`, a totally unrelated type — so the compiler correctly
refuses `item.Name`: nothing guarantees a `Name` member exists on
whatever `T` turns out to be.

Now the fix — a real constraint:

```csharp
void PrintName<T>(T item) where T : Animal
{
    Console.WriteLine(item.Name);
}

PrintName(new Dog());
PrintName(new Animal());

class Animal
{
    public string Name = "Generic Animal";
}

class Dog : Animal
{
    public Dog()
    {
        Name = "Rex";
    }
}
```

Real output:

```text
Rex
Generic Animal
```

#### Execution Trace

1. `where T : Animal` — added to `PrintName`'s own declaration — a
   promise to the compiler that whatever `T` turns out to be at each
   call site, it will always be `Animal` or something derived from it.
2. `item.Name` now compiles — the compiler allows any member `Animal`
   itself declares (`Name`) to be accessed on `item`, because the
   constraint guarantees at least that much.
3. `PrintName(new Dog())` — `T` is inferred as `Dog`, which satisfies
   `where T : Animal` (Lesson 0a's own inheritance: `Dog` *is a* kind of
   `Animal`) — prints `"Rex"`, `Dog`'s own real `Name` value.
4. `PrintName(new Animal())` — `T` is inferred as `Animal` directly —
   also satisfies the constraint — prints `"Generic Animal"`.

*What this proves:* `where T : Animal` doesn't change what `PrintName`
*does* — it changes what the compiler is willing to *allow* inside it,
by narrowing an unconstrained "could be anything" `T` down to "always
at least an `Animal`." Both a `Dog` and a plain `Animal` satisfy it,
because the constraint is checked against inheritance (Lesson 0a),
exactly the same "is a" relationship already proven there.

### Discard the Throwaway Example
Delete the `GenericsLab` folder. `where T : ...` is not discarded —
Lesson 48's own `CountDescendants<T>` uses exactly this next.

### Mechanical Walkthrough

- `void PrintName<T>(T item)`, unconstrained — **first appearance of an
  unconstrained generic method**, immediately proven, via the real
  `CS1061` error, to restrict `item` to only `object`'s own members
  (nothing else is guaranteed).
- `where T : Animal` — **first appearance of a type constraint.**
  Placed after the parameter list, naming the minimum type `T` must be
  or derive from.
- `PrintName(new Dog())` — **first appearance of generic type
  inference** — nowhere does this call write `PrintName<Dog>(...)`
  explicitly; the compiler infers `T` is `Dog` directly from the
  argument's own type.

### CS Lens

This is the same tradeoff Lesson 0c's abstract-class unit already
named for `abstract`/`virtual`: a constraint is a promise traded for a
capability. `Container<T>` (previous unit) needed no constraint because it
never called anything on `T` — an unconstrained `T` is maximally
flexible, accepting literally any type, at the cost of the compiler
allowing nothing beyond `object`'s own members. `where T : Animal`
narrows that flexibility deliberately, in exchange for real, usable
access to `Animal`'s own members inside the generic code.

### SE Lens

This exact pattern — `where T : SomeType` — already exists, unexplained
until now, in this project's own real code: Lesson 48's
`CountDescendants<T>(DependencyObject parent) where T : DependencyObject`
needs to check `if (child is T)` against WPF's visual tree, and its
companion `FindDescendant<T>` needs the same thing — neither would
compile without a constraint tying `T` back to a real, known type in
the visual tree hierarchy. Go back and reread Lesson 48's own
`CountDescendants<T>` now — the exact mechanism this lesson just proved
from first principles is sitting there, doing real work, previously
unexplained.

### Connection

Every place this project uses `List<T>`, `Dictionary<TKey, TValue>`,
`ObservableCollection<T>`, or `ICollectionView` from here forward is
built on exactly this mechanism — a type or method, written once,
reused safely across many real types, with the compiler enforcing the
boundary the entire time.

---

## Closing

### Connect the Pieces

`Container<T>` (first unit) proved, with a real, captured `CS0029` error, that
a self-written generic class converts a mistake `object`-based code
allows silently (and crashes on, later, at runtime — the real
`InvalidCastException` this unit's own first lab produced) into an
immediate compile-time error. `PrintName<T>` (second unit) proved, with
a real, captured `CS1061` error and its fix, that `where T : Animal`
trades unconstrained flexibility for real access to a known type's
members — the exact mechanism Lesson 48's own `CountDescendants<T>
where T : DependencyObject` already relies on, silently, until this
lesson named it.

### What Breaks Without This

Already demonstrated twice, on purpose, in this lesson: an `object`-typed
container accepting the wrong type silently, then crashing later at
runtime with a real `InvalidCastException` (first unit) — and an
unconstrained generic method refusing to compile the moment it tries to
use a member the compiler can't guarantee exists (second unit's initial,
broken version). No further break-it exercise needed this lesson.

### Exercises

- In a fresh `GenericsLab`, add a second field to `Container<T>`,
  `public DateTime StoredAt = DateTime.Now;`, and confirm it works
  identically regardless of what `T` is — fields that don't involve `T`
  at all need no special treatment.
- Reread Lesson 48's `CountDescendants<T>` and `FindDescendant<T>` for
  real, and write, in your own words, why both specifically constrain
  `T` to `DependencyObject` rather than leaving them unconstrained.
- Predict, in your own words, what happens if `PrintName(new Dog())` is
  called but `Dog` does *not* inherit from `Animal` at all (a
  completely unrelated class with its own `Name` field) — then test it
  for real and read the compiler's own error message.

### Definition of Done

- [ ] You ran both real failures in this lesson (`InvalidCastException`
      at runtime, then `CS0029` at compile time for the same mistake;
      `CS1061` for an unconstrained `T`) yourself, not just read them
      here.
- [ ] You can explain, in your own words and without re-reading this
      lesson, what `where T : Animal` actually promises the compiler,
      and what it unlocks in exchange.
- [ ] You went back and read Lesson 48's `CountDescendants<T>` for real
      and can explain what its own `where T : DependencyObject`
      constraint is for.

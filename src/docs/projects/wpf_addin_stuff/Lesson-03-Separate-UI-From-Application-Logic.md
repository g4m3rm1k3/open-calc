# Lesson 3: A Collaborator, Not a Container — Separating UI From Application Logic

**What you will build.** A new, plain C# class, `FileSource`, holding one
method, `SelectDirectory()`, that does exactly what the previous lesson's
`BrowseButton_Click` did inline: show the operating system's folder picker
and hand back the chosen path — or nothing, if the user didn't confirm one.
`MainWindow` keeps exactly the same button and the same path display;
nothing about what the running program looks like or does changes at all.
What changes is *where* the logic that decides "how do we ask for a
folder" lives, and who is responsible for it. This is this curriculum's
first architectural lesson, and what it's actually about goes past this
one class: every line of code written across the previous two lessons
lived inside `MainWindow`, a class WPF itself required to exist and to
inherit from `Window`. This lesson writes the project's first class
nobody but the project itself asked for — one with no base class, no XAML
pairing, no framework obligation of any kind — and asks a question that
recurs at every scale a real application ever reaches: when a UI event
handler needs to *do* something nontrivial, should that handler do the
work itself, or should it hand the work to something else built
specifically to do it, and only handle showing the result?

**What you need to know first.** Lesson 1 — the `class` keyword,
`namespace`, and inheritance (`: BaseType`) as this project first used
them to build `MainWindow` and `App`, and the `<Nullable>enable</Nullable>`
project setting behind `string?`. Lesson 2 — the fully working
`BrowseButton_Click` event handler and its inline `Microsoft.Win32.
OpenFolderDialog` / `ShowDialog()` / `FolderName` / `bool?` / `if` logic,
which this lesson relocates out of the event handler entirely.

**Terms used in this lesson.**

- **access modifier (`public`, `private`)** — a C# keyword pair
  controlling which other code is allowed to reference a class, method, or
  field. `public` means any code anywhere — inside the class's own file,
  in a different file, even in a different project referencing this one as
  a library — can see and use it; `private` means only code written inside
  that exact same class can. It exists because a class's whole point is to
  offer a deliberate, controlled surface to the rest of a program while
  hiding how it does its job internally — without a way to mark some
  things "outside code may touch this" and others "outside code may not,"
  every field and method would be equally exposed, and a class could never
  draw a real line between its public promise and its private
  implementation detail.
- **`class` (declaring a class)** — a C# keyword declaring a blueprint for
  objects: a named type specifying what fields, properties, and methods
  every object built from it will have. A class is not itself a running
  thing — it is the template; an actual object built from that template
  (an *instance*) is what exists in memory once the program runs. It
  exists so a program can define its own new kinds of things, beyond
  whatever types .NET or WPF already ship with — this lesson's
  `FileSource` is exactly that: a kind of object this project needed that
  didn't exist anywhere before this lesson wrote it.
- **`namespace`** — a C# keyword that groups a set of related types under
  one shared name, used to avoid naming collisions between types that
  happen to share a short name but come from different parts of a
  codebase or different libraries entirely. It exists because in a
  program built from many files and many libraries, two unrelated things
  being named the same short name is common; a namespace lets both exist
  without conflict, distinguished by their full name. This lesson's new
  file declares the identical `namespace MastercamGenerator;`
  `MainWindow.xaml.cs` already uses, so both classes are reachable from
  each other, unqualified, with no extra directive needed between them.
- **`return` statement** — a C# statement, written as the keyword `return`
  followed by a value (or, for a method with no return type, `return`
  alone with nothing after it), that immediately ends the currently-running
  method and hands that value back to whichever line of code called it. It
  exists because a method sometimes needs to *answer a question* for its
  caller — produce a specific value the caller then uses — rather than
  only performing an action and handing control back with nothing; without
  `return`, a method would have no way to communicate anything to its
  caller except by changing some other object's state as a side effect.
- **nullable reference type (`string?`)** — a C# compiler feature that
  makes the compiler track, for every variable of a reference type,
  whether that variable is allowed to legally hold the absence-of-a-value
  marker `null`. A plain `string` is assumed, by the compiler, to always
  hold a real string; a `string?` explicitly declares "this may
  legitimately hold no string at all," and the compiler then requires code
  using it to account for that possibility before treating it as a
  guaranteed real value. It exists because a variable holding `null` when
  code assumes it never can is one of the most common sources of a running
  .NET program crashing; with this feature on (turned on project-wide via
  `<Nullable>enable</Nullable>` in this project's own `.csproj` file), the
  compiler warns at the exact point a possibly-null value is used
  somewhere that assumed it couldn't be. This lesson's `SelectDirectory()`
  genuinely can return "no folder was chosen" as a real outcome, not an
  error — `string?` is what lets its signature say so honestly.
- **nullable value type (`bool?`)** — a C# feature letting a value type (a
  `bool`, an `int` — types that normally can never be absent) hold a third
  state, "no value at all," in addition to its usual ones, written as the
  type name followed by `?`. This is a different mechanism from nullable
  reference types, above — that feature only changes what the compiler
  warns about for reference-type variables that could already legally be
  `null`; a plain `bool` cannot hold `null` at all until it's explicitly
  written as `bool?`, which wraps it in a real wrapper type,
  `System.Nullable<bool>`, built for exactly this purpose. It exists here
  because `OpenFolderDialog.ShowDialog()`'s "did the user confirm or
  cancel" answer genuinely has a third possibility beyond yes/no — the
  dialog was closed some other way — which a plain `bool` cannot
  represent.
- **`var` (implicit typing)** — a C# keyword letting a local variable's
  declaration omit its explicit type, leaving the compiler to infer it
  from whatever is immediately assigned to it. It exists purely to reduce
  repetition: stating a constructed type's name once, on the right-hand
  side of `new`, is enough for the compiler to know the variable's type
  without also spelling it out, redundantly, on the left. `var` does not
  mean "any type, decided at runtime" — the type is still fixed and
  checked at compile time, merely not written by hand.
- **`if` statement** — a C# conditional: a block of code that only runs
  when a given condition, an expression producing a `bool`, evaluates to
  `true`. It exists as the basic mechanism for a program to do different
  things depending on data it doesn't know until the program is actually
  running.
- **equality / inequality operators (`==`, `!=`)** — two C# comparison
  operators: `==` evaluates to `true` when its two operands hold equal
  values, `false` otherwise; `!=` is its exact logical mirror, evaluating
  to `true` precisely when `==` would evaluate to `false`. Both exist
  because a program constantly needs to branch on whether two values match
  or differ, and a dedicated comparison operator, built into the language
  itself, is far more direct than writing that comparison out as a
  hand-rolled method call. Comparing a nullable type (`bool?` or `string?`,
  both above) against a fixed value using either operator is always legal
  and never throws, even when the nullable side currently holds `null` —
  these are ordinary, well-defined comparisons, not special cases
  requiring extra code to guard against.
- **instance field** — a variable declared directly inside a class body
  (not inside any one method), belonging to each individual object built
  from that class rather than to any single method call. Unlike a local
  variable, which is created fresh every time its containing method runs
  and disappears the instant that method returns, a field's value persists
  for as long as the object holding it exists, surviving across as many
  separate method calls as that object lives through. It exists because an
  object frequently needs to remember something between one method call
  and the next — without fields, an object could never be more than a
  bundle of methods that immediately forget everything the instant each
  one finishes.
- **`readonly` modifier** — a C# keyword applied to a field declaration,
  restricting that field so it can only ever be assigned once — either
  right where it's declared, or inside the class's own constructor — and
  never reassigned anywhere else afterward, including from the class's own
  other methods. It exists to let a class state a real, compiler-enforced
  guarantee about one of its own fields: "once this object exists, this
  reference never changes," which every other method in the class (and
  every future person editing it) can then rely on without re-checking.
- **underscore-prefixed field naming convention (`_fieldName`)** — a
  widely-followed C# naming convention, not a compiler-enforced rule, of
  prefixing a private instance field's name with an underscore. It exists
  purely for human readability: at any point inside a class's own code, a
  name starting with `_` is instantly recognizable as "a field belonging
  to this object," distinguishing it at a glance from a local variable or
  a method parameter, neither of which carries that prefix — nothing about
  the compiler treats an underscore-prefixed name any differently than any
  other legal identifier.

**Objects and methods used.**

- **`FileSource`**
  - *What it is:* a plain C# class representing this project's own idea of
    "something that can select a directory" — an application-logic
    object, not a WPF control and not tied to any specific window.
  - *Implementation:* `public class FileSource` in the `MastercamGenerator`
    namespace, declared with no base class at all (no `: SomeType` after
    its name) — the first class in this project written that way; every
    other class so far (`MainWindow`, and, in `App.xaml.cs`, `App`) is
    required by WPF to inherit from `Window` or `Application`
    respectively.
  - *Its use:* this lesson's entire new home for the folder-picking logic
    previously written directly inside `BrowseButton_Click` — `MainWindow`
    now creates one and calls its `SelectDirectory()` method instead of
    doing that work itself.
  - *Type:* a public class, instantiated with `new`, meant to be used
    directly (not inherited from).
  - *Responsibility:* knowing how to ask for a directory and reporting
    back what was chosen — and nothing about how or when that answer gets
    displayed, which stays entirely `MainWindow`'s job.
  - *Depends on:* nothing beyond being constructed; its one method (below)
    constructs its own `OpenFolderDialog` internally.
  - *Connects to:* constructed once by `MainWindow` (this lesson's fourth
    Concept Unit); called from `BrowseButton_Click` (this lesson's fifth);
    internally constructs and calls into `Microsoft.Win32.
    OpenFolderDialog`.
  - *Shape:* the actual dependency boundary this lesson draws —
    application logic on one side, WPF UI on the other, meeting only at
    this class's one public method.
- **`FileSource.SelectDirectory()`**
  - *What it is:* the one method `FileSource` exposes — asks the user to
    pick a directory and reports which one, if any, they picked.
  - *Implementation:* `public string? SelectDirectory()` — no parameters,
    returning a nullable `string`: the chosen path if the user confirmed
    one, `null` if they didn't.
  - *Its use:* this lesson's entire reason `FileSource` exists — the
    single call `BrowseButton_Click` makes to get an answer back, instead
    of running the dialog itself.
  - *Type:* a public instance method.
  - *Responsibility:* showing the OS folder-picker, waiting for it to
    close, and translating whatever it reports into a single, simple
    answer its caller can act on without needing to know anything about
    `OpenFolderDialog` itself.
  - *Depends on:* nothing beyond a `FileSource` instance existing;
    internally depends on `Microsoft.Win32.OpenFolderDialog` being
    available (guaranteed by this project's own `UseWPF` project setting).
  - *Connects to:* called by `BrowseButton_Click`; internally constructs a
    `Microsoft.Win32.OpenFolderDialog` and calls its `ShowDialog()` and
    reads its `FolderName` (both below).
  - *Shape:* the one public entry point into this lesson's new class —
    everything else about `FileSource` is either its own internals or, so
    far, nonexistent.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`Microsoft.Win32.OpenFolderDialog`**
  - *What it is:* a class representing the operating system's native
    folder-picker dialog.
  - *Implementation:* `public class OpenFolderDialog` in `Microsoft.
    Win32`, part of `PresentationFramework` — already available in this
    project via its own `UseWPF` project setting, no extra library
    reference needed. Referenced here by its fully qualified name,
    `Microsoft.Win32.OpenFolderDialog`, rather than a bare
    `OpenFolderDialog`, because this new file has no `using
    Microsoft.Win32;` directive bringing the short name into scope — the
    fully qualified form is always legal regardless of what a file's
    `using` directives bring in, since it names the type's complete
    location outright.
  - *Its use:* the one mechanism `SelectDirectory()` uses to actually ask
    the user "which folder?"
  - *Type:* a public class, instantiated with `new`.
  - *Responsibility:* showing the real OS folder-browser UI, blocking the
    calling code until the user closes it, then exposing whatever they
    chose (or didn't) through its own properties.
  - *Depends on:* nothing beyond being constructed.
  - *Connects to:* constructed and shown from inside `SelectDirectory()` —
    no longer from `BrowseButton_Click`, which this lesson's fifth Concept
    Unit removes it from entirely.
  - *Shape:* this lesson's entire OS-facing surface, now sitting one layer
    further from `MainWindow` than it did before this lesson.
- **`OpenFolderDialog.ShowDialog()`**
  - *What it is:* the method that actually displays the dialog and waits.
  - *Implementation:* `public bool? ShowDialog()` — returns `true` if the
    user confirmed a folder, `false` if they explicitly canceled, `null`
    if the dialog closed some other way.
  - *Its use:* called once per `SelectDirectory()` call, its result
    inspected before `FolderName` (below) is trusted at all.
  - *Type:* an instance method.
  - *Responsibility:* the entire lifecycle of showing the dialog, blocking
    until it closes, and reporting how it closed.
  - *Depends on:* the `OpenFolderDialog` instance it's called on already
    existing.
  - *Connects to:* called from `SelectDirectory()`; internally invokes
    real Windows shell UI this project's own code never touches directly.
  - *Shape:* the one blocking, synchronous call inside `SelectDirectory()`
    — everything else in that method runs instantly.
- **`OpenFolderDialog.FolderName`**
  - *What it is:* the property holding the path of whichever folder the
    user picked, once `ShowDialog()` has returned `true`.
  - *Implementation:* a read-only `string` property, meaningful only after
    a confirmed `ShowDialog()` call.
  - *Its use:* read once, inside `SelectDirectory()`'s `if (result ==
    true)` block, and handed straight back to the caller via `return`.
  - *Type:* an instance property.
  - *Responsibility:* holding exactly the folder path the OS dialog
    reported back.
  - *Depends on:* a completed, confirmed `ShowDialog()` call.
  - *Connects to:* read inside `SelectDirectory()`; the value it returns
    becomes `SelectDirectory()`'s own return value — the real mechanism by
    which application logic hands information back across the boundary to
    WPF.
  - *Shape:* the same literal payload this project has always moved from
    "something the operating system knows" to "something the UI
    displays"; this lesson adds one more stop to that trip, through
    `FileSource`, before it ever reaches `MainWindow`.
- **`TextBlock.Text`**
  - *What it is:* a string property holding exactly the text a `TextBlock`
    displays.
  - *Implementation:* a settable `string` property.
  - *Its use:* still the final destination of the whole chain — set, in
    this lesson's fifth Concept Unit, from the value `SelectDirectory()`
    returned.
  - *Type:* an instance property.
  - *Responsibility:* holding the exact string this one `TextBlock`
    currently shows.
  - *Depends on:* nothing beyond the `TextBlock` instance existing.
  - *Connects to:* read by `TextBlock`'s own rendering logic; written from
    `BrowseButton_Click`, same as before, but now from a local variable
    holding `FileSource`'s answer instead of directly from
    `dialog.FolderName`.
  - *Shape:* unchanged from before this lesson — this lesson's whole point
    is that the UI-facing seam stays exactly the same width; only what
    feeds it from behind changes.

---

## Concept Unit: A Class With No Framework to Answer To

### The Problem

`BrowseButton_Click`, as it stands right now, does three different jobs in
one method: reacting to a button click (a WPF concern), deciding how to
ask the operating system for a folder (an application-logic concern that
has nothing to do with buttons or windows), and updating a `TextBlock` (a
WPF concern again). Every class in this project so far exists because WPF
requires it to — `MainWindow` must inherit from `Window` to become a real
window at all. Nothing yet exists in this project that WPF didn't, in some
sense, demand.

> Every class this project has written so far inherits from a WPF base
> class (`MainWindow : Window`, `App : Application`) — what's the smallest
> possible class you could write that inherits from nothing at all? Would
> it still compile? Would it still do anything if nothing ever constructs
> it? If the logic for "ask the operating system for a folder" moved out
> of `BrowseButton_Click` into some other object entirely, what's the
> smallest set of things that object would actually need to know — does it
> need to know anything about buttons, windows, or `TextBlock`s at all?

### Introduce the Concept in Isolation

Two bare class declarations, neither executed — ordinary, entirely
predictable C# declaration syntax, with no ambiguity here to resolve by
running either one:

```csharp
public class Empty
{
}
```

and, for contrast, the exact shape already required of `MainWindow`:

```csharp
public partial class MainWindow : Window
{
}
```

The first compiles and produces something real the moment any code writes
`new Empty()`: a genuine, if featureless, object. Nothing about it
requires WPF, a window, or any base class at all — **`class`** (Header
above) is legal entirely on its own, with nothing after the class name.
The second is only legal because `Window` already exists as a real base
class this project's libraries provide; the colon and `Window` after
`MainWindow` are what make it a *kind of* `Window`, not a plain object
like `Empty`. This lesson's own new class is built the first way, not the
second.

### Discard the Throwaway Example

`Empty` is not part of the real project — the real class (below) is named
`FileSource` and, unlike `Empty`, ends up doing something. This throwaway
version is discarded now.

### Project Change

- **Reference Source** — no reference counterpart. This class is this
  curriculum's own architectural decision; neither the BRD nor the prior
  Python tools it describes ever separate folder-selection logic from its
  UI at all.
- **Files affected** — created: `FileSource.cs`, in the
  `MastercamGenerator/` project folder, alongside `MainWindow.xaml.cs`.
- **Change type** — add (a brand-new file).
- **Location** — n/a; this is the file's entire starting content.
- **Dependencies** — none beyond the project itself already existing.

### The New Code

```csharp
namespace MastercamGenerator;

public class FileSource
{
}
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there is nothing further to return to.

### Mechanical Walkthrough

1. `namespace MastercamGenerator;` — the **namespace** keyword (Header
   above): groups this new `FileSource` class under the same shared name
   `MainWindow` already belongs to, so both are reachable from each other,
   unqualified, with no extra directive needed between them.
2. `public` — the **access modifier** (Header above) on the class
   declaration itself: any code anywhere is allowed to see and construct
   this class, including `MainWindow.xaml.cs`, a different file entirely,
   later in this lesson.
3. `class FileSource` — the **class** keyword (Header above), declaring a
   new blueprint named `FileSource`. Unlike `MainWindow`'s declaration,
   nothing follows the name — no colon, no base type — this is this
   project's first class declared this way.
4. `{ }` — an empty class body: a real, legal, constructible class with,
   so far, nothing inside it — the same "empty but real" shape this
   project's own empty `Grid` element already showed for XAML markup,
   applied here to C# instead of markup.

### CS Lens

This is **separation of concerns**, a foundational software engineering
principle: a program is easier to build, understand, and change correctly
when each distinct part of what it does lives in its own, separately-named
unit, rather than several unrelated jobs being tangled together inside one
method or one class. `FileSource`, empty as it is right now, is this
project's first deliberate step toward that: a place, separate from
anything WPF requires, for "how do we get a folder from the user" to live,
distinct from "what does the button that triggers it look like" and "what
happens on screen once we have an answer." Also recognized in: a
restaurant kitchen kept physically separate from its dining room, so
cooking and serving can each be optimized without interfering with the
other; a car's engine and its dashboard instruments being built, and often
made, by entirely different teams even though the dashboard displays what
the engine is doing; a company's accounting department kept
organizationally separate from its sales department, even though sales
activity is exactly what accounting eventually records.

### SE Lens

The alternative — leaving this logic directly inside `BrowseButton_Click`
— is simpler for exactly one thing: an application with exactly one place
that ever needs to pick a folder, never tested outside of running the
whole window, never reused anywhere else. The tradeoff this lesson pays
for `FileSource` instead: one more file, one more class, one more layer
between "user clicks Browse" and "something happens" — real overhead for a
program this small. The bet: this curriculum's own outline adds far more
application logic in later lessons (scanning directories, watching for new
files, parsing XML) that has nothing to do with WPF at all, and every one
of those pieces needs exactly this same kind of home — a class
`MainWindow` calls into, not one tangled inside its event handlers. Paying
that cost now, on the simplest possible case, is deliberate: it
establishes the pattern before the pressure to have it becomes urgent, the
same bet already made once in this project, adding an empty `Grid` before
anything needed to go inside it.

### Commands Needed

None yet beyond `dotnet build`, run once for this lesson's whole batch of
changes at the end.

### Run It

Predicted, not executed standalone: an empty class declaration with a
namespace and no base type is among the most basic legal C# there is — no
ambiguity exists to resolve by running it in isolation. This project's
real compile of this exact file, alongside every other change in this
lesson, is shown in full at this lesson's end.

### Connecting Back

Every class this project has written until now existed because WPF itself
required it to exist. This is the first class that exists purely because
this project decided it should — empty for now, and about to be given the
one thing it exists for: a method.

---

## Concept Unit: A Method That Returns a Value

### The Problem

Every method written so far in this project — `MainWindow`'s constructor,
`BrowseButton_Click` — runs, does something, and hands control back to
whoever called it, with nothing to show for it beyond whatever side effect
it caused (a window appearing, a `TextBlock`'s text changing). `FileSource`
needs to do something genuinely different: answer a question. `MainWindow`
needs to know which folder the user picked — or that they didn't pick one
at all — and a method that runs and returns nothing has no way to
communicate that back to whatever called it.

> Every method you've seen so far in this project is declared `void` — no
> type before its name. If a method needed to hand a real value back to
> its caller instead of just performing an action, what would have to
> change about how it's declared? `BrowseButton_Click` currently decides,
> itself, whether to update `FolderPathText`. If that decision moved to
> whoever calls `SelectDirectory()` instead, what does `SelectDirectory()`
> itself need to hand back — just the folder path, or something else too,
> to cover the case where there isn't one? Given `string?` already means
> "a string, or possibly nothing at all," does that sound like the right
> type for a method that might come back from a canceled dialog with
> nothing to report?

### Introduce the Concept in Isolation

A tiny, uninvolved method, its behavior fully predictable without running
it — no ambiguity here to resolve, the same confidence this lesson already
applies to basic, well-established C# syntax elsewhere:

```csharp
public string Greet()
{
    return "hello";
}
```

Calling `Greet()` produces the string `"hello"` — not printed, not
displayed anywhere, simply handed back as this call's own value, the same
way `5 + 3` hands back `8` without needing anyone to print it for that to
be true. This is called a **return statement**: the moment `return
"hello";` runs, `Greet()` stops immediately — any code written after it
inside the same method would never run — and the value named after
`return` becomes what the whole call `Greet()` evaluates to, wherever it
was written.

A second version, showing a method can choose between more than one
return statement, and, when nullable, can return nothing at all:

```csharp
public string? MaybeGreet(bool sayHello)
{
    if (sayHello)
    {
        return "hello";
    }

    return null;
}
```

Calling `MaybeGreet(true)` runs the `if` block and returns `"hello"`;
calling `MaybeGreet(false)` skips it and reaches the second `return
null;` instead, returning nothing at all — legal specifically because the
return type is written `string?`, a **nullable reference type** (Header
above), not plain `string`; a plain `string`-returning method attempting
`return null;` would be flagged as a warning under this project's own
nullable reference types feature, turned on project-wide since this
project's very first build.

### Discard the Throwaway Example

Neither `Greet()` nor `MaybeGreet()` appears in the real project — both
existed only to isolate the return statement's effect before this lesson's
real method (below) does the same thing for a real reason. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `FileSource.cs` (the file this lesson's
  previous Concept Unit created).
- **Change type** — add (a new method inside the previously-empty class).
- **Location** — inside `FileSource`'s empty body.
- **Dependencies** — this lesson's previous Concept Unit's empty
  `FileSource` class.

### The New Code

```csharp
public string? SelectDirectory()
{
    return null;
}
```

### The Updated Project

The full `FileSource.cs`, as it stands at the end of this Concept Unit,
with the new method marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class FileSource
4  {
5      public string? SelectDirectory()          // ← new
6      {                                          // ← new
7          return null;                           // ← new
8      }                                          // ← new
9  }
```

`FileSource` now has exactly one method — still not the real logic this
lesson needs, but a real, callable method with the exact shape (name,
parameters, return type) `BrowseButton_Click` will eventually call.

### Mechanical Walkthrough

1. `public` — the **access modifier** (Header above) on this method: any
   code that can already see the `FileSource` class (any code at all,
   since the class itself is `public`) can call this method too.
2. `string?` — the method's declared return type: this **nullable
   reference type** (Header above) states, as part of the method's own
   signature, that calling this method might legitimately produce no
   string at all — not an error case, a real, expected outcome the caller
   must handle.
3. `SelectDirectory()` — the method's name, and its empty parameter list:
   this method takes no input at all — everything it needs (showing a
   dialog, reading what it returns) it can do entirely on its own, with no
   information handed to it from outside.
4. `return null;` — a **return statement** (Header above), immediately
   ending this method and handing back the literal `null` — legal
   specifically because the method's own return type is `string?`, not
   plain `string`.

### CS Lens

This is **Command–Query Separation**, a real, named software design
principle: a method should either be a *command* — perform an action,
change something, return nothing meaningful (every `void` method in this
project so far) — or a *query* — answer a question and return a value,
changing nothing else in the process — but not quietly try to be both at
once. `SelectDirectory()`'s entire job, once finished later this lesson,
is answering "which folder?" — nothing about calling it should be required
to also decide what happens with the answer; that decision correctly stays
with whoever calls it. Also recognized in: `int.TryParse` handing back a
value instead of writing into some global "last parsed number" variable; a
vending machine's price display (a query — ask it what something costs)
kept separate from its dispense mechanism (a command — insert money, get
the item); a thermostat's current-temperature reading (a query) kept
separate from its "turn on the heat" instruction (a command); a database's
`SELECT` statement, which changes nothing, kept as a fundamentally
different operation from `UPDATE`, which changes data but reports back
nothing about it.

### SE Lens

The alternative — a `void` method that itself decides what to update,
perhaps by taking `MainWindow`'s `FolderPathText` as a parameter and
writing to it directly — was available and would still separate the
dialog logic out of `BrowseButton_Click`. It's not chosen because it would
still couple `FileSource` to a WPF-specific object (`TextBlock`) it has no
real business knowing about, contradicting this lesson's entire point (its
own first Concept Unit's separation of concerns). Returning a plain value
costs a little: the caller now has to do something with the answer itself,
rather than the callee doing it for them — exactly the `if` block this
lesson's fifth Concept Unit adds back into `BrowseButton_Click`. That small
cost buys total independence: `FileSource` could be reused by a console
program, a test, or an entirely different UI framework tomorrow, and not
one line of it would need to change.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence, not executed standalone: a method
returning a fixed literal has no ambiguity a run could resolve — this
project's real, full build, covering this exact method, is shown at this
lesson's end.

### Connecting Back

The previous Concept Unit gave `FileSource` a name and an empty body; this
one gives it a real method signature — still answering "nothing," for now,
but with the exact shape its caller will need. The next Concept Unit
replaces this placeholder with the method's actual, real logic.

---

## Concept Unit: Relocating the Dialog Logic Into the Method

### The Problem

`SelectDirectory()` currently always answers "nothing." The real logic
that decides that answer — show the OS folder dialog, check how the user
closed it, read back what they chose — still lives nowhere at all right
now; the original version of it, inside `BrowseButton_Click`, is about to
be removed by this lesson's final Concept Unit, and needs a real
destination before that happens.

> `BrowseButton_Click`'s current body already contains working code for
> exactly this: constructing an `OpenFolderDialog`, calling `ShowDialog()`,
> checking its result, reading `FolderName`. If you moved those exact
> lines into `SelectDirectory()`'s body, what would have to change about
> the very last step — the part that used to write into
> `FolderPathText.Text` directly? `ShowDialog()` returns `bool?`, which
> already has three possible outcomes (confirmed, canceled, closed some
> other way), handled with one `if`. Does moving that same `if` into a
> different method change what those three outcomes mean, or just where
> the code deciding what to do about them lives?

### Introduce the Concept in Isolation

No new isolated example — this unit's whole point is that this construct
(`OpenFolderDialog`, `ShowDialog()`, `bool?`, the three-outcome `if`)
already has a real, isolated proof, from this project's own earlier build
of `BrowseButton_Click`. This unit relocates already-working code,
verified once already, into a new location — introducing it again in a
fresh throwaway example first would test nothing this lesson doesn't
already know for certain.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `FileSource.cs`.
- **Change type** — replace (the placeholder `return null;` body from this
  lesson's previous Concept Unit).
- **Location** — inside `SelectDirectory()`'s body.
- **Dependencies** — this lesson's previous Concept Unit's
  `SelectDirectory()` method signature.

### The New Code

```csharp
var dialog = new Microsoft.Win32.OpenFolderDialog();
bool? result = dialog.ShowDialog();
if (result == true)
{
    return dialog.FolderName;
}
```

### The Updated Project

The full `FileSource.cs`, as it stands at the end of this Concept Unit,
with the new lines marked:

```csharp
1  namespace MastercamGenerator;
2  
3  public class FileSource
4  {
5      public string? SelectDirectory()
6      {
7          var dialog = new Microsoft.Win32.OpenFolderDialog();     // ← new
8          bool? result = dialog.ShowDialog();                      // ← new
9          if (result == true)                                      // ← new
10         {                                                        // ← new
11             return dialog.FolderName;                            // ← new
12         }                                                        // ← new
13 
14         return null;
15     }
16 }
```

`SelectDirectory()` now does the actual work: on a confirmed choice, it
returns the real path; on a cancel or any other close, execution falls
through to the unchanged `return null;` from this lesson's previous
Concept Unit.

### Mechanical Walkthrough

1. `var dialog = new Microsoft.Win32.OpenFolderDialog();` — **`var`**
   (Header above), reappearing unchanged: lets this line omit an explicit
   type on the left because `new Microsoft.Win32.OpenFolderDialog()` on
   the right already tells the compiler exactly what type `dialog` is.
   `new Microsoft.Win32.OpenFolderDialog()` constructs one instance of
   **`Microsoft.Win32.OpenFolderDialog`** (Header above), referenced by
   its fully qualified name because this file has no `using
   Microsoft.Win32;` directive — the same class already used in this
   project's earlier version of this exact logic, unchanged.
2. `bool? result = dialog.ShowDialog();` — calls **`OpenFolderDialog.
   ShowDialog()`** (Header above) on the instance just constructed,
   storing its **`bool?`** (Header above) result in a new local variable
   `result` — mechanically identical to this project's own earlier use of
   this exact call.
3. `if (result == true)` — the **`if` statement** (Header above), its
   condition using the **equality operator `==`** (Header above) to
   compare `result` against the literal `true`. Because `result` is
   `bool?`, this comparison still carries all three real outcomes: `true`
   makes the block run; `false` and `null` both make `result == true`
   evaluate to `false`, skipping it — the exact same three-way behavior
   already proven real in this project's own earlier build, unchanged by
   moving this code into a different class.
4. `return dialog.FolderName;` — inside the `if` block:
   **`OpenFolderDialog.FolderName`** (Header above) is read, returning the
   real, confirmed folder path as a `string`; a **`return` statement**
   (Header above) immediately hands that value back as `SelectDirectory
   ()`'s own result, ending the method right there — the `return null;`
   two lines below it never runs when this branch does.

### CS Lens

Nothing new to name here beyond what this lesson's second Concept Unit
(the return statement) and this project's own real, verified build
(`OpenFolderDialog`, `bool?`, and the three-outcome `if`) already covered
in full — this unit's own point is relocation, proven safe because nothing
about *what* this code does changed, only *where* it lives.

### SE Lens

Moving already-working code into a new location, unchanged, rather than
rewriting it "while I'm in here," is a deliberate discipline: refactoring
— restructuring code without changing its observable behavior — and
adding new behavior are two different kinds of change, and mixing them in
one step makes it far harder to tell, if something breaks afterward,
whether the *move* broke it or a *behavior change* did. This unit changes
nothing about what any of these three lines actually do; it only changes
their address.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with the same confidence already established for this exact
code, since nothing about its behavior changed by moving it, only its
location — this project's real, full build, covering this exact method,
is shown at this lesson's end.

### Connecting Back

`SelectDirectory()` now does everything this lesson set out to build
inside `FileSource` itself — it just has no caller yet. The next Concept
Unit gives `MainWindow` a way to reach it.

---

## Concept Unit: A Private `readonly` Field Holds a Collaborator

### The Problem

`MainWindow` needs to call `SelectDirectory()` on some `FileSource` object
— but which one, and when is it created? `BrowseButton_Click` runs fresh,
from the top, every single time the user clicks Browse; if it constructed
a brand-new `FileSource` on every single click, that would work, but
there'd be no single, persistent object representing "this window's own
way of picking folders" — just a disposable one, rebuilt and thrown away
every click, for a job that has no real reason to be rebuilt at all.

> If `BrowseButton_Click` wrote `var fileSource = new FileSource();` as
> its very first line, every single time it ran, would that actually be
> wrong? What, if anything, would be wasted by doing it that way every
> click? A local variable, declared with `var` inside a method, disappears
> the moment that method returns. If `MainWindow` needed the *same*
> `FileSource` object to still exist the next time `BrowseButton_Click`
> runs — not a fresh one — where would that object need to be declared
> instead of inside the method itself?

### Introduce the Concept in Isolation

Two versions of a tiny, hypothetical class, neither run — the difference
between them is settled, well-known C# scoping behavior needing no
execution to confirm:

```csharp
public class Counter
{
    public void Tick()
    {
        var count = 0;
        count = count + 1;
    }
}
```

Here, `count` is a local variable: created fresh, starting at `0`, every
single time `Tick()` runs, and discarded the instant `Tick()` returns —
calling `Tick()` ten times in a row never accumulates anything, because
each call gets its own brand-new `count`.

```csharp
public class Counter
{
    private int count = 0;

    public void Tick()
    {
        count = count + 1;
    }
}
```

Here, `count` is an **instance field** (Header above), declared inside the
class body but outside any method: it's created once, when a `Counter`
object is constructed, and persists for that object's entire lifetime —
calling `Tick()` ten times on the same `Counter` object really does leave
`count` holding `10` afterward, because every call reads and writes the
*same* stored value instead of a fresh one.

### Discard the Throwaway Example

`Counter` and its `Tick()` method appear nowhere in the real project —
both existed only to isolate the difference between a local variable and a
field before this lesson's real field (below) uses that exact difference
for a real reason. Discarded now.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — add (a new field).
- **Location** — inside the `MainWindow` class body, before its existing
  constructor.
- **Dependencies** — this lesson's `FileSource` class, complete as of its
  previous Concept Unit.

### The New Code

```csharp
private readonly FileSource _fileSource = new FileSource();
```

### The Updated Project

The full `MainWindow.xaml.cs`, as it stands at the end of this Concept
Unit, with the new field marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11 
12 namespace MastercamGenerator;
13 
14 public partial class MainWindow : Window
15 {
16     private readonly FileSource _fileSource = new FileSource();     // ← new
17 
18     public MainWindow()
19     {
20         InitializeComponent();
21     }
22 
23     private void BrowseButton_Click(object sender, RoutedEventArgs e)
24     {
25         var dialog = new Microsoft.Win32.OpenFolderDialog();
26         bool? result = dialog.ShowDialog();
27         if (result == true)
28         {
29             FolderPathText.Text = dialog.FolderName;
30         }
31     }
32 }
```

`MainWindow` now owns exactly one `FileSource` object, built the moment
any `MainWindow` is constructed — `BrowseButton_Click` doesn't call it
yet; that's this lesson's final Concept Unit.

### Mechanical Walkthrough

1. `private` — the **access modifier** (Header above): unlike
   `FileSource`'s own `public` class declaration, this field is reachable
   only from code written inside `MainWindow` itself — no other class,
   including `FileSource`, can see or touch `_fileSource` directly.
2. `readonly` — the **`readonly` modifier** (Header above): once this
   field is assigned (right here, at declaration), no other line anywhere
   in `MainWindow` — including inside `BrowseButton_Click` — is allowed to
   assign it a different value. This is a real, compiler-enforced
   guarantee: an attempt to write `_fileSource = new FileSource();`
   anywhere else in the class would be a build error, not just bad style.
3. `FileSource` — the field's declared type: this **instance field**
   (Header above) holds a reference to this lesson's own `FileSource`
   class, not a built-in .NET type.
4. `_fileSource` — the field's name, following the **underscore-prefixed
   field naming convention** (Header above): the leading underscore marks
   it, at a glance, as a field belonging to this object, distinguishing it
   from any local variable or parameter name used anywhere else in the
   class (none of which carry that prefix).
5. `= new FileSource();` — a field initializer: constructs one
   `FileSource` object (this lesson's own subject, Header above) and
   assigns it to `_fileSource` as part of the field's own declaration.
   This runs once, automatically, before `MainWindow`'s own constructor
   body (line 20, `InitializeComponent();`) executes at all — every field
   initializer in a class runs before that class's constructor body does,
   in the order the fields are declared.

### CS Lens

An instance field is how an object achieves **encapsulated state** — the
ability to remember something across more than one method call, privately,
without any code outside the object needing to know that memory exists or
how it's stored. Also recognized in: a bank account object remembering its
own balance across every deposit and withdrawal call made against it; a
video game character object remembering its current health total across
every frame the game renders; a database connection object remembering its
own open socket across every query sent through it; a thermostat
remembering its target temperature between the moments someone actually
adjusts it.

### SE Lens

The alternative — constructing a fresh `FileSource` inside
`BrowseButton_Click` itself, every time it runs, instead of storing one
field — was raised in this unit's own Socratic prompt, and would still
work correctly: `FileSource` holds no state of its own between calls, so a
new one every click costs nothing but one small, cheap object allocation
that's immediately thrown away. The `readonly` field instead states
something for the whole class to read, once, at the top: "this
`MainWindow` has exactly one way of picking folders, and it never changes
for as long as this window exists" — a real design statement, not just a
performance choice, that becomes more valuable later in this curriculum's
own plan, once other lessons give `FileSource`-like objects real memory of
their own (a directory watcher, for instance, that has to remember whether
it's currently watching) that genuinely cannot be recreated fresh on every
use without losing that memory. The cost paid now: one extra line, and a
small amount of trust that `readonly` is worth reaching for before a
lesson actually forces the issue.

### Commands Needed

None beyond this lesson's shared, end-of-lesson `dotnet build`.

### Run It

Predicted with full confidence, not executed standalone: a `readonly`
field with an inline initializer is standard, thoroughly documented C#
behavior with no ambiguity to resolve by running it alone — this project's
real, full build, covering this exact field, is shown at this lesson's
end.

### Connecting Back

`FileSource` (this lesson's first three Concept Units) now has a permanent
home inside `MainWindow` — constructed once, ready to be called. The only
piece still missing: `BrowseButton_Click` doesn't call it yet, and still
runs the original, inline dialog code. That's this lesson's final Concept
Unit.

---

## Concept Unit: Calling the Collaborator From the Event Handler

### The Problem

`BrowseButton_Click` still contains the exact same inline dialog code it
always has — constructing its own `OpenFolderDialog`, calling
`ShowDialog()` itself, reading `FolderName` itself — even though
`FileSource.SelectDirectory()` and the `_fileSource` field now both exist
and can do all of that instead. Nothing has actually moved yet from the
UI's perspective; this lesson's whole architectural point isn't real until
`BrowseButton_Click` stops doing that work itself and asks `_fileSource`
to do it.

> `SelectDirectory()` returns `string?` — a real path, or `null`. If
> `BrowseButton_Click` calls it and gets `null` back, what should happen
> to `FolderPathText`? Should it change at all? This project's own earlier
> `if (result == true)` handled a `bool?` by comparing it to `true`. If
> you now have a `string?` instead, and need to know whether it's "a real
> answer" versus "nothing," what would the equivalent comparison look
> like — and which of this lesson's two comparison operators does it
> need?

### Introduce the Concept in Isolation

No new isolated example — calling a method on a field and checking its
result against `null` is the direct, mechanical combination of constructs
already isolated earlier in this lesson (the `return` statement, second
Concept Unit) and already real, working code this project has used before
(the `if`/comparison shape, reused here against `null` instead of `true`).
Isolating it a third time inside this same lesson would test nothing new.

### Discard the Throwaway Example

Not applicable — no new throwaway example was written for this unit.

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `MainWindow.xaml.cs`.
- **Change type** — replace (the entire body of `BrowseButton_Click`,
  removing the inline dialog code).
- **Location** — inside `BrowseButton_Click`, replacing everything between
  its opening and closing braces.
- **Dependencies** — this lesson's `_fileSource` field (previous Concept
  Unit) and `FileSource.SelectDirectory()` (second and third Concept
  Units).

### The New Code

```csharp
string? folder = _fileSource.SelectDirectory();
if (folder != null)
{
    FolderPathText.Text = folder;
}
```

### The Updated Project

The full `MainWindow.xaml.cs`, as it stands at the end of this Concept
Unit — and at the end of this lesson — with the new lines marked:

```csharp
1  using System.Text;
2  using System.Windows;
3  using System.Windows.Controls;
4  using System.Windows.Data;
5  using System.Windows.Documents;
6  using System.Windows.Input;
7  using System.Windows.Media;
8  using System.Windows.Media.Imaging;
9  using System.Windows.Navigation;
10 using System.Windows.Shapes;
11 
12 namespace MastercamGenerator;
13 
14 public partial class MainWindow : Window
15 {
16     private readonly FileSource _fileSource = new FileSource();
17 
18     public MainWindow()
19     {
20         InitializeComponent();
21     }
22 
23     private void BrowseButton_Click(object sender, RoutedEventArgs e)
24     {
25         string? folder = _fileSource.SelectDirectory();      // ← new
26         if (folder != null)                                   // ← new
27         {                                                     // ← new
28             FolderPathText.Text = folder;                     // ← new
29         }                                                     // ← new
30     }
31 }
```

`BrowseButton_Click` no longer constructs or touches `OpenFolderDialog` at
all — every trace of it is gone from `MainWindow.xaml.cs` entirely, moved
into `FileSource.cs` for good. This method's whole job now is: ask
`_fileSource` for a folder, and if it got a real one, show it.

### Mechanical Walkthrough

1. `string? folder = _fileSource.SelectDirectory();` — declares a local
   variable `folder` of type **`string?`** (Header above), assigned the
   result of calling **`FileSource.SelectDirectory()`** (Header above) on
   the `_fileSource` field (this lesson's previous Concept Unit). This is
   an ordinary instance method call reached through a field instead of a
   freshly-constructed local — mechanically identical to calling a method
   on any other object reference, just one that happens to have been
   created once, earlier, and stored.
2. `if (folder != null)` — the **`if` statement** (Header above), its
   condition using the **inequality operator `!=`** (Header above):
   `folder != null` evaluates to `true` exactly when `folder` holds a real
   string, and `false` when it holds `null` — the direct mirror of this
   project's own earlier `result == true` check, now testing a `string?`
   against `null` instead of a `bool?` against `true`, because `string?`'s
   two real outcomes are "a value" and "no value," not "yes" and "no."
3. `FolderPathText.Text = folder;` — inside the `if` block: **`TextBlock.
   Text`** (Header above) is assigned the value of the local variable
   `folder` — guaranteed, by the `if` check just above it, to be a real,
   non-null string at this exact point, even though its declared type is
   still `string?`. This is the same property, on the same named field,
   this project's own earlier version of this method already wrote to
   directly from `dialog.FolderName` — the only thing that changed is
   what's on the right-hand side of the assignment.

### CS Lens

This is **message passing between collaborating objects**: `MainWindow`
doesn't know or care *how* `_fileSource` decides which folder to report —
it only knows it can ask, via `SelectDirectory()`, and trusts the answer.
This is the concrete, finished shape of "classes as collaborators," the
idea this lesson's every earlier Concept Unit has been building toward.
Also recognized in: a manager asking a specialist employee to handle a
task and waiting for a report back, without needing to know that
employee's own exact process; a restaurant's waiter taking an order to the
kitchen rather than cooking it personally, and carrying the finished plate
back out; a general contractor coordinating electricians and plumbers as
separate collaborators rather than being licensed to do every trade
personally.

### SE Lens

The alternative — the one this entire lesson exists to move away from — is
`BrowseButton_Click` doing every step itself, the way this event handler
originally did. The real cost that alternative was quietly paying, even
though it worked correctly: nothing about "how do we pick a folder" could
be tested, reused, or changed without also involving an actual
`MainWindow`, an actual `Button`, an actual click. After this unit,
`SelectDirectory()` is a plain method on a plain object — callable, in
principle, from a unit test, a console program, or a completely different
UI, with nothing about `Button`, `Click`, or `TextBlock` anywhere near it.
The cost paid to get there: one extra class, one extra field, and this
unit's own two-line translation from "a nullable string came back" to
"does the UI need to react."

### Commands Needed

None beyond this lesson's one shared `dotnet build`, run once, covering
every Concept Unit's changes together — shown next.

### Run It

Real, captured output from running `dotnet build` against this lesson's
complete, final `FileSource.cs` and `MainWindow.xaml.cs` (.NET SDK
10.0.301), unedited:

```
Determining projects to restore...
All projects are up-to-date for restore.
MastercamGenerator -> <project>\bin\Debug\net10.0-windows\MastercamGenerator.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:01.68
```

This one real build covers every Concept Unit in this lesson at once — the
new `FileSource` class, its `SelectDirectory()` method, the relocated
dialog logic, the `readonly` field, and this unit's own rewritten
`BrowseButton_Click` all compiled together, in a single pass, per this
curriculum's own batching practice.

### Connecting Back

Every earlier Concept Unit in this lesson built one piece of a chain this
unit finally closes: a plain class (first unit) gave application logic a
home with no WPF obligations; a method that returns a value (second unit)
gave that class a way to answer a question; relocating the real dialog
logic (third unit) gave that method a real answer to give; a stored field
(fourth unit) gave `MainWindow` a permanent way to reach it. This unit is
what actually asks the question and acts on the answer — completing the
exact architectural move this lesson opened by promising: the same
visible feature built before, with the logic behind it now living
somewhere UI code doesn't have to know the details of.

---

## Connect the Pieces

Trace one concrete action — a user clicking "Browse" and picking a real
folder — through every piece this lesson built, start to finish:

1. The user clicks the `Button` labeled `"Browse"` — the exact same
   `Button`, with the exact same `Click="BrowseButton_Click"` wiring,
   already proven real; nothing about the button or its wiring changed in
   this lesson at all.
2. `BrowseButton_Click` (this lesson's fifth Concept Unit) runs. Its first
   line calls `_fileSource.SelectDirectory()` — reaching through the
   `readonly` field this lesson's fourth Concept Unit added, to the one
   `FileSource` object created when this `MainWindow` was constructed.
3. Inside `SelectDirectory()` (this lesson's second and third Concept
   Units), a new `Microsoft.Win32.OpenFolderDialog` is constructed and
   `ShowDialog()` is called — the same blocking call already proven to
   pause execution until the user closes the real OS dialog.
4. The user picks a real folder and confirms. `ShowDialog()` returns
   `true`; `dialog.FolderName` now holds the real, chosen path.
   `SelectDirectory()`'s `if (result == true)` block runs its `return
   dialog.FolderName;` — a **return statement** (this lesson's second
   Concept Unit) that ends `SelectDirectory()` immediately, handing that
   path back to whatever called it.
5. Back inside `BrowseButton_Click`, the local variable `folder` now holds
   that same path — `SelectDirectory()`'s return value is exactly what a
   method call *is*, evaluated to a real value the instant the call
   returns.
6. `if (folder != null)` (this lesson's fifth Concept Unit) evaluates
   `true`, since `folder` really does hold a string, and the one line
   inside it runs: `FolderPathText.Text = folder;`.
7. `FolderPathText` — this project's own named, generated field — has its
   `Text` property reassigned, and WPF's own rendering redraws it on
   screen with the new text, exactly as it always has.

The window the user sees behaves identically to how it behaved before this
lesson began — the entire point of this lesson. What changed is invisible
from the outside and everything on the inside: a plain class with no
framework obligations now owns the decision of how a folder gets picked,
`MainWindow` owns only the decision of what to do with the answer, and the
two communicate through exactly one method call and one return value — the
dependency boundary this lesson exists to draw.

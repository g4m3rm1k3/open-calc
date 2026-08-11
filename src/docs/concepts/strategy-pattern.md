# Concept: The Strategy Pattern

**What you'll understand by the end:** how to encapsulate an
interchangeable algorithm or piece of behavior behind a common
interface, so the code that *uses* it can swap in a different
implementation without changing a single line of its own logic — and
why that's different from just writing an `if`/`else` that picks
between a few hardcoded behaviors inline.

**Prerequisites:** none beyond knowing what an interface is (a
contract a class agrees to implement, with no implementation of its
own).

## Setup

```
dotnet new console -o lab-strategy
cd lab-strategy
```

Replace the generated `Program.cs`'s contents with the example below.

## The Problem

Some behavior genuinely varies — how a price gets discounted, how a
collection gets sorted, how a file gets compressed — and the code that
*needs* that behavior often shouldn't have to know, or care, which
specific variant is currently in effect. Writing that choice as a
direct `if (discountType == "tenPercent") { ... } else if
(discountType == "none") { ... }` inline works at first, but every new
variant means editing that same block again, and the deciding code and
the actual algorithms stay permanently tangled together in one place.

## The Isolated Example

```csharp
IDiscountStrategy noDiscount = new NoDiscount();
IDiscountStrategy tenPercentOff = new TenPercentOff();

Cart regularCart = new Cart(noDiscount);
Cart discountedCart = new Cart(tenPercentOff);

Console.WriteLine($"Regular checkout: {regularCart.Checkout(100m)}");
Console.WriteLine($"Discounted checkout: {discountedCart.Checkout(100m)}");

interface IDiscountStrategy
{
    decimal Apply(decimal price);
}

class NoDiscount : IDiscountStrategy
{
    public decimal Apply(decimal price) => price;
}

class TenPercentOff : IDiscountStrategy
{
    public decimal Apply(decimal price) => price * 0.9m;
}

class Cart
{
    private readonly IDiscountStrategy discount;

    public Cart(IDiscountStrategy discount)
    {
        this.discount = discount;
    }

    public decimal Checkout(decimal price)
    {
        return discount.Apply(price);
    }
}
```

**Real output — `dotnet run`:**
```
Regular checkout: 100
Discounted checkout: 90.0
```

**What this proves:** `Cart` never mentions `NoDiscount` or
`TenPercentOff` by name anywhere in its own code — it only knows about
`IDiscountStrategy`, the shared interface. `regularCart` and
`discountedCart` run through the exact same `Checkout` method, with
the exact same line of code (`discount.Apply(price)`), and produce two
genuinely different results — `100` versus `90.0` — purely because a
different object was handed in through the constructor. Nothing inside
`Cart` branches on "which discount is this."

## Mechanical Walkthrough

- `interface IDiscountStrategy { decimal Apply(decimal price); }` — the
  shared contract every interchangeable behavior agrees to implement:
  one method, one signature, no implementation of its own.
- `class NoDiscount : IDiscountStrategy` / `class TenPercentOff :
  IDiscountStrategy` — two independent, concrete implementations of
  that same contract, each with genuinely different logic inside
  `Apply`, neither one aware the other exists.
- `private readonly IDiscountStrategy discount;` — `Cart` holds a
  reference typed as the *interface*, not as any specific
  implementing class — this is the field that makes the swap possible;
  if it were typed `TenPercentOff` instead, `Cart` could never hold a
  `NoDiscount` at all.
- `public Cart(IDiscountStrategy discount) { this.discount = discount;
  }` — the strategy is handed in from outside, at construction time,
  rather than `Cart` deciding internally which one to build. This
  specific way of supplying a dependency from outside instead of
  constructing it internally is itself a broader, separately-named
  idea — dependency injection — being put to use here in its simplest
  possible form, a constructor parameter.
- `discount.Apply(price)` — `Cart` calls the interface method by name,
  with no knowledge of, or branching on, which concrete class is
  actually behind `discount` at this specific call. This one line
  behaves differently for `regularCart` and `discountedCart` purely
  because of which object was passed to each one's constructor.

## CS Lens

This is the **Strategy** design pattern (one of the original "Gang of
Four" design patterns): define a family of interchangeable algorithms,
each behind the same interface, and let the algorithm be selected and
supplied independently of the code that uses it. The defining trait
that separates it from just "using an interface" in general: the
interface's whole purpose here is packaging a *behavior* — one method,
usually, doing one substitutable thing — not modeling a real-world
kind of object with many responsibilities.

Also recognized in: a sort function accepting a custom comparison
function or comparator object so the same sort logic works for
ascending, descending, or any custom order; a compression library
letting the caller choose which specific compression algorithm to use
behind one shared `Compress`/`Decompress` interface; a payment system
selecting between different fraud-check strategies at runtime based on
transaction size or region, without the checkout code itself
containing any of that decision logic; a game character's
interchangeable "movement strategy" (walking, flying, swimming) all
implementing the same `Move` interface, swapped based on current
terrain.

## SE Lens

Why not just use an `if`/`else` (or a `switch`) inside `Cart.Checkout`
directly, picking the discount logic inline? Because every new
variant added that way means editing `Cart` itself again — a class
that, conceptually, has nothing to do with *how* a discount is
calculated, only that one gets applied. Strategy inverts that: adding
a brand-new discount is a new class implementing `IDiscountStrategy`,
with zero changes to `Cart` at all. The real cost: for genuinely only
two or three variants that will basically never grow, a Strategy
object plus an interface is more ceremony than a short `if`/`else`
would have been — the pattern earns its cost specifically when the
number of variants is expected to grow, when different callers need
different variants simultaneously (as `regularCart` and
`discountedCart` do, side by side, in the same run), or when the
variant needs to be swapped at runtime rather than fixed at compile
time.

## Connection

Strategy is frequently supplied through a constructor parameter, as
shown here — the same basic shape as dependency injection generally,
just applied specifically to swapping *behavior* rather than swapping
a whole collaborating service. It pairs naturally with an interface
that declares exactly one method (a natural fit for C#'s functional-
interface-style lambda shorthand, where a caller can supply `price =>
price * 0.9m` directly instead of writing a whole named class, when
the language and situation allow it).

## Try It Yourself

1. Add a third implementation, `HalfOff : IDiscountStrategy`, and a
   third `Cart` built with it — confirm `Cart`'s own source code needs
   zero changes to support the new variant.
2. Change `Cart`'s field from `private readonly IDiscountStrategy
   discount` to a `public` property with a `set`, and add a method
   `SwapDiscount(IDiscountStrategy newStrategy)` that reassigns it —
   confirm the *same* `Cart` instance produces a different result on
   `Checkout` before and after the swap, proving the strategy can
   change at runtime, not just once at construction.
3. Write a version of `IDiscountStrategy` with two methods instead of
   one (say, `Apply` and `Describe`), and reason about, in your own
   words, at what point adding more responsibilities to the interface
   stops being "one substitutable behavior" and starts looking like
   modeling a real object's full role instead — where you'd personally
   draw that line.

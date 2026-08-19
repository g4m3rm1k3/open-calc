# Lesson 6b: Defining Your Own Classes and Objects

> Written under the same tight usage budget as Lesson 7 — compressed
> the same way: no execution trace, no CS/SE lens, short exercises.
> This lesson exists specifically to fill the gap Lesson 7 flagged: it
> used classes Free Pascal's libraries already define, before this
> series ever explained what a class actually is. Read this one first
> if you're going through the series in order — it now belongs right
> before Lesson 7, even though it was written after it.

**What you will build:** A small class of your own — `TCounter`, an
object that holds a running count and knows how to increment and
report it — enough to understand exactly what Lesson 7's `TJSONObject`
and `TXMLDocument` actually are: ordinary classes, not built-in magic.

**What you need to know first:** Lesson 2 — procedures and functions,
including the classic `FunctionName := value;` return convention, reused
below. Lesson 5 — `var` parameters, referenced for contrast.

**Terms used in this lesson:**
- **Class** — a type that bundles data (**fields**) and the routines
  that operate on that data (**methods**) into one declaration. A class
  is a blueprint, not a running thing by itself — nothing exists until
  an actual **object** is created from it.
- **Object** (also "instance") — one concrete thing built from a
  class's blueprint, existing in memory with its own copy of the
  class's fields. Many separate objects can be created from the same
  class, each with independent field values — this lesson creates only
  one.
- **Field** — a variable declared inside a class, holding one piece of
  data that belongs to each object made from that class.
- **Method** — a procedure or function declared inside a class,
  operating on one specific object's fields. Called with dot notation
  on an object (`c.Increment`), not by name alone — full treatment
  restated here even though Lesson 7 already introduced the word,
  since this lesson is where methods are actually defined for the
  first time, not just called.
- **Constructor** — a special method responsible for setting up a
  brand-new object's fields to valid starting values the moment it's
  created. Conventionally named `Create` in Pascal — not a language
  keyword requirement, but a near-universal convention this lesson
  follows.
- **`private` / `public`** — visibility sections inside a class
  declaration. `private` members can only be used by the class's own
  methods; `public` members can be used from anywhere the object is
  visible. This exists to let a class hide its internal data (`count`,
  below) and expose only the operations meant to be used from outside
  (`Increment`, `Value`) — a caller can change the count only by
  calling `Increment`, never by reaching into the field directly.

**Objects and methods used:**
- **`TCounter`** (this lesson's own class) —
  - *What it is:* a class holding a single running count.
  - *Implementation:* one `private` field (`count: integer`), and
    three `public` members: a constructor (`Create`), a procedure
    (`Increment`), and a function (`Value`).
  - *Its use:* the smallest possible class that still has real state
    and real behavior, built specifically to be traced by hand.
- **`Create`** —
  - *What it is:* `TCounter`'s constructor, defined above.
  - *Implementation:* `constructor Create;` — takes no parameters
    here; sets `count` to `0`.
  - *Its use:* called once, to bring a `TCounter` object into
    existence with a known starting value — never called any other
    way.

---

## The Problem

Lesson 7 used `TJSONObject` and `TXMLDocument` — real classes — without
this series ever explaining what a class actually is, or how to build
one. That's backwards: those classes aren't special, they're built the
same way any class is, and seeing one built from scratch is what makes
the earlier lesson's `.Get(...)` and `.Free` calls stop looking like
unexplained magic.

## The Code

```pascal
program Classes;
type
  TCounter = class
  private
    count: integer;
  public
    constructor Create;
    procedure Increment;
    function Value: integer;
  end;

constructor TCounter.Create;
begin
  count := 0;
end;

procedure TCounter.Increment;
begin
  count := count + 1;
end;

function TCounter.Value: integer;
begin
  Value := count;
end;

var
  c: TCounter;
begin
  c := TCounter.Create;
  c.Increment;
  c.Increment;
  c.Increment;
  writeln('Count: ', c.Value);
  c.Free;
end.
```

## Walkthrough

`type TCounter = class ... end;` is the **class** declaration itself —
`TCounter` is now a type name, exactly like `integer` or `string` are
type names, except this one was just defined by this program rather
than built into the language.

`private count: integer;` declares a **field**: every `TCounter`
object will have its own `count`, and per `private`'s definition above,
only `TCounter`'s own methods (below) can read or write it directly —
the main program's `begin...end` block, further down, cannot write
`c.count := 5;` even though `c` is a `TCounter`.

`public constructor Create; procedure Increment; function Value:
integer;` declares three **methods**, all reachable from outside the
class, per `public`'s definition above — these three, together, are
the *only* way any code outside `TCounter` itself can interact with a
`TCounter` object.

`constructor TCounter.Create; begin count := 0; end;` is where
`Create`'s body actually lives — declared inside the class, defined
separately outside it, using the `TCounter.Create` prefix to say which
class's `Create` this is. The body sets `count` to `0`, guaranteeing
every new `TCounter` starts from a known value rather than whatever
memory happened to contain beforehand.

`procedure TCounter.Increment; begin count := count + 1; end;` reads
and writes `count` directly — legal here specifically because this
code *is* one of `TCounter`'s own methods; the same access from outside
the class would be rejected by the compiler, per `private`.

`function TCounter.Value: integer; begin Value := count; end;` reuses
Lesson 2's classic function-return convention in full: assigning to the
function's own name (`Value := count;`) is what makes `count`'s current
value the thing this function call produces — no separate `return`
keyword, same mechanism `Square` used in Lesson 2.

`var c: TCounter;` declares a variable of the class type — same
reference semantics Lesson 7 already touched: `c` doesn't hold a
`TCounter`'s data directly, it holds a reference to one, and right now
that reference points to nothing at all yet.

`c := TCounter.Create;` calls `Create` *on the type itself*
(`TCounter.Create`), not on an existing object — this is the one moment
where that's correct, because no object exists yet for `c` to call a
method on. This single call does two things: allocates a brand-new
`TCounter` object in memory, and runs `Create`'s body (`count := 0;`)
on it. The resulting reference is stored into `c`.

`c.Increment;` called three times in a row calls `Increment` *on the
object `c` refers to* — dot notation on an actual instance now, not on
the type. Each call runs `count := count + 1;` against that same
object's `count`, so after three calls, `count` is `3`.

`writeln('Count: ', c.Value);` calls `c.Value`, which returns the
current `count` (`3`), and prints it using the same multi-argument
`writeln` from every earlier lesson.

`c.Free;` releases the object's memory — inherited automatically by
every Pascal class from a common base class (`TObject`), which is why
`TCounter` gets a working `Free` without ever writing one itself. Same
reasoning as Lesson 7's `data.Free`/`doc.Free`: Pascal classes are
allocated dynamically and are not cleaned up automatically when a
variable goes out of scope, so skipping `Free` leaks that memory.

## Expected Output

```
Count: 3
```

Not run this session.

## Try It Yourself

- Add a second field, `step: integer`, set by a second constructor
  parameter (`constructor Create(startStep: integer);`), and have
  `Increment` add `step` instead of a hardcoded `1`.
- Try writing `c.count := 10;` directly in the main program's
  `begin...end` block, outside `TCounter`, and recompile — read the
  compiler's error message; it's `private` actually being enforced, not
  just a naming convention.
- Create a second object, `c2 := TCounter.Create;`, increment it a
  different number of times than `c`, and print both — confirm each
  object really does keep its own independent `count`.

**Next:** back to `lesson-7-reading-json-and-xml.md`, which this lesson
now properly precedes — see `HANDOFF.md` for what's still ahead.

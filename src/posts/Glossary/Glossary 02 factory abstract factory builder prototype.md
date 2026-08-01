# Objects That Create Other Objects: Factory, Abstract Factory, Builder, Prototype

## What you will build

Four small, runnable programs — one per pattern — in both Python and
TypeScript, showing different answers to one question: "what's the best way
to create an object, when just calling its constructor directly isn't good
enough?" By the end you'll recognize why a codebase has a class named
`ShapeFactory` or `RequestBuilder` instead of just calling `new Shape(...)`
or `new Request(...)` everywhere.

## What you need to know first

This post assumes comfort with basic Python (variables, functions, classes)
and nothing else. No TypeScript is assumed — every piece of new syntax is
explained at first use, from scratch. This post stands alone and doesn't
depend on any other post in this series, including the previous one on
Proxy/Decorator/Adapter/Facade/Wrapper — if you've read that post, some
TypeScript syntax here (`interface`, `private`, type annotations) will look
familiar, and that's fine; it's explained fully again here regardless.

## Setting up to run TypeScript

As in other posts in this series: TypeScript doesn't run directly. It's
**compiled** first by a program called `tsc` (the TypeScript compiler) into
plain JavaScript, which is then run by **Node.js** (a program that runs
JavaScript outside of a web browser, on your own machine). The workflow for
every TypeScript example below is two commands:

```
npx tsc filename.ts
node filename.js
```

`npx` runs a Node.js tool without needing a separate, permanent install
step first. `tsc filename.ts` reads your TypeScript file, checks it for
type errors, and — if there are none — produces a plain `.js` file in the
same folder. `node filename.js` then runs that file, the same way
`python3 filename.py` runs a Python file.

---

## Pattern 1: Factory

**The problem.** Suppose you're building a small drawing program, and you
need to create different shapes — circles, squares — depending on some
runtime decision (user input, a configuration setting, data read from a
file). Directly calling `Circle()` or `Square()` everywhere this decision
needs to be made means the _decision logic_ (which shape to build, based on
what condition) gets scattered across your codebase, copy-pasted wherever a
shape needs to be created.

### Python

First, the shapes themselves:

```python
class Circle:
    def draw(self):
        print("Drawing a circle")


class Square:
    def draw(self):
        print("Drawing a square")
```

Without a factory, code that needs to create a shape based on a string
might look like this, repeated everywhere a shape is needed:

```python
shape_type = "circle"

if shape_type == "circle":
    shape = Circle()
elif shape_type == "square":
    shape = Square()
else:
    raise ValueError(f"Unknown shape type: {shape_type}")

shape.draw()
```

```
Drawing a circle
```

**Walkthrough:** `raise ValueError(...)` is new syntax we haven't covered
yet in this series in depth — `raise` deliberately triggers an error
(rather than waiting for one to happen naturally, like indexing past the
end of a list). `ValueError` is a built-in error type used for "the value
given is the wrong kind of value for this operation" — here, an
unrecognized shape name. We'll cover error handling (`try`/`except`,
catching errors deliberately raised this way) fully in a dedicated post;
for now, just recognize that this line stops the program and reports a
clear problem if `shape_type` doesn't match anything we know how to build.

This `if`/`elif` block works, but imagine it copy-pasted in twenty different
places in a real program. A factory centralizes it:

```python
def create_shape(shape_type):
    if shape_type == "circle":
        return Circle()
    elif shape_type == "square":
        return Square()
    else:
        raise ValueError(f"Unknown shape type: {shape_type}")
```

```python
shape = create_shape("circle")
shape.draw()

shape = create_shape("square")
shape.draw()
```

```
Drawing a circle
Drawing a square
```

**Walkthrough:** `create_shape` is a **factory function** — a function
whose entire job is creating and returning an object, hiding the decision
logic for _which_ concrete type to build behind one call. Every place in
the program that needs a shape now calls `create_shape(shape_type)` instead
of repeating the `if`/`elif` chain. If a new shape type is added later
(say, `Triangle`), there's exactly one place to update: inside
`create_shape` — not twenty scattered call sites.

**CS lens.** This is **encapsulating object creation** — the decision of
_which concrete class to instantiate_ is itself a piece of logic, and the
Factory pattern recognizes that this logic deserves its own home, just like
any other piece of logic would. `Circle()` and `Square()` are still being
called somewhere — the factory doesn't eliminate object creation, it
_relocates_ the decision about which one to create.

**SE lens.** This connects to the **open/closed principle** mentioned in
this series' previous post: adding a new shape type means _adding_ a new
branch inside `create_shape`, not modifying every place that already
creates shapes. It's also a direct application of **separation of
concerns**: code that _uses_ a shape (calling `.draw()`) shouldn't need to
also contain the logic for _deciding which kind of shape to build_ — those
are two different responsibilities, and mixing them together makes both
harder to change independently.

**What breaks without this:** If the `if`/`elif` decision logic is
duplicated in twenty places, and a new shape type is added, missing even
one of those twenty places means that one spot silently can't create the
new shape — a bug that's easy to introduce and hard to notice, because
nothing crashes; that one call site just never produces the new behavior.

### TypeScript

```typescript
interface Shape {
  draw(): void;
}

class Circle implements Shape {
  draw(): void {
    console.log("Drawing a circle");
  }
}

class Square implements Shape {
  draw(): void {
    console.log("Drawing a square");
  }
}
```

**Walkthrough — new syntax.** `interface Shape { draw(): void; }` declares
a contract: anything implementing `Shape` must have a `draw` method that
takes no arguments and returns nothing (`void`). `class Circle implements
Shape` is a promise, checked by the compiler, that `Circle` satisfies that
contract. This means a factory function can promise to return "something
that is a `Shape`" without committing to which concrete class — exactly the
flexibility the Python version got implicitly through duck typing, but here
it's explicit and compiler-checked.

```typescript
function createShape(shapeType: string): Shape {
  if (shapeType === "circle") {
    return new Circle();
  } else if (shapeType === "square") {
    return new Square();
  } else {
    throw new Error(`Unknown shape type: ${shapeType}`);
  }
}
```

**Walkthrough — new syntax.** `function createShape(shapeType: string):
Shape {` declares a function named `createShape`, taking one parameter
`shapeType` of type `string`, and returning something of type `Shape` — the
interface, not a specific concrete class. This return type annotation is
the actual point of a Factory in a statically typed language: callers of
`createShape` are told "you will get back something that can `.draw()`,"
without the function's _signature_ revealing or committing to which
concrete shape that will be. `throw new Error(...)` is TypeScript/
JavaScript's equivalent of Python's `raise ValueError(...)` — `throw`
deliberately signals an error, and `Error` is the built-in base type for
representing one, with a descriptive message.

```typescript
let shape = createShape("circle");
shape.draw();

shape = createShape("square");
shape.draw();
```

```
Drawing a circle
Drawing a square
```

**Walkthrough:** `let shape = ...` — recall from the previous post,
`let` declares a variable that _can_ be reassigned later (unlike `const`).
We need `let` here specifically because the next line reassigns `shape` to
a different value. The type of `shape` is inferred (figured out
automatically by the compiler, without you writing it explicitly) as
`Shape` — TypeScript looked at what `createShape` returns and used that as
`shape`'s type, without you needing to write `let shape: Shape = ...`
yourself. This is called **type inference**, and it's one of the reasons
TypeScript code often looks almost as uncluttered as plain JavaScript
despite being fully type-checked underneath.

---

## Pattern 2: Abstract Factory

**The problem.** A single factory function picks _one_ object based on a
condition. An Abstract Factory is for a related but bigger problem: you
need to create a whole _family_ of related objects that must all match —
for example, UI elements that should all be consistently styled as either
"light mode" or "dark mode," never an accidental mix of both.

### Python

```python
class LightButton:
    def render(self):
        print("Rendering a light-themed button")


class LightCheckbox:
    def render(self):
        print("Rendering a light-themed checkbox")


class DarkButton:
    def render(self):
        print("Rendering a dark-themed button")


class DarkCheckbox:
    def render(self):
        print("Rendering a dark-themed checkbox")
```

Without an abstract factory, code creating a themed UI risks mixing themes
by mistake — nothing stops you from accidentally writing `LightButton()`
next to `DarkCheckbox()`. The Abstract Factory pattern groups _creation
itself_ by theme:

```python
class LightThemeFactory:
    def create_button(self):
        return LightButton()

    def create_checkbox(self):
        return LightCheckbox()


class DarkThemeFactory:
    def create_button(self):
        return DarkButton()

    def create_checkbox(self):
        return DarkCheckbox()
```

```python
def build_ui(factory):
    button = factory.create_button()
    checkbox = factory.create_checkbox()
    button.render()
    checkbox.render()
```

```python
build_ui(LightThemeFactory())
print("---")
build_ui(DarkThemeFactory())
```

```
Rendering a light-themed button
Rendering a light-themed checkbox
---
Rendering a dark-themed button
Rendering a dark-themed checkbox
```

**Walkthrough:** `build_ui` takes a _factory itself_ as its argument — not
a theme name as a string, and not the individual UI pieces directly. It
calls `factory.create_button()` and `factory.create_checkbox()` without
ever knowing or caring whether it's holding a `LightThemeFactory` or a
`DarkThemeFactory` — and because both factories expose the same two method
names, `build_ui` works identically regardless of which one it's given.
Crucially: `build_ui` has _no way_ to accidentally request a light button
alongside a dark checkbox — whichever factory it receives, every object it
creates from that factory belongs to the same matching family.

**CS lens — how is this different from a plain Factory?** A plain Factory
(Pattern 1) is one function deciding between several _unrelated_
alternatives (a circle or a square — there's no requirement that they
relate to each other). An Abstract Factory is itself an _object_ (not a
single function) that groups together creation methods for _multiple
related things that must stay consistent with each other_ — buttons and
checkboxes that must always match in theme. The "abstract" in the name
refers to the fact that `build_ui` depends only on the _shape_ of a
factory (something with `.create_button()` and `.create_checkbox()`), not
on any one concrete factory class.

**SE lens.** This is a direct application of **dependency inversion** — a
principle that says high-level code (`build_ui`) should depend on
abstractions (the general idea "a factory with these two methods"), not on
concrete, specific implementations (`LightThemeFactory` by name). `build_ui`
never imports or mentions `LightButton` or `DarkCheckbox` directly — it only
knows about the _factory's_ interface. This means a brand new theme
(`HighContrastThemeFactory`) can be introduced and immediately used by
`build_ui` with zero changes to `build_ui` itself.

**What breaks without this:** Without grouping creation by family, nothing
stops a typo or a copy-paste mistake from creating `LightButton()` next to
`DarkCheckbox()` somewhere in a large codebase — a bug that's purely
visual/cosmetic and easy to miss in testing, but jarring and unprofessional
in front of an actual user.

### TypeScript

```typescript
interface Button {
  render(): void;
}
interface Checkbox {
  render(): void;
}

class LightButton implements Button {
  render(): void {
    console.log("Rendering a light-themed button");
  }
}
class LightCheckbox implements Checkbox {
  render(): void {
    console.log("Rendering a light-themed checkbox");
  }
}
class DarkButton implements Button {
  render(): void {
    console.log("Rendering a dark-themed button");
  }
}
class DarkCheckbox implements Checkbox {
  render(): void {
    console.log("Rendering a dark-themed checkbox");
  }
}

interface ThemeFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

class LightThemeFactory implements ThemeFactory {
  createButton(): Button {
    return new LightButton();
  }
  createCheckbox(): Checkbox {
    return new LightCheckbox();
  }
}

class DarkThemeFactory implements ThemeFactory {
  createButton(): Button {
    return new DarkButton();
  }
  createCheckbox(): Checkbox {
    return new DarkCheckbox();
  }
}
```

**Walkthrough — new syntax.** `interface ThemeFactory { createButton():
Button; createCheckbox(): Checkbox; }` is the explicit, compiler-checked
version of "a factory with these two methods" that the Python version only
expressed implicitly through duck typing. Any class claiming
`implements ThemeFactory` is verified by the compiler to actually provide
both methods, with the right return types.

```typescript
function buildUi(factory: ThemeFactory): void {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  button.render();
  checkbox.render();
}

buildUi(new LightThemeFactory());
console.log("---");
buildUi(new DarkThemeFactory());
```

```
Rendering a light-themed button
Rendering a light-themed checkbox
---
Rendering a dark-themed button
Rendering a dark-themed checkbox
```

**Walkthrough:** `function buildUi(factory: ThemeFactory): void` — the
parameter type, `ThemeFactory`, is the _interface_, not either concrete
factory class. This is dependency inversion made literal in the function's
own signature: TypeScript will accept _any_ object implementing
`ThemeFactory`, including ones that don't exist yet at the time `buildUi`
was written.

---

## Pattern 3: Builder

**The problem.** Some objects have many optional pieces of configuration —
a constructor with ten optional parameters becomes unreadable and
error-prone (did the 6th argument mean width or height? what if you only
want to set 3 of the 10?). The Builder pattern constructs a complex object
step by step, one piece at a time, instead of all at once through a single
giant constructor call.

### Python

Imagine building a configurable HTTP request:

```python
class HttpRequest:
    def __init__(self):
        self.method = "GET"
        self.url = ""
        self.headers = {}
        self.body = None

    def __str__(self):
        return f"{self.method} {self.url}\nHeaders: {self.headers}\nBody: {self.body}"
```

**Walkthrough:** `__str__` is another dunder method (recall from the
previous post: double-underscore methods Python treats specially). It
defines what `str(some_request)` — and, implicitly, `print(some_request)` —
should produce: a human-readable description of the object, instead of the
default, unhelpful `<__main__.HttpRequest object at 0x...>` you'd otherwise
get.

Building this object directly works, but gets unwieldy as more fields are
involved:

```python
request = HttpRequest()
request.method = "POST"
request.url = "https://api.example.com/users"
request.headers = {"Content-Type": "application/json"}
request.body = '{"name": "Alice"}'

print(request)
```

```
POST https://api.example.com/users
Headers: {'Content-Type': 'application/json'}
Body: {"name": "Alice"}
```

This works, but every piece of code constructing a request needs to know
all four field names directly, with no guidance on what's required versus
optional, and no validation that the result makes sense before it's used. A
Builder wraps this process:

```python
class HttpRequestBuilder:
    def __init__(self):
        self._request = HttpRequest()

    def set_method(self, method):
        self._request.method = method
        return self

    def set_url(self, url):
        self._request.url = url
        return self

    def add_header(self, key, value):
        self._request.headers[key] = value
        return self

    def set_body(self, body):
        self._request.body = body
        return self

    def build(self):
        return self._request
```

```python
request = (
    HttpRequestBuilder()
    .set_method("POST")
    .set_url("https://api.example.com/users")
    .add_header("Content-Type", "application/json")
    .set_body('{"name": "Alice"}')
    .build()
)

print(request)
```

```
POST https://api.example.com/users
Headers: {'Content-Type': 'application/json'}
Body: {"name": "Alice"}
```

**Walkthrough:** Each method on `HttpRequestBuilder` (`set_method`,
`set_url`, `add_header`, `set_body`) modifies the request being built, and
then **returns `self`** — the builder instance itself. This is what makes
the chained, dotted syntax above possible: `.set_method("POST")` returns the
same builder, so `.set_url(...)` can be called directly on that result, and
so on. This chaining style is called a **fluent interface** — each call
reads almost like a sentence describing the steps being taken, and the
parentheses around the whole expression let it span multiple lines cleanly.
Finally, `.build()` returns the finished `HttpRequest`, not the builder
itself — signaling "construction is done, here's your actual object."

**CS lens.** The accumulator pattern from earlier in this series — start
with something, add to it incrementally, get a final result — applies here
too, just with an object's fields instead of a list or a running total. The
builder is itself the accumulator: it starts holding a near-empty
`HttpRequest`, and each chained call adds one more piece before `.build()`
hands over the finished result.

**SE lens.** Notice the builder doesn't expose the request's fields
directly for outside code to poke at arbitrarily — it exposes specific,
named _operations_ (`set_method`, `add_header`) that represent meaningful
steps in constructing a valid request. This means the builder can, in
principle, validate or enforce rules as each piece is added (e.g., reject
an invalid HTTP method) — something a plain constructor with positional
arguments has no natural place to do. This is also why builders are common
for objects with many optional pieces: you only call the methods for the
parts you actually want to set, in any order, rather than needing to pass
`None` or some default placeholder for every field you don't care about.

**What breaks without this:** A constructor like
`HttpRequest("POST", "https://...", {"Content-Type": "application/json"},
'{"name": "Alice"}', None, False, 30)` — with seven positional arguments —
requires every caller to remember the exact order and meaning of every
position, and a single misplaced argument silently produces a broken
request with no error at all, since most of these would be syntactically
valid in any order Python accepts.

### TypeScript

```typescript
class HttpRequest {
  method: string = "GET";
  url: string = "";
  headers: Record<string, string> = {};
  body: string | null = null;

  toString(): string {
    return `${this.method} ${this.url}\nHeaders: ${JSON.stringify(this.headers)}\nBody: ${this.body}`;
  }
}
```

**Walkthrough — new syntax.** `method: string = "GET";` declares a
property with both a type annotation (`: string`) and a default value
(`= "GET"`) in one line — if a new `HttpRequest` is created and `method` is
never set, it starts as `"GET"`. `Record<string, string>` — recall this
type from earlier in this series' Python-basics posts if you've read them,
or take it fresh here: it describes an object where every key is a
`string` and every value is also a `string` — the TypeScript equivalent of
Python's `dict` with string keys and string values. `body: string | null`
is the union type from the previous post — `body` can be a `string` or
specifically `null` (meaning "no body set"), nothing else. `toString()` is
TypeScript/JavaScript's equivalent of Python's `__str__` — it's a method
name that, when defined, JavaScript automatically calls when the object
needs to be converted to a string (for example, inside a template literal,
which is what the backtick-delimited string with `${}` placeholders is
called — you've seen these throughout this series as the TypeScript
equivalent of Python's f-strings). `JSON.stringify(this.headers)` converts
the headers object into a readable string representation — roughly the
TypeScript equivalent of how Python's `print()` automatically formats a
dict nicely; JavaScript needs to be told explicitly to do this conversion.

```typescript
class HttpRequestBuilder {
  private request: HttpRequest;

  constructor() {
    this.request = new HttpRequest();
  }

  setMethod(method: string): HttpRequestBuilder {
    this.request.method = method;
    return this;
  }

  setUrl(url: string): HttpRequestBuilder {
    this.request.url = url;
    return this;
  }

  addHeader(key: string, value: string): HttpRequestBuilder {
    this.request.headers[key] = value;
    return this;
  }

  setBody(body: string): HttpRequestBuilder {
    this.request.body = body;
    return this;
  }

  build(): HttpRequest {
    return this.request;
  }
}
```

**Walkthrough:** `setMethod(method: string): HttpRequestBuilder` — the
return type annotation, `HttpRequestBuilder`, makes the fluent-chaining
contract explicit and compiler-checked: TypeScript verifies that `return
this;` really does match the promised return type. If you forgot a
`return this;` in one of these methods, the function would implicitly
return `undefined` (JavaScript's version of "nothing"), and the compiler
would catch the mismatch against the declared `HttpRequestBuilder` return
type immediately, before the program ever ran.

```typescript
const request = new HttpRequestBuilder()
  .setMethod("POST")
  .setUrl("https://api.example.com/users")
  .addHeader("Content-Type", "application/json")
  .setBody('{"name": "Alice"}')
  .build();

console.log(request.toString());
```

```
POST https://api.example.com/users
Headers: {"Content-Type":"application/json"}
Body: {"name": "Alice"}
```

**Walkthrough:** Identical fluent chain to the Python version. Note
`request.toString()` is called explicitly here, rather than relying on
`console.log` to call it automatically — `console.log` on an object will
sometimes print its own default representation rather than calling
`toString()`, so calling it explicitly guarantees the output you intend.

---

## Pattern 4: Prototype

**The problem.** Sometimes creating a new object from scratch is more
expensive or more complex than copying an existing, already-configured
one and just tweaking the copy. The Prototype pattern is exactly this:
clone an existing object rather than building a new one from its
constructor.

### Python

```python
import copy


class GameCharacter:
    def __init__(self, name, health, weapon, inventory):
        self.name = name
        self.health = health
        self.weapon = weapon
        self.inventory = inventory

    def __str__(self):
        return f"{self.name}: {self.health}hp, {self.weapon}, carrying {self.inventory}"
```

**Walkthrough — new syntax.** `import copy` brings in Python's built-in
`copy` module — a piece of pre-written functionality, included with
Python, that you must explicitly request access to before using (we'll
cover the import system and modules fully in a dedicated post; for now,
recognize that `import` is how you gain access to functionality that
isn't automatically available, the same way `print` and `len` are always
available but `copy.deepcopy` is not until imported).

```python
goblin_template = GameCharacter("Goblin", 30, "Dagger", ["gold coin"])

goblin1 = copy.deepcopy(goblin_template)
goblin1.name = "Goblin #1"

goblin2 = copy.deepcopy(goblin_template)
goblin2.name = "Goblin #2"
goblin2.health = 25

print(goblin_template)
print(goblin1)
print(goblin2)
```

```
Goblin: 30hp, Dagger, carrying ['gold coin']
Goblin #1: 30hp, Dagger, carrying ['gold coin']
Goblin #2: 25hp, Dagger, carrying ['gold coin']
```

**Walkthrough:** `copy.deepcopy(goblin_template)` produces a brand new,
fully independent `GameCharacter` object with the same starting values as
`goblin_template` — but it is not the _same_ object. Changing `goblin1.name`
afterward has no effect on `goblin_template` or `goblin2`. This is
important specifically because of the shared-reference behavior covered
earlier in this series with mutable types (lists): `goblin_template.inventory`
is a list, and a shallow, careless copy might accidentally leave the copy's
`inventory` pointing at the _same_ underlying list as the original — meaning
a change to one goblin's inventory would unexpectedly show up on all of
them. `deepcopy` specifically guards against this by recursively copying
every mutable piece inside the object, not just the top-level object itself.

**CS lens — why "deep" copy, and what would a "shallow" copy miss?** Try
this to see the danger directly:

```python
shallow = copy.copy(goblin_template)
shallow.inventory.append("shallow's item")
print(goblin_template.inventory)
```

```
['gold coin', "shallow's item"]
```

**Walkthrough of the failure:** `copy.copy()` performs a **shallow copy** —
it creates a new `GameCharacter` object, but `inventory` inside that new
object still points to the _exact same list_ as the original (recall: this
is the shared-reference behavior from this series' post on lists —
assigning a list to a new name doesn't duplicate it, and a shallow copy has
the same limitation for its fields). Appending to `shallow.inventory`
therefore also changes `goblin_template.inventory`, because there's really
only one list in existence, referenced from two different character
objects. `deepcopy` exists specifically to avoid this: it walks through
every nested mutable value and creates independent copies of each one, all
the way down, so no two cloned objects ever accidentally share internal
state.

**SE lens — why clone instead of constructing fresh each time?** If
creating a `GameCharacter` from scratch involved expensive setup — loading
data from a file, complex randomized generation, computation that takes
real time — cloning a pre-built template and adjusting a couple of fields
can be significantly cheaper than redoing that setup from zero every time.
Prototype is also useful simply for convenience: defining one "template"
object with sensible defaults, then producing variations by cloning and
tweaking, rather than re-specifying every field for every new instance.

**What breaks without this:** Using a shallow copy (or no copy at all —
just handing out the same object to multiple parts of a program) when
independent copies were actually needed is a subtle, classic bug: changes
intended for one object silently leak into another that happens to share
some internal mutable state with it, and because nothing crashes, this can
go unnoticed for a long time.

### TypeScript

```typescript
class GameCharacter {
  constructor(
    public name: string,
    public health: number,
    public weapon: string,
    public inventory: string[],
  ) {}

  toString(): string {
    return `${this.name}: ${this.health}hp, ${this.weapon}, carrying ${JSON.stringify(this.inventory)}`;
  }

  clone(): GameCharacter {
    return new GameCharacter(this.name, this.health, this.weapon, [
      ...this.inventory,
    ]);
  }
}
```

**Walkthrough — new syntax.** `constructor(public name: string, public
health: number, ...)` is the same constructor-parameter shorthand from the
previous post's `private coffee: CoffeeLike` example, here using `public`
instead — `public` (the default visibility if none is specified, but
written explicitly here for clarity) means these properties can be accessed
from outside the class, unlike `private`. Each parameter automatically
becomes a property on the class with no separate assignment needed.

`[...this.inventory]` introduces the **spread operator**, `...`. Inside
square brackets, `...this.inventory` means "take every item out of this
array and place them individually into this new array." The result is a
brand new array containing the same items — not the same array object. This
is TypeScript/JavaScript's equivalent of Python's `copy.deepcopy` for an
array specifically (technically this is a _shallow_ copy of the array
itself — if the array contained objects rather than plain strings, those
inner objects would still be shared; for an array of plain strings, as
here, a shallow copy is sufficient because strings, like in Python, are
immutable and can't be accidentally mutated through a shared reference).

```typescript
const goblinTemplate = new GameCharacter("Goblin", 30, "Dagger", ["gold coin"]);

const goblin1 = goblinTemplate.clone();
goblin1.name = "Goblin #1";

const goblin2 = goblinTemplate.clone();
goblin2.name = "Goblin #2";
goblin2.health = 25;

console.log(goblinTemplate.toString());
console.log(goblin1.toString());
console.log(goblin2.toString());
```

```
Goblin: 30hp, Dagger, carrying ["gold coin"]
Goblin #1: 30hp, Dagger, carrying ["gold coin"]
Goblin #2: 25hp, Dagger, carrying ["gold coin"]
```

**Walkthrough:** Here, the clone method lives _on the class itself_
(`.clone()`) rather than being a separate, general-purpose utility function
like Python's `copy` module — this is a common TypeScript/JavaScript
convention: rather than reaching for an external, generic deep-copy
utility, a class that needs to support cloning typically defines its own
`clone()` method that knows exactly which of its fields need independent
copies (here, `inventory`, using the spread operator) and which don't
(`name`, `health`, `weapon` — plain strings and numbers, immutable, safe to
copy by simple assignment).

---

## Connect the pieces

All four patterns in this post answer the same underlying question — "how
should this object actually get created?" — with different answers suited
to different problems. Factory centralizes a _decision_ between several
unrelated alternatives. Abstract Factory centralizes creation of a whole
_matching family_ of related objects, so they can never be mismatched.
Builder breaks construction of one _complex_ object into clear, named,
chainable steps, instead of one overloaded constructor call. Prototype
sidesteps construction almost entirely, producing new objects by _copying_
an existing one — and forces a close look at the shared-mutable-reference
hazard from this series' post on lists, since a careless shallow copy
reintroduces exactly that bug. In TypeScript, every one of these patterns
gains an explicit, compiler-checked interface or return type describing
exactly what's being created or returned — in Python, the same contracts
exist, just enforced by convention and discovered only when something is
actually called.

## What breaks without these patterns

Without this vocabulary, the same problems don't go away — codebases still
need to decide what to construct, still need to keep related objects
consistent with each other, still have objects with many optional pieces of
configuration, and still sometimes need cheap copies of expensive-to-build
objects — they just solve each of these problems inconsistently, often
inventing a slightly different, unnamed approach every time, with no shared
vocabulary to describe the design to someone else reading the code later.

## Definition of done

- [ ] You can explain the difference between a Factory and an Abstract
      Factory in your own words.
- [ ] You've run all four patterns in both Python and TypeScript and
      confirmed the output matches what's shown in this post.
- [ ] You can explain why builder methods return `self` (Python) or `this`
      (TypeScript), and what would happen if one of them forgot to.
- [ ] You've deliberately created the shallow-copy bug in Step "Prototype"
      (Python's `copy.copy()` example) and can explain, using the
      shared-reference concept from earlier in this series, exactly why it
      happens.
- [ ] You can explain what `Record<string, string>` and the spread operator
      `...` do in TypeScript.

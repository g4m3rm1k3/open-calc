# Classic Patterns IV: Interpreter, Bridge, Flyweight

## What you will build

Three runnable programs — one per pattern — in both Python and TypeScript,
covering three patterns that solve very different problems: evaluating a
language or rule set you define yourself (Interpreter), separating an
abstraction from its implementation so both can vary independently
(Bridge), and sharing common data between many objects to save memory
(Flyweight). By the end you'll understand why these patterns exist, what
specific problem each one solves, and where they appear in real systems.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. Interpreter connects to the State Machine from Glossary 09 and the
Composite pattern from Glossary 12; those connections are named below.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Interpreter

The **Interpreter** pattern defines a grammar for a simple language and
provides a way to evaluate sentences in that language. Each rule in the
grammar becomes a class; parsing a sentence builds a tree of those
classes; evaluating the tree produces the result.

### Problem first

Suppose you want users to write simple search filters like `age > 25 AND
salary < 80000` or `city = "London" OR city = "Paris"` — a mini language
with its own rules. You could handle this with a chain of `if` statements
and string parsing, but that approach is brittle and hard to extend. A
more principled approach: define the grammar as a set of expression types,
build a tree from any sentence in that grammar, and evaluate the tree
against actual data.

### Python

```python
class GreaterThanExpression:
    def __init__(self, field, value):
        self._field = field
        self._value = value

    def evaluate(self, record):
        return record.get(self._field, 0) > self._value


class LessThanExpression:
    def __init__(self, field, value):
        self._field = field
        self._value = value

    def evaluate(self, record):
        return record.get(self._field, 0) < self._value


class EqualsExpression:
    def __init__(self, field, value):
        self._field = field
        self._value = value

    def evaluate(self, record):
        return record.get(self._field) == self._value


class AndExpression:
    def __init__(self, left, right):
        self._left  = left
        self._right = right

    def evaluate(self, record):
        return self._left.evaluate(record) and self._right.evaluate(record)


class OrExpression:
    def __init__(self, left, right):
        self._left  = left
        self._right = right

    def evaluate(self, record):
        return self._left.evaluate(record) or self._right.evaluate(record)
```

**Walkthrough:** Each class represents one rule in the grammar. The leaf
expressions (`GreaterThanExpression`, `LessThanExpression`,
`EqualsExpression`) compare a field in a record against a fixed value.
The composite expressions (`AndExpression`, `OrExpression`) combine two
sub-expressions with boolean logic — exactly the Composite pattern from
Glossary 12: `AndExpression` and `OrExpression` are composite nodes whose
children can be either leaf expressions or other composite expressions,
forming a tree of arbitrary depth. `record.get(self._field, 0)` safely
retrieves a field from the record dictionary, defaulting to `0` if the
field doesn't exist — preventing a `KeyError` on missing fields.

```python
employees = [
    {"name": "Alice", "age": 32, "salary": 75_000, "city": "London"},
    {"name": "Bob",   "age": 24, "salary": 55_000, "city": "Paris"},
    {"name": "Carol", "age": 41, "salary": 95_000, "city": "London"},
    {"name": "Dave",  "age": 28, "salary": 62_000, "city": "Berlin"},
    {"name": "Eve",   "age": 35, "salary": 88_000, "city": "Paris"},
]

senior_london = AndExpression(
    GreaterThanExpression("age", 30),
    EqualsExpression("city", "London")
)

affordable_paris = AndExpression(
    EqualsExpression("city", "Paris"),
    LessThanExpression("salary", 70_000)
)

target_cities = OrExpression(
    EqualsExpression("city", "London"),
    EqualsExpression("city", "Paris")
)

print("Senior employees in London (age > 30 AND city = 'London'):")
for emp in employees:
    if senior_london.evaluate(emp):
        print(f"  {emp['name']}")

print("\nAffordable hires in Paris (city = 'Paris' AND salary < 70000):")
for emp in employees:
    if affordable_paris.evaluate(emp):
        print(f"  {emp['name']}")

print("\nEmployees in London or Paris:")
for emp in employees:
    if target_cities.evaluate(emp):
        print(f"  {emp['name']} ({emp['city']})")
```

```
Senior employees in London (age > 30 AND city = 'London'):
  Alice
  Carol

Affordable hires in Paris (city = 'Paris' AND salary < 70000):
  Bob

Employees in London or Paris:
  Alice (London)
  Bob (Paris)
  Carol (London)
  Eve (Paris)
```

**Walkthrough:** `senior_london` is a tree two levels deep:
`AndExpression` at the root, with `GreaterThanExpression("age", 30)` as
the left child and `EqualsExpression("city", "London")` as the right.
When `.evaluate(emp)` is called on the `AndExpression`, it calls
`.evaluate(emp)` on both children and combines their results with `and`.
The tree structure encodes the filter logic — more complex filters are
expressed as deeper trees, combining any number of expressions.

**CS lens — the expression tree.** This structure is a specific kind of
tree called an **expression tree** (or **abstract syntax tree**, AST).
Every programming language you've ever used — Python, JavaScript, SQL —
compiles your source code into an AST before evaluating it. The Interpreter
pattern is a miniature version of that process: define a grammar, parse
input into a tree of objects representing each grammar rule, and evaluate
the tree. Python's own `ast` module exposes Python's internal expression
tree in exactly this form. The Interpreter pattern is the mechanism behind
every embedded domain-specific language (DSL), every rule engine, and
every query language built into a larger system.

**SE lens.** The Interpreter pattern is the right tool when you need users
(or configuration files) to specify rules, filters, or transformations in
a structured language, and you want to evaluate those rules programmatically.
Real uses: database query engines (SQL parsing and evaluation), rule
engines (insurance policy rules, fraud detection logic), template languages
(Jinja2, Handlebars), and mathematical expression evaluators. The
alternative — writing a single monolithic function that parses and
evaluates by `if`/`elif` — breaks immediately when rules become complex or
need to be composed.

**What breaks without this:** An `if`/`elif` chain for evaluating
compound filter expressions grows quadratically with the number of
operators and operands — every new operator requires editing the central
parsing loop and adding branching logic. With Interpreter, adding a new
expression type (say, `NotExpression`) means writing one new class.

### TypeScript

```typescript
interface Expression {
  evaluate(record: Record<string, unknown>): boolean;
}

class GreaterThanExpression implements Expression {
  constructor(private field: string, private value: number) {}
  evaluate(record: Record<string, unknown>): boolean {
    return (record[this.field] as number ?? 0) > this.value;
  }
}

class LessThanExpression implements Expression {
  constructor(private field: string, private value: number) {}
  evaluate(record: Record<string, unknown>): boolean {
    return (record[this.field] as number ?? 0) < this.value;
  }
}

class EqualsExpression implements Expression {
  constructor(private field: string, private value: unknown) {}
  evaluate(record: Record<string, unknown>): boolean {
    return record[this.field] === this.value;
  }
}

class AndExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  evaluate(record: Record<string, unknown>): boolean {
    return this.left.evaluate(record) && this.right.evaluate(record);
  }
}

class OrExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}
  evaluate(record: Record<string, unknown>): boolean {
    return this.left.evaluate(record) || this.right.evaluate(record);
  }
}
```

**Walkthrough — new syntax.** `Record<string, unknown>` — `Record<K,V>`
(from TypeScript Prereq 02) with `string` keys and `unknown` values:
we don't know in advance which fields each record has or what types they
hold. `record[this.field] as number` is a **type assertion** — the `as`
keyword tells TypeScript "treat this value as a `number`, even though you
only know it's `unknown`." This is similar to the `!` non-null assertion
from Prereq 01, but for types instead of nullability — we're asserting
that this field contains a number, based on our own knowledge of the data,
and TypeScript trusts us. `?? 0` applies the nullish coalescing operator
as a fallback if the field doesn't exist in the record. `unknown` is used
for `EqualsExpression.value` because the comparison field might hold a
string (`"London"`) or a number — any type is valid on the right side of
an equality check.

```typescript
const employees: Record<string, unknown>[] = [
  { name: "Alice", age: 32, salary: 75_000, city: "London" },
  { name: "Bob",   age: 24, salary: 55_000, city: "Paris"  },
  { name: "Carol", age: 41, salary: 95_000, city: "London" },
  { name: "Dave",  age: 28, salary: 62_000, city: "Berlin" },
  { name: "Eve",   age: 35, salary: 88_000, city: "Paris"  },
];

const seniorLondon = new AndExpression(
  new GreaterThanExpression("age", 30),
  new EqualsExpression("city", "London")
);

const affordableParis = new AndExpression(
  new EqualsExpression("city", "Paris"),
  new LessThanExpression("salary", 70_000)
);

const targetCities = new OrExpression(
  new EqualsExpression("city", "London"),
  new EqualsExpression("city", "Paris")
);

console.log("Senior employees in London (age > 30 AND city = 'London'):");
employees.filter(e => seniorLondon.evaluate(e))
         .forEach(e => console.log(`  ${e["name"]}`));

console.log("\nAffordable hires in Paris (city = 'Paris' AND salary < 70000):");
employees.filter(e => affordableParis.evaluate(e))
         .forEach(e => console.log(`  ${e["name"]}`));

console.log("\nEmployees in London or Paris:");
employees.filter(e => targetCities.evaluate(e))
         .forEach(e => console.log(`  ${e["name"]} (${e["city"]})`));
```

```
Senior employees in London (age > 30 AND city = 'London'):
  Alice
  Carol

Affordable hires in Paris (city = 'Paris' AND salary < 70000):
  Bob

Employees in London or Paris:
  Alice (London)
  Bob (Paris)
  Carol (London)
  Eve (Paris)
```

---

## Concept 2: Bridge

The **Bridge** pattern separates an abstraction (what something does at a
high level) from its implementation (how it does it), so both can evolve
independently without each requiring the other to change.

### Problem first

Suppose you have shapes (Circle, Square) and rendering targets (console
text, SVG). Without Bridge, every combination needs its own class:
`ConsoleCircle`, `SvgCircle`, `ConsoleSquare`, `SvgSquare` — that's
four classes for two shapes and two renderers. Add a third renderer and
you need six classes. Add a fourth shape and you need eight. The class
count grows as the product of shapes times renderers — **class explosion**.

Bridge solves this by separating the shape dimension from the renderer
dimension, so they can vary independently:
- Two shapes × two renderers = 2 + 2 = **4 classes** (Bridge)
- Two shapes × two renderers = 2 × 2 = **4 classes** (no Bridge)

That sounds the same at this scale — but add a third renderer:
- Bridge: 2 + 3 = **5 classes**
- No Bridge: 2 × 3 = **6 classes**

At ten shapes and ten renderers:
- Bridge: 10 + 10 = **20 classes**
- No Bridge: 10 × 10 = **100 classes**

### Python

```python
class Renderer:
    def render_circle(self, radius):
        raise NotImplementedError

    def render_square(self, side):
        raise NotImplementedError


class ConsoleRenderer(Renderer):
    def render_circle(self, radius):
        print(f"  [Console] Drawing circle: radius={radius}")

    def render_square(self, side):
        print(f"  [Console] Drawing square: side={side}")


class SvgRenderer(Renderer):
    def render_circle(self, radius):
        print(f"  [SVG] <circle r='{radius}'/>")

    def render_square(self, side):
        print(f"  [SVG] <rect width='{side}' height='{side}'/>")
```

**Walkthrough:** `Renderer` is the **implementation** side of the bridge —
the interface for how things are drawn. `ConsoleRenderer` and `SvgRenderer`
are the concrete implementations. They know how to render primitives but
know nothing about abstract shapes.

```python
class Shape:
    def __init__(self, renderer):
        self._renderer = renderer

    def draw(self):
        raise NotImplementedError

    def resize(self, factor):
        raise NotImplementedError


class Circle(Shape):
    def __init__(self, renderer, radius):
        super().__init__(renderer)
        self._radius = radius

    def draw(self):
        self._renderer.render_circle(self._radius)

    def resize(self, factor):
        self._radius *= factor
        print(f"  Circle resized, new radius={self._radius:.1f}")


class Square(Shape):
    def __init__(self, renderer, side):
        super().__init__(renderer)
        self._side = side

    def draw(self):
        self._renderer.render_square(self._side)

    def resize(self, factor):
        self._side *= factor
        print(f"  Square resized, new side={self._side:.1f}")
```

**Walkthrough:** `Shape` is the **abstraction** side of the bridge — it
holds a reference to a `Renderer` (the implementation) and delegates
all rendering work to it. `Circle` and `Square` know their geometric
properties (`_radius`, `_side`) and how to describe themselves to the
renderer (`render_circle`, `render_square`), but they contain no rendering
logic themselves. `super().__init__(renderer)` calls the parent class
constructor, passing `renderer` to `Shape.__init__` to store in
`self._renderer`.

```python
console_renderer = ConsoleRenderer()
svg_renderer     = SvgRenderer()

shapes = [
    Circle(console_renderer, radius=5),
    Circle(svg_renderer,     radius=5),
    Square(console_renderer, side=4),
    Square(svg_renderer,     side=4),
]

print("Drawing shapes:")
for shape in shapes:
    shape.draw()

print("\nResizing first circle and redrawing:")
shapes[0].resize(2)
shapes[0].draw()
```

```
Drawing shapes:
  [Console] Drawing circle: radius=5
  [SVG] <circle r='5'/>
  [Console] Drawing square: side=4
  [SVG] <rect width='4' height='4'/>

Resizing first circle and redrawing:
  Circle resized, new radius=10.0
  [Console] Drawing circle: radius=10
```

**Walkthrough:** The same `Circle` class works with either renderer —
`Circle(console_renderer, 5)` and `Circle(svg_renderer, 5)` are both valid.
Adding a third renderer (`PdfRenderer`, `CanvasRenderer`) requires only a
new `Renderer` subclass — `Circle` and `Square` never need to change.
Adding a new shape (`Triangle`) requires only a new `Shape` subclass —
the existing renderers never need to change. The two dimensions evolve
independently.

**CS lens — composition over inheritance.** Bridge is the canonical
example of the design principle "favor composition over inheritance." The
naive approach (`SvgCircle extends Circle`) uses inheritance to combine
two independent concerns (shape + renderer) into one class — and every
new combination requires a new class. Bridge uses composition — the
shape *holds* a renderer — which decouples the two concerns entirely.
This is the same composition-over-inheritance reasoning that makes the
Decorator pattern (Glossary 01) and Strategy pattern (Glossary 07) more
flexible than deep inheritance hierarchies.

**SE lens.** Bridge appears in graphics systems, database drivers (the
same abstract "query" interface across MySQL, PostgreSQL, SQLite
implementations), UI toolkits (abstract widget behavior across different
operating system rendering backends), and logging frameworks (the same
abstract "log this message" interface across console, file, network, and
database implementations). In each case, the abstraction and the
implementation need to evolve at different rates, by different teams or
for different reasons, without coupling each other.

**What breaks without this:** Without Bridge, every new renderer requires
modifying every existing shape class to add the new rendering logic —
the classes that should be closed for modification (Shape, Circle, Square)
have to be opened for every new implementation, violating the open/closed
principle.

### TypeScript

```typescript
interface Renderer {
  renderCircle(radius: number): void;
  renderSquare(side: number): void;
}

class ConsoleRenderer implements Renderer {
  renderCircle(radius: number): void {
    console.log(`  [Console] Drawing circle: radius=${radius}`);
  }
  renderSquare(side: number): void {
    console.log(`  [Console] Drawing square: side=${side}`);
  }
}

class SvgRenderer implements Renderer {
  renderCircle(radius: number): void {
    console.log(`  [SVG] <circle r='${radius}'/>`);
  }
  renderSquare(side: number): void {
    console.log(`  [SVG] <rect width='${side}' height='${side}'/>`);
  }
}

abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): void;
  abstract resize(factor: number): void;
}

class CircleShape extends Shape {
  constructor(renderer: Renderer, private radius: number) {
    super(renderer);
  }
  draw(): void {
    this.renderer.renderCircle(this.radius);
  }
  resize(factor: number): void {
    this.radius *= factor;
    console.log(`  Circle resized, new radius=${this.radius.toFixed(1)}`);
  }
}

class SquareShape extends Shape {
  constructor(renderer: Renderer, private side: number) {
    super(renderer);
  }
  draw(): void {
    this.renderer.renderSquare(this.side);
  }
  resize(factor: number): void {
    this.side *= factor;
    console.log(`  Square resized, new side=${this.side.toFixed(1)}`);
  }
}
```

**Walkthrough — new syntax.** `protected renderer: Renderer` in the
abstract class constructor — `protected` (from Glossary 11's Template
Method) means accessible from this class and subclasses. This makes
`this.renderer` available in `CircleShape` and `SquareShape` without
making it public. `constructor(renderer: Renderer, private radius: number)`
in `CircleShape` — the first parameter (`renderer`) is not preceded by an
access modifier, so it's a plain parameter that gets passed to
`super(renderer)`. The second (`private radius: number`) uses the
constructor shorthand to declare and initialize the `radius` property.
`super(renderer)` calls the parent class (`Shape`) constructor — required
in TypeScript when a class extends another and the parent has a
constructor.

```typescript
const consoleRenderer = new ConsoleRenderer();
const svgRenderer     = new SvgRenderer();

const shapes: Shape[] = [
  new CircleShape(consoleRenderer, 5),
  new CircleShape(svgRenderer,     5),
  new SquareShape(consoleRenderer, 4),
  new SquareShape(svgRenderer,     4),
];

console.log("Drawing shapes:");
for (const shape of shapes) {
  shape.draw();
}

console.log("\nResizing first circle and redrawing:");
shapes[0].resize(2);
shapes[0].draw();
```

```
Drawing shapes:
  [Console] Drawing circle: radius=5
  [SVG] <circle r='5'/>
  [Console] Drawing square: side=4
  [SVG] <rect width='4' height='4'/>

Resizing first circle and redrawing:
  Circle resized, new radius=10.0
  [Console] Drawing circle: radius=10
```

---

## Concept 3: Flyweight

The **Flyweight** pattern reduces memory usage by sharing as much data
as possible between many similar objects. When a large number of objects
share the same intrinsic state (data that doesn't vary per instance), that
shared data is extracted into one shared object — the flyweight — while
each instance only stores its extrinsic state (data unique to that
instance).

### Problem first

Imagine a text editor rendering a document with 100,000 characters. Each
character has a glyph (the visual representation of the letter shape), a
font name, and a font size — all of which are shared by many characters
(every lowercase 'a' in Arial 12pt is identical). Each character also has
a position (x, y coordinates) that is unique. Without Flyweight, each of
100,000 character objects stores all of this data — including the glyph,
font name, and font size, duplicated thousands of times. With Flyweight,
the shared data (glyph + font + size) lives in one shared object per
unique combination, and each character instance stores only its position.

### Python

```python
class CharacterStyle:
    def __init__(self, font, size, bold, italic):
        self.font   = font
        self.size   = size
        self.bold   = bold
        self.italic = italic

    def __repr__(self):
        modifiers = []
        if self.bold:   modifiers.append("bold")
        if self.italic: modifiers.append("italic")
        mod_str = f" [{', '.join(modifiers)}]" if modifiers else ""
        return f"{self.font} {self.size}pt{mod_str}"


class StyleFactory:
    def __init__(self):
        self._styles = {}

    def get_style(self, font, size, bold=False, italic=False):
        key = (font, size, bold, italic)
        if key not in self._styles:
            self._styles[key] = CharacterStyle(font, size, bold, italic)
            print(f"  [Factory] Created new style: {self._styles[key]}")
        return self._styles[key]

    @property
    def style_count(self):
        return len(self._styles)
```

**Walkthrough:** `CharacterStyle` is the **flyweight** — it holds the
shared (intrinsic) state. `StyleFactory` is the factory that manages
the shared pool: `get_style` checks the `_styles` dictionary for an
existing matching style before creating a new one. The key is a tuple of
all intrinsic properties — `(font, size, bold, italic)`. If a style with
identical properties already exists, the existing object is returned rather
than creating a duplicate. This is a specific application of the object
pool concept: instead of creating new objects freely, objects are
retrieved from a shared pool, creating new ones only when no existing match
is found.

```python
class Character:
    def __init__(self, char, style, x, y):
        self._char  = char
        self._style = style
        self._x     = x
        self._y     = y

    def render(self):
        print(f"  '{self._char}' at ({self._x},{self._y}) in {self._style}")
```

**Walkthrough:** `Character` is the object that holds both intrinsic
state (the character itself — `_char`) and extrinsic state (position:
`_x`, `_y`). The `_style` reference points to a shared `CharacterStyle`
object — many `Character` instances may point to the *same*
`CharacterStyle` object in memory, rather than each holding its own copy.

```python
factory = StyleFactory()

print("Building document with shared styles:")
document = [
    Character("H", factory.get_style("Arial", 14, bold=True), 0,  0),
    Character("e", factory.get_style("Arial", 12),            10, 0),
    Character("l", factory.get_style("Arial", 12),            18, 0),
    Character("l", factory.get_style("Arial", 12),            26, 0),
    Character("o", factory.get_style("Arial", 12),            34, 0),
    Character("!", factory.get_style("Arial", 14, bold=True), 42, 0),
]

print(f"\nDocument has {len(document)} characters, {factory.style_count} unique styles")
print("\nRendering:")
for char in document:
    char.render()
```

```
Building document with shared styles:
  [Factory] Created new style: Arial 14pt [bold]
  [Factory] Created new style: Arial 12pt

Document has 6 characters, 2 unique styles

Rendering:
  'H' at (0,0) in Arial 14pt [bold]
  'e' at (10,0) in Arial 12pt
  'l' at (18,0) in Arial 12pt
  'l' at (26,0) in Arial 12pt
  'o' at (34,0) in Arial 12pt
  '!' at (42,0) in Arial 14pt [bold]
```

**Walkthrough:** Six characters in the document, but only two distinct
styles were ever created — `Arial 14pt [bold]` and `Arial 12pt`. The four
`Arial 12pt` characters (`e`, `l`, `l`, `o`) all share the exact same
`CharacterStyle` object in memory. The two bold characters (`H` and `!`)
share a second `CharacterStyle` object. In a real 100,000-character
document using, say, 10 distinct styles, Flyweight means 10 style
objects in memory rather than 100,000.

**CS lens — intrinsic vs extrinsic state.** The Flyweight pattern is a
direct application of the intrinsic/extrinsic state distinction. Intrinsic
state (font name, size, bold, italic) is independent of context — the same
for every character using that style, regardless of where in the document
that character appears. Extrinsic state (x, y position, which character
it is) is context-dependent — different for every character. The Flyweight
only stores intrinsic state; extrinsic state is kept outside and passed in
when needed (here, stored in `Character`). This factoring is the key
insight: identify what's shared, lift it out, share it; keep what's
unique per instance.

**SE lens.** Flyweight is a memory optimization pattern — reach for it
when you need large numbers of fine-grained objects and memory is a
constraint. Real uses: game engines (thousands of tree or bullet objects
sharing mesh data, differing only in position), GUI toolkits (shared glyph
data across text rendering), network connection pools (shared connection
configuration shared across many pooled connections). The pattern trades
some design complexity for memory efficiency — only apply it when profiling
shows memory is actually the bottleneck; premature optimization is as
problematic here as anywhere.

**What breaks without this:** Without Flyweight, 100,000 character objects
each store a full copy of their font, size, and bold/italic flags —
multiplying memory usage by the number of unique properties each object
could carry. For large numbers of objects with many shared properties,
this becomes prohibitive.

### TypeScript

```typescript
class CharacterStyle {
  constructor(
    public readonly font: string,
    public readonly size: number,
    public readonly bold: boolean,
    public readonly italic: boolean
  ) {}

  toString(): string {
    const modifiers: string[] = [];
    if (this.bold)   modifiers.push("bold");
    if (this.italic) modifiers.push("italic");
    const modStr = modifiers.length > 0 ? ` [${modifiers.join(", ")}]` : "";
    return `${this.font} ${this.size}pt${modStr}`;
  }
}

class StyleFactory {
  private styles: Map<string, CharacterStyle> = new Map();

  getStyle(font: string, size: number, bold = false, italic = false): CharacterStyle {
    const key = `${font}-${size}-${bold}-${italic}`;
    if (!this.styles.has(key)) {
      const style = new CharacterStyle(font, size, bold, italic);
      this.styles.set(key, style);
      console.log(`  [Factory] Created new style: ${style}`);
    }
    return this.styles.get(key)!;
  }

  get styleCount(): number {
    return this.styles.size;
  }
}
```

**Walkthrough — new syntax.** `Map<string, CharacterStyle>` — `Map` is
JavaScript's built-in key-value collection, similar to `Record<K,V>` but
with some important differences: `Map` allows keys of any type (not just
strings), preserves insertion order, and has explicit `.has()`, `.get()`,
`.set()`, and `.size` methods that make intent clearer than property access
on a plain object. `new Map()` creates an empty map. `.has(key)` checks
whether a key exists — equivalent to Python's `key in dict`. `.set(key,
value)` adds or updates an entry — equivalent to Python's `dict[key] =
value`. `.get(key)` retrieves a value — returns `undefined` if not found.
`this.styles.get(key)!` — the `!` (non-null assertion from Prereq 01) is
safe here because we just checked `.has(key)` in the `if`, so the `.get()`
immediately after is guaranteed to find it. `.size` is a property on `Map`
that returns the number of entries.

A plain string key `${font}-${size}-${bold}-${italic}` (e.g.,
`"Arial-12-false-false"`) is used instead of a tuple key, because
JavaScript objects and Maps use reference equality for object keys — two
separate tuples with the same values would be different keys. String keys
concatenating the intrinsic properties ensure the same logical combination
always maps to the same key string.

```typescript
class Character {
  constructor(
    private char: string,
    private style: CharacterStyle,
    private x: number,
    private y: number
  ) {}

  render(): void {
    console.log(`  '${this.char}' at (${this.x},${this.y}) in ${this.style}`);
  }
}

const factory = new StyleFactory();

console.log("Building document with shared styles:");
const docChars: Character[] = [
  new Character("H", factory.getStyle("Arial", 14, true),  0,  0),
  new Character("e", factory.getStyle("Arial", 12),        10, 0),
  new Character("l", factory.getStyle("Arial", 12),        18, 0),
  new Character("l", factory.getStyle("Arial", 12),        26, 0),
  new Character("o", factory.getStyle("Arial", 12),        34, 0),
  new Character("!", factory.getStyle("Arial", 14, true),  42, 0),
];

console.log(`\nDocument has ${docChars.length} characters, ${factory.styleCount} unique styles`);
console.log("\nRendering:");
for (const char of docChars) {
  char.render();
}
```

```
Building document with shared styles:
  [Factory] Created new style: Arial 14pt [bold]
  [Factory] Created new style: Arial 12pt

Document has 6 characters, 2 unique styles

Rendering:
  'H' at (0,0) in Arial 14pt [bold]
  'e' at (10,0) in Arial 12pt
  'l' at (18,0) in Arial 12pt
  'l' at (26,0) in Arial 12pt
  'o' at (34,0) in Arial 12pt
  '!' at (42,0) in Arial 14pt [bold]
```

---

## Connect the pieces

**Interpreter**, **Bridge**, and **Flyweight** solve three entirely
different problems, but each reflects a core design insight.

Interpreter says: when you need users or configurations to express rules
in a structured language, model the grammar as a class hierarchy and
evaluate it as a tree. It extends the Composite pattern (Glossary 12)
into the domain of language evaluation.

Bridge says: when two concerns (abstraction and implementation) need to
evolve independently, separate them with composition rather than combining
them through inheritance. It's the cleanest solution to the class explosion
problem that arises when two independent dimensions each have multiple
options.

Flyweight says: when you have enormous numbers of objects sharing most of
their state, extract the shared state into one shared object and have many
instances reference it rather than each carrying a copy. It's a memory
optimization that only matters at scale — don't reach for it before
profiling confirms memory is the problem.

In TypeScript, the generic `Expression` interface let the Interpreter's
expression tree be fully type-checked. The `abstract class Shape` with
`protected renderer` made Bridge's composition explicit and enforced.
`Map<string, CharacterStyle>` gave Flyweight a semantically clearer cache
than a plain `Record`, with explicit `.has()` / `.set()` / `.get()`
methods making the cache logic readable.

## What breaks without these patterns

Without Interpreter, compound rule evaluation requires a growing central
function that handles every combination of operators and fields — fragile,
hard to extend, and impossible to compose. Without Bridge, adding a new
rendering target to a shape hierarchy requires editing every existing
shape class. Without Flyweight, large numbers of fine-grained objects with
shared state waste memory proportional to the number of objects rather
than the number of distinct state combinations.

## Definition of done

- [ ] You can explain what an expression tree is and connect it to the
      Composite pattern from Glossary 12.
- [ ] You can build a compound filter expression for the employee data
      using three levels of nesting (e.g., `AND` of two `OR` conditions)
      and confirm it works correctly.
- [ ] You can explain the Bridge pattern's solution to class explosion
      using the shapes × renderers arithmetic from the post.
- [ ] You can explain the intrinsic/extrinsic state distinction in
      Flyweight, using the character document example.
- [ ] You've run all three patterns in Python and TypeScript and confirmed
      matching output.
- [ ] You can explain why `Map<string, CharacterStyle>` is used instead
      of `Record<string, CharacterStyle>` in the TypeScript Flyweight,
      and why a string key is used instead of a tuple key.

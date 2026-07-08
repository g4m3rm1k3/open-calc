# Classic Patterns III: Visitor, Memento

## What you will build

Two runnable programs — one per pattern — in both Python and TypeScript,
showing how to add new operations to a class hierarchy without modifying
any existing classes (Visitor), and how to capture and restore an
object's state without violating its encapsulation (Memento). By the end
you'll understand why these two patterns exist, what specific problems
they solve that simpler approaches can't, and where they appear in real
production systems.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. That said, Visitor connects to the Template Method from Glossary
11 (both involve adding behavior to a class hierarchy, but in opposite
directions), and Memento connects to the Command pattern's undo history
from Glossary 07.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation. `node`
runs the compiled output.

---

## Concept 1: Visitor

The **Visitor** pattern lets you add new operations to a class hierarchy
without modifying any of the classes in that hierarchy. Instead of putting
the new operation inside each class, you write it in a separate "visitor"
object, and each class "accepts" visitors by calling back with itself.

### Problem first

Suppose you have a hierarchy of shape classes — `Circle`, `Rectangle`,
`Triangle` — each already working correctly with an `area()` method. Now
you need to add more operations: calculate the perimeter, export to SVG,
check if a point is inside the shape. You could add methods to each
class for each new operation — but that grows every class every time a
new operation is needed, and if the classes are in a library you don't
control, you can't modify them at all. Alternatively, you could write
`if isinstance(shape, Circle): ... elif isinstance(shape, Rectangle):
...` type-checking chains — but those violate the open/closed principle
and require updating every chain when a new shape type is added.

Visitor solves this by separating the data (the shapes) from the
operations (area, perimeter, SVG export) entirely.

### Python

```python
class Circle:
    def __init__(self, radius):
        self.radius = radius

    def accept(self, visitor):
        return visitor.visit_circle(self)


class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def accept(self, visitor):
        return visitor.visit_rectangle(self)


class Triangle:
    def __init__(self, base, height, side_a, side_b):
        self.base   = base
        self.height = height
        self.side_a = side_a
        self.side_b = side_b

    def accept(self, visitor):
        return visitor.visit_triangle(self)
```

**Walkthrough:** Each shape class has an `accept` method — this is the
entire Visitor hook. `accept` receives a visitor object and calls back
on it with `self` — the specific method it calls (`visit_circle`,
`visit_rectangle`, `visit_triangle`) is determined by the shape's own
type. This is called **double dispatch**: the method that ultimately runs
depends on *two* runtime types — the type of the shape (which method on
the visitor to call) and the type of the visitor (which visitor's
implementation runs). Python's standard method dispatch is single
dispatch: only the type of the receiver determines the method. `accept`
adds the second dispatch.

```python
import math


class AreaVisitor:
    def visit_circle(self, circle):
        return math.pi * circle.radius ** 2

    def visit_rectangle(self, rectangle):
        return rectangle.width * rectangle.height

    def visit_triangle(self, triangle):
        return 0.5 * triangle.base * triangle.height


class PerimeterVisitor:
    def visit_circle(self, circle):
        return 2 * math.pi * circle.radius

    def visit_rectangle(self, rectangle):
        return 2 * (rectangle.width + rectangle.height)

    def visit_triangle(self, triangle):
        return triangle.base + triangle.side_a + triangle.side_b


class SvgVisitor:
    def visit_circle(self, circle):
        return f'<circle r="{circle.radius:.1f}"/>'

    def visit_rectangle(self, rectangle):
        return f'<rect width="{rectangle.width}" height="{rectangle.height}"/>'

    def visit_triangle(self, triangle):
        return f'<polygon points="0,0 {triangle.base},0 {triangle.base/2:.1f},{triangle.height}"/>'
```

**Walkthrough — new syntax.** `import math` brings in Python's built-in
math module. `math.pi` is the constant π (approximately 3.14159).
`circle.radius ** 2` is exponentiation (radius squared). Each visitor
class contains the implementation of one operation for every shape type.
Adding a new operation means adding a new visitor class — none of the
shape classes are touched. Adding a new shape type means adding `accept`
to the new class and one method to each existing visitor — which is more
work than adding a new operation, but is the trade-off the pattern makes.

```python
shapes = [
    Circle(5),
    Rectangle(4, 6),
    Triangle(base=3, height=4, side_a=5, side_b=5),
]

area_visitor      = AreaVisitor()
perimeter_visitor = PerimeterVisitor()
svg_visitor       = SvgVisitor()

print("Shape measurements:")
for shape in shapes:
    area      = shape.accept(area_visitor)
    perimeter = shape.accept(perimeter_visitor)
    svg       = shape.accept(svg_visitor)
    name      = shape.__class__.__name__
    print(f"  {name:12} area={area:7.2f}  perimeter={perimeter:7.2f}  svg={svg}")
```

```
Shape measurements:
  Circle       area=  78.54  perimeter=  31.42  svg=<circle r="5.0"/>
  Rectangle    area=  24.00  perimeter=  20.00  svg=<rect width="4" height="6"/>
  Triangle     area=   6.00  perimeter=  13.00  svg=<polygon points="0,0 3,0 1.5,4"/>
```

**Walkthrough — new syntax.** `f"  {name:12}"` — `:12` inside an f-string
is a format specifier for width: it pads the value to at least 12
characters wide, aligning the output in columns. `{area:7.2f}` pads to 7
characters total and shows 2 decimal places. These format specifiers make
the output table line up neatly without manually adding spaces.

**CS lens — double dispatch.** When `shape.accept(area_visitor)` is
called, Python resolves which `accept` method to call based on `shape`'s
type (first dispatch). Inside `accept`, `visitor.visit_circle(self)` is
called, and Python resolves which `visit_circle` to call based on
`visitor`'s type (second dispatch). The net effect: the code that runs
depends on *both* the shape type and the visitor type — something that
would otherwise require `isinstance` checks to replicate. Languages with
multiple dispatch (where method selection considers all argument types
simultaneously) make the Visitor pattern simpler; Python and TypeScript
don't have multiple dispatch natively, so the `accept`/`visit` double
dispatch is the idiom.

**SE lens.** The Visitor pattern is the right tool when you have a stable
set of types (the shapes won't change often) but a growing set of
operations (new calculations, exports, validations are added regularly).
It's widely used in compilers and interpreters — an AST (Abstract Syntax
Tree) has a stable set of node types but constantly needs new operations
(type checking, optimization, code generation, pretty printing), each
expressible as a visitor over the AST. If you were building a language and
added a `TypeCheckVisitor`, an `OptimizeVisitor`, and a
`CodeGenVisitor`, none of the AST node classes would ever need to change.

**What breaks without this:** Each new operation added directly to each
class grows the classes indefinitely — `Circle` eventually contains area,
perimeter, SVG, JSON export, collision detection, rendering logic, and
more, even though those concerns don't belong in `Circle`. The Visitor
pattern is about *keeping classes focused* by extracting operations that
don't conceptually belong in them.

### TypeScript

```typescript
interface ShapeVisitor<T> {
  visitCircle(circle: CircleShape): T;
  visitRectangle(rectangle: RectangleShape): T;
  visitTriangle(triangle: TriangleShape): T;
}

interface Shape {
  accept<T>(visitor: ShapeVisitor<T>): T;
}
```

**Walkthrough — new syntax.** `interface ShapeVisitor<T>` is a generic
interface (from TypeScript Prereq 02): the type parameter `T` represents
the return type of each visit method — different visitors return different
things (`number` for area, `string` for SVG). Using a generic here means
one interface covers all cases: `ShapeVisitor<number>` for numeric
visitors, `ShapeVisitor<string>` for string-producing visitors.
`accept<T>(visitor: ShapeVisitor<T>): T` — the `accept` method is itself
generic, carrying `T` through from the visitor type to the return type.
This means `shape.accept(areaVisitor)` correctly infers `number` as the
return type, and `shape.accept(svgVisitor)` correctly infers `string` —
without you needing to annotate either call site.

```typescript
class CircleShape implements Shape {
  constructor(public radius: number) {}

  accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitCircle(this);
  }
}

class RectangleShape implements Shape {
  constructor(public width: number, public height: number) {}

  accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitRectangle(this);
  }
}

class TriangleShape implements Shape {
  constructor(
    public base: number,
    public height: number,
    public sideA: number,
    public sideB: number
  ) {}

  accept<T>(visitor: ShapeVisitor<T>): T {
    return visitor.visitTriangle(this);
  }
}

class AreaVisitor implements ShapeVisitor<number> {
  visitCircle(circle: CircleShape): number {
    return Math.PI * circle.radius ** 2;
  }
  visitRectangle(rectangle: RectangleShape): number {
    return rectangle.width * rectangle.height;
  }
  visitTriangle(triangle: TriangleShape): number {
    return 0.5 * triangle.base * triangle.height;
  }
}

class PerimeterVisitor implements ShapeVisitor<number> {
  visitCircle(circle: CircleShape): number {
    return 2 * Math.PI * circle.radius;
  }
  visitRectangle(rectangle: RectangleShape): number {
    return 2 * (rectangle.width + rectangle.height);
  }
  visitTriangle(triangle: TriangleShape): number {
    return triangle.base + triangle.sideA + triangle.sideB;
  }
}

class SvgVisitor implements ShapeVisitor<string> {
  visitCircle(circle: CircleShape): string {
    return `<circle r="${circle.radius.toFixed(1)}"/>`;
  }
  visitRectangle(rectangle: RectangleShape): string {
    return `<rect width="${rectangle.width}" height="${rectangle.height}"/>`;
  }
  visitTriangle(triangle: TriangleShape): string {
    return `<polygon points="0,0 ${triangle.base},0 ${(triangle.base / 2).toFixed(1)},${triangle.height}"/>`;
  }
}

const shapes: Shape[] = [
  new CircleShape(5),
  new RectangleShape(4, 6),
  new TriangleShape(3, 4, 5, 5),
];

const areaVisitor      = new AreaVisitor();
const perimeterVisitor = new PerimeterVisitor();
const svgVisitor       = new SvgVisitor();

console.log("Shape measurements:");
for (const shape of shapes) {
  const area      = shape.accept(areaVisitor);
  const perimeter = shape.accept(perimeterVisitor);
  const svg       = shape.accept(svgVisitor);
  const name      = shape.constructor.name;
  console.log(`  ${name.padEnd(14)} area=${area.toFixed(2).padStart(7)}  perimeter=${perimeter.toFixed(2).padStart(7)}  svg=${svg}`);
}
```

**Walkthrough — new syntax.** `shape.constructor.name` — as in Glossary
11's Template Method, `constructor.name` gives the class name of the
current instance as a string. `.padEnd(14)` is a JavaScript string method
that pads a string with spaces on the right to reach the given length —
the equivalent of Python's `f"{name:12}"` format specifier for left-
aligned column padding. `.padStart(7)` pads on the left (right-aligns the
number), equivalent to Python's `{value:7.2f}`.

```
Shape measurements:
  CircleShape    area=  78.54  perimeter=  31.42  svg=<circle r="5.0"/>
  RectangleShape area=  24.00  perimeter=  20.00  svg=<rect width="4" height="6"/>
  TriangleShape  area=   6.00  perimeter=  13.00  svg=<polygon points="0,0 3,0 1.5,4"/>
```

---

## Concept 2: Memento

The **Memento** pattern captures an object's internal state at a point in
time and stores it in a separate object (the memento), so the original
object's state can be restored later — without exposing its internal
implementation to the code that's doing the saving and restoring.

### Problem first

Consider a text editor. You need an undo feature: save the editor's state
before each change, and restore it when the user presses Ctrl+Z. A naive
approach stores state as a public dictionary or exposes internal fields
directly — but this breaks encapsulation: the undo system now knows
exactly how the editor is structured internally. If the editor's
implementation changes, the undo system breaks too.

The Memento pattern solves this by letting the editor create its own
state snapshot (the memento), without revealing what's inside. The undo
system stores and returns mementos opaquely — it never inspects or
modifies the contents.

### Python

```python
class EditorMemento:
    def __init__(self, content, cursor_position, is_bold):
        self._content         = content
        self._cursor_position = cursor_position
        self._is_bold         = is_bold

    def get_content(self):
        return self._content

    def get_cursor_position(self):
        return self._cursor_position

    def get_is_bold(self):
        return self._is_bold
```

**Walkthrough:** `EditorMemento` stores a complete snapshot of the
editor's state. All fields are private (`_content`, `_cursor_position`,
`_is_bold`) and only accessible through getter methods. The undo system
(the Caretaker, below) will store these objects but should never reach
into them — it treats them as opaque tokens. The getters exist so the
editor itself can read back its own state during restoration.

```python
class TextEditor:
    def __init__(self):
        self._content         = ""
        self._cursor_position = 0
        self._is_bold         = False

    def type_text(self, text):
        self._content         = self._content + text
        self._cursor_position = len(self._content)
        print(f"  Typed: '{text}' → content='{self._content}', cursor={self._cursor_position}")

    def toggle_bold(self):
        self._is_bold = not self._is_bold
        print(f"  Bold toggled → is_bold={self._is_bold}")

    def save(self):
        return EditorMemento(self._content, self._cursor_position, self._is_bold)

    def restore(self, memento):
        self._content         = memento.get_content()
        self._cursor_position = memento.get_cursor_position()
        self._is_bold         = memento.get_is_bold()
        print(f"  Restored → content='{self._content}', cursor={self._cursor_position}, bold={self._is_bold}")

    def display(self):
        print(f"  State: content='{self._content}', cursor={self._cursor_position}, bold={self._is_bold}")
```

**Walkthrough:** `save()` creates a new `EditorMemento` from the
editor's current state and returns it — the editor decides what to save.
`restore(memento)` reads back from a memento and updates all fields —
the editor decides how to restore. The undo system never needs to know
what `_content`, `_cursor_position`, and `_is_bold` are — it just holds
onto mementos and hands them back.

```python
class UndoManager:
    def __init__(self, editor):
        self._editor  = editor
        self._history = []

    def save_state(self):
        memento = self._editor.save()
        self._history.append(memento)
        print(f"  [UndoManager] Saved state (history depth: {len(self._history)})")

    def undo(self):
        if len(self._history) <= 1:
            print("  [UndoManager] Nothing to undo")
            return
        self._history.pop()
        previous = self._history[-1]
        self._editor.restore(previous)
        print(f"  [UndoManager] Undone (history depth: {len(self._history)})")
```

**Walkthrough:** `UndoManager` is the **Caretaker** — the object
responsible for storing and returning mementos. It holds a list of
mementos as a stack (from Glossary 10: LIFO — the most recent state is
popped when undoing). `save_state` asks the editor for a new memento and
pushes it onto the stack. `undo` pops the most recent state (discarding
it) and restores the one before it — `self._history[-1]` after the pop
is the previous state. The `<= 1` guard keeps the initial state: if only
one memento remains (the original state), there's nothing to undo to.

```python
editor       = TextEditor()
undo_manager = UndoManager(editor)

undo_manager.save_state()

editor.type_text("Hello")
undo_manager.save_state()

editor.type_text(", world")
undo_manager.save_state()

editor.toggle_bold()
undo_manager.save_state()

print("\nCurrent state:")
editor.display()

print("\nUndo 1 (remove bold):")
undo_manager.undo()
editor.display()

print("\nUndo 2 (remove ', world'):")
undo_manager.undo()
editor.display()

print("\nUndo 3 (remove 'Hello'):")
undo_manager.undo()
editor.display()

print("\nUndo 4 (nothing to undo):")
undo_manager.undo()
```

```
  [UndoManager] Saved state (history depth: 1)
  Typed: 'Hello' → content='Hello', cursor=5
  [UndoManager] Saved state (history depth: 2)
  Typed: ', world' → content='Hello, world', cursor=12
  [UndoManager] Saved state (history depth: 3)
  Bold toggled → is_bold=True
  [UndoManager] Saved state (history depth: 4)

Current state:
  State: content='Hello, world', cursor=12, bold=True

Undo 1 (remove bold):
  Restored → content='Hello, world', cursor=12, bold=False
  [UndoManager] Undone (history depth: 3)
  State: content='Hello, world', cursor=12, bold=False

Undo 2 (remove ', world'):
  Restored → content='Hello', cursor=5, bold=False
  [UndoManager] Undone (history depth: 2)
  State: content='Hello', cursor=5, bold=False

Undo 3 (remove 'Hello'):
  Restored → content='', cursor=0, bold=False
  [UndoManager] Undone (history depth: 1)
  State: content='', cursor=0, bold=False

Undo 4 (nothing to undo):
  [UndoManager] Nothing to undo
```

**CS lens — Memento vs directly storing fields.** The naive alternative
to Memento is having `UndoManager` directly access `editor._content`,
`editor._cursor_position`, and `editor._is_bold` — copying and restoring
them itself. This works but produces tight coupling: `UndoManager` now
knows the editor's internal implementation. If the editor gains a new
field (say, `_font_size`), `UndoManager` must also be updated. With
Memento, `UndoManager` only ever stores and returns opaque `EditorMemento`
objects — the editor's implementation can change freely, and `UndoManager`
never needs to change.

**SE lens.** Memento appears in any system needing undo/redo (text
editors, image editors, IDEs, CAD tools), in database transaction
rollback (a transaction creates a savepoint — a memento of database state
— that can be restored if the transaction fails), and in game systems
(save states that capture a complete snapshot of game state and allow
reloading). The key property in all cases: the snapshot is created and
interpreted by the object that owns the state; the system managing
snapshots treats them as opaque blobs.

**What breaks without this:** If the undo system directly reads and writes
an object's internal fields, every change to the object's internal
structure requires updating the undo system — two completely separate
parts of the codebase that must now stay in sync. This is the encapsulation
violation the Memento pattern specifically prevents.

### TypeScript

```typescript
class EditorMemento {
  constructor(
    private readonly content: string,
    private readonly cursorPosition: number,
    private readonly isBold: boolean
  ) {}

  getContent(): string         { return this.content; }
  getCursorPosition(): number  { return this.cursorPosition; }
  getIsBold(): boolean         { return this.isBold; }
}

class TextEditor {
  private content:         string  = "";
  private cursorPosition:  number  = 0;
  private isBold:          boolean = false;

  typeText(text: string): void {
    this.content        = this.content + text;
    this.cursorPosition = this.content.length;
    console.log(`  Typed: '${text}' → content='${this.content}', cursor=${this.cursorPosition}`);
  }

  toggleBold(): void {
    this.isBold = !this.isBold;
    console.log(`  Bold toggled → is_bold=${this.isBold}`);
  }

  save(): EditorMemento {
    return new EditorMemento(this.content, this.cursorPosition, this.isBold);
  }

  restore(memento: EditorMemento): void {
    this.content        = memento.getContent();
    this.cursorPosition = memento.getCursorPosition();
    this.isBold         = memento.getIsBold();
    console.log(`  Restored → content='${this.content}', cursor=${this.cursorPosition}, bold=${this.isBold}`);
  }

  display(): void {
    console.log(`  State: content='${this.content}', cursor=${this.cursorPosition}, bold=${this.isBold}`);
  }
}

class UndoManager {
  private history: EditorMemento[] = [];

  constructor(private editor: TextEditor) {}

  saveState(): void {
    const memento = this.editor.save();
    this.history.push(memento);
    console.log(`  [UndoManager] Saved state (history depth: ${this.history.length})`);
  }

  undo(): void {
    if (this.history.length <= 1) {
      console.log("  [UndoManager] Nothing to undo");
      return;
    }
    this.history.pop();
    const previous = this.history[this.history.length - 1];
    this.editor.restore(previous);
    console.log(`  [UndoManager] Undone (history depth: ${this.history.length})`);
  }
}

const editor      = new TextEditor();
const undoManager = new UndoManager(editor);

undoManager.saveState();

editor.typeText("Hello");
undoManager.saveState();

editor.typeText(", world");
undoManager.saveState();

editor.toggleBold();
undoManager.saveState();

console.log("\nCurrent state:");
editor.display();

console.log("\nUndo 1 (remove bold):");
undoManager.undo();
editor.display();

console.log("\nUndo 2 (remove ', world'):");
undoManager.undo();
editor.display();

console.log("\nUndo 3 (remove 'Hello'):");
undoManager.undo();
editor.display();

console.log("\nUndo 4 (nothing to undo):");
undoManager.undo();
```

```
  [UndoManager] Saved state (history depth: 1)
  Typed: 'Hello' → content='Hello', cursor=5
  [UndoManager] Saved state (history depth: 2)
  Typed: ', world' → content='Hello, world', cursor=12
  [UndoManager] Saved state (history depth: 3)
  Bold toggled → is_bold=true
  [UndoManager] Saved state (history depth: 4)

Current state:
  State: content='Hello, world', cursor=12, bold=true

Undo 1 (remove bold):
  Restored → content='Hello, world', cursor=12, bold=false
  [UndoManager] Undone (history depth: 3)
  State: content='Hello, world', cursor=12, bold=false

Undo 2 (remove ', world'):
  Restored → content='Hello', cursor=5, bold=false
  [UndoManager] Undone (history depth: 2)
  State: content='Hello', cursor=5, bold=false

Undo 3 (remove 'Hello'):
  Restored → content='', cursor=0, bold=false
  [UndoManager] Undone (history depth: 1)
  State: content='', cursor=0, bold=false

Undo 4 (nothing to undo):
  [UndoManager] Nothing to undo
```

**Walkthrough:** Note `bold=true` and `bold=false` (lowercase) in the
TypeScript output versus `bold=True` and `bold=False` (capitalized) in
Python — JavaScript/TypeScript boolean literals are lowercase, Python's
are capitalized. Both represent the same values; the difference is purely
a language convention.

---

## Connect the pieces

**Visitor** and **Memento** both address what happens when object design
meets the real world's tendency to need more things than you anticipated.

Visitor answers "I need to keep adding new operations to an existing class
hierarchy without modifying those classes" — by separating operations
into visitor objects that dispatch back to the data. The shape classes
never change; new `AreaVisitor`, `SvgVisitor`, and `CollisionVisitor`
classes are added instead.

Memento answers "I need to save and restore an object's state without
coupling the saving mechanism to the object's internal implementation"
— by letting the object create its own snapshots, which are stored
opaquely by a caretaker. The undo system never knows what's inside an
`EditorMemento`; the editor never knows how many mementos are being kept.

Both patterns are fundamentally about managing the *open/closed* trade-off
introduced throughout this series: adding new behavior (Visitor) or new
lifecycle management (Memento) without modifying the original object.
Visitor connects to the Template Method from Glossary 11 — both work with
class hierarchies — but Template Method is about the *algorithm's
skeleton* (fixed in a base class, varied by subclasses), while Visitor
is about *operations over data* (defined externally, dispatched back to
the data). Memento connects directly to the Command pattern's undo history
from Glossary 07 — `RemoteControl._history` was a list of command objects,
while `UndoManager._history` here is a list of state snapshots; both are
LIFO stacks driving undo, just capturing different things.

In TypeScript, `readonly` on all `EditorMemento` fields enforces that
snapshots are truly immutable once created — the caretaker cannot
accidentally modify a stored memento. The generic `ShapeVisitor<T>`
interface made the Visitor pattern fully type-safe: the compiler verifies
that every visitor implements all three visit methods with the correct
signatures, and correctly infers the return type at each `accept` call
site.

## What breaks without these patterns

Without Visitor, adding operations to a stable class hierarchy either
inflates every class with methods that don't conceptually belong in it,
or introduces fragile `isinstance` chains that must be updated everywhere
a new type is added. Without Memento, undo systems directly couple to
the object's internal structure — changes to the object require parallel
changes to the undo system, creating a maintenance burden that grows
with the object's complexity.

## Definition of done

- [ ] You can explain double dispatch in your own words — why `accept`
      exists and what it achieves that a direct method call doesn't.
- [ ] You can explain when Visitor is the right choice (stable types,
      growing operations) versus when Template Method is better (stable
      algorithm, varying steps).
- [ ] You've run both patterns in Python and TypeScript and confirmed
      matching output, including the boolean capitalization difference.
- [ ] You can explain what makes the Memento pattern specifically about
      encapsulation — why `UndoManager` must not directly access
      `TextEditor`'s fields.
- [ ] You can explain the connection between `UndoManager._history` here
      and `RemoteControl._history` from Glossary 07 — what they have in
      common and what they differ on.
- [ ] You can explain what `ShapeVisitor<T>` accomplishes in TypeScript
      that Python's duck-typed visitors don't provide.

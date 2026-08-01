# Classic Patterns I: Singleton, Template Method

## What you will build

Two runnable programs — one per pattern — in both Python and TypeScript,
showing two of the most recognizable patterns from the classic Design
Patterns book. The Singleton ensures a class has exactly one instance,
ever. The Template Method defines the skeleton of an algorithm in a base
class and lets subclasses fill in specific steps without changing the
overall structure. By the end you'll understand not just how they work,
but when they're genuinely useful and when they're being misused.

## What you need to know first

This post assumes comfort with basic Python (variables, functions,
classes) and basic TypeScript orientation from the TypeScript Prereq
posts. No prior glossary posts are required — this post stands fully
alone. That said, Singleton connects to the Dependency Injection topic
(Glossary 18) and the Repository pattern (Glossary 06) — those
connections are named below where they appear.

## Setting up to run TypeScript

```
npx tsc filename.ts
node filename.js
```

`tsc` compiles and type-checks; a type error stops compilation before
anything executes. `node` runs the compiled output.

---

## Concept 1: Singleton

A **Singleton** is a class that can be instantiated exactly once. Every
call that asks for an instance gets back the same object — not a new one,
not a copy, the exact same instance that was created the first time. This
guarantees that all code sharing the Singleton is sharing the same state.

### Problem first

Some things in a system should genuinely exist only once: a configuration
object loaded from a file, a connection pool managing database connections,
a logger that writes to one file. If every part of a program that needs
the configuration creates its own instance, they might load different
values (if the file changed between reads), or waste memory and startup
time loading the same data repeatedly. What you want is: create it once,
share it everywhere.

### Python

```python
class Configuration:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._loaded = False
        return cls._instance

    def load(self, settings):
        self._settings = settings
        self._loaded = True
        print(f"  Configuration loaded: {settings}")

    def get(self, key):
        if not self._loaded:
            raise RuntimeError("Configuration not loaded yet")
        return self._settings.get(key)
```

**Walkthrough — new syntax.** `_instance = None` is a **class attribute**
(recall from Basics Post 09: a class attribute is shared by all instances
and the class itself, unlike instance attributes set with `self.` in
`__init__`). Here it serves as the single storage slot for the one
permitted instance — initially `None`, set to the actual instance once
created.

`__new__` is a dunder method you haven't seen in this series yet. While
`__init__` *initializes* an already-created object, `__new__` is called
*before* `__init__` and is responsible for actually *creating and returning*
the object. Normally Python handles `__new__` invisibly — you never need
to define it. Here we override it specifically to intercept object
creation: `if cls._instance is None` checks whether an instance has ever
been created. If not, `super().__new__(cls)` calls the default creation
mechanism to build one, stores it in `cls._instance`, and returns it. On
every subsequent call, `cls._instance` is already set, so the `if` block
is skipped and the same stored instance is returned immediately.
`super()` refers to the parent class — here, Python's built-in `object`,
which every class implicitly inherits from.

```python
config1 = Configuration()
config2 = Configuration()

print(f"Same instance? {config1 is config2}")

config1.load({"database": "postgres://localhost/mydb", "debug": True})

print(f"config2 debug setting: {config2.get('debug')}")
```

```
Same instance? True
  Configuration loaded: {'database': 'postgres://localhost/mydb', 'debug': True}
config2 debug setting: True
```

**Walkthrough:** `config1 is config2` — the `is` operator checks object
identity (same object in memory, not just equal values — recall from this
series' Mediator post, Glossary 04). Both variables point to the exact
same `Configuration` object, so `is` returns `True`. Loading settings
through `config1` immediately makes those settings available through
`config2`, because they are the same object. This is the Singleton's
core property: shared state without explicit sharing.

**CS lens — what problem does this actually solve?** The Singleton is a
controlled global variable. A plain module-level variable in Python is
also "one value accessible everywhere" — but it can be accidentally
reassigned. A Singleton prevents reassignment by making the construction
mechanism itself enforce the "only one" constraint, so no caller can
accidentally create a second instance even if they try.

**SE lens — the controversy.** The Singleton is one of the most criticized
patterns in the Design Patterns book, and the criticism is worth naming
directly. A Singleton is, functionally, a global variable with extra
steps. It makes code that uses it hard to test in isolation — tests can't
easily give each test case its own fresh `Configuration`, because the
Singleton retains state between tests. It creates hidden dependencies:
any code that calls `Configuration()` anywhere in the codebase is
implicitly coupled to this one global object, and that coupling isn't
visible in the function's signature. For these reasons, modern software
design often favors **dependency injection** (Glossary 18) over Singletons:
rather than having every piece of code reach out to a global, you pass
the configuration (or logger, or connection pool) explicitly as an
argument to whatever needs it. This makes dependencies visible, testable,
and replaceable. Use Singleton deliberately and sparingly — it's the right
tool in specific situations (a truly global resource that cannot
meaningfully exist more than once), not a default for "I need this in
several places."

**What breaks without this:** Without the Singleton constraint, two parts
of a program might each call `Configuration()` expecting to work with the
same settings — but if they happen to load different files, or if one
sets a value and the other doesn't see it, they diverge silently.
Debugging diverged configuration state is notoriously difficult because
both instances look like `Configuration` objects and there's no obvious
sign that they're different.

### TypeScript

```typescript
class Configuration {
  private static instance: Configuration | null = null;
  private settings: Record<string, unknown> = {};
  private loaded = false;

  private constructor() {}

  static getInstance(): Configuration {
    if (Configuration.instance === null) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  load(settings: Record<string, unknown>): void {
    this.settings = settings;
    this.loaded = true;
    console.log(`  Configuration loaded: ${JSON.stringify(settings)}`);
  }

  get(key: string): unknown {
    if (!this.loaded) {
      throw new Error("Configuration not loaded yet");
    }
    return this.settings[key];
  }
}
```

**Walkthrough — new syntax.** `private static instance: Configuration |
null = null` — `static` is the TypeScript/JavaScript keyword for a class
attribute (analogous to Python's class-level `_instance = None`): it
belongs to the class itself, not to any particular instance, and there is
exactly one copy of it shared across all uses. `private static` means it
can only be accessed from within the class. `unknown` is a TypeScript
type that means "a value of unknown type" — stricter than `any` (which
opts out of type checking entirely) because `unknown` forces you to check
the type before doing anything with the value. It's used here because
configuration values could be strings, booleans, numbers, or anything
else. `private constructor() {}` — making the constructor `private` means
`new Configuration()` called from *outside* the class is a compile error.
The only way to get an instance is through `getInstance()`. This is
TypeScript's enforcement of "you cannot bypass the Singleton mechanism":
Python's `__new__` approach allows `Configuration()` to be called freely
but intercepts it; TypeScript's private constructor prevents the call
entirely, which is a stronger guarantee.

```typescript
const config1 = Configuration.getInstance();
const config2 = Configuration.getInstance();

console.log(`Same instance? ${config1 === config2}`);

config1.load({ database: "postgres://localhost/mydb", debug: true });

console.log(`config2 debug setting: ${config2.get("debug")}`);
```

```
Same instance? true
  Configuration loaded: {"database":"postgres://localhost/mydb","debug":true}
config2 debug setting: true
```

**Walkthrough:** `config1 === config2` uses JavaScript's strict equality
operator — for objects, `===` checks identity (same object in memory),
exactly as Python's `is` does. Both variables were obtained from
`Configuration.getInstance()` and refer to the same object, so this
returns `true`. The private constructor means attempting
`new Configuration()` directly would be caught by the compiler before the
program even runs:

```typescript
const bad = new Configuration();
```

```
error TS2673: Constructor of class 'Configuration' is private
              and only accessible within the class declaration.
```

**Walkthrough of the compile error:** TypeScript caught the attempt to
bypass the Singleton before the program ran — contrast with Python's
`__new__` approach, which intercepts the attempt at runtime (the
constructor can still be called, it just returns the existing instance).
TypeScript's private constructor is a stronger compile-time guarantee;
Python's `__new__` override is more flexible but catches misuse later.

---

## Concept 2: Template Method

The **Template Method** pattern defines the skeleton of an algorithm in
a base class — the overall sequence of steps — and lets subclasses
override specific steps without changing the skeleton itself. The base
class calls the steps in the right order; the subclasses decide what each
step actually does.

### Problem first

Suppose you're generating reports: some reports are CSV, some are HTML,
some are plain text. All of them follow the same structure: gather data,
format it, add a header, add a footer. The structure is fixed — what
changes is *how* each step is implemented for each format.

Without Template Method, you have two bad options: duplicate the common
structure in every report class (which scatters the "this is the sequence"
knowledge across multiple places, so changing the sequence requires
editing every class), or write one giant function that handles every
format with `if`/`elif` branches (which couples all the format logic
together and requires editing the single function for every new format).

### Python

```python
class ReportGenerator:
    def generate(self, data):
        print(f"Generating {self.__class__.__name__}:")
        gathered = self.gather_data(data)
        header   = self.format_header()
        body     = self.format_body(gathered)
        footer   = self.format_footer()
        report   = self.assemble(header, body, footer)
        print(report)
        return report

    def gather_data(self, data):
        return data

    def format_header(self):
        raise NotImplementedError(f"{self.__class__.__name__} must implement format_header")

    def format_body(self, data):
        raise NotImplementedError(f"{self.__class__.__name__} must implement format_body")

    def format_footer(self):
        raise NotImplementedError(f"{self.__class__.__name__} must implement format_footer")

    def assemble(self, header, body, footer):
        return f"{header}\n{body}\n{footer}"
```

**Walkthrough — new syntax.** `self.__class__.__name__` accesses the name
of the *actual* class of the current object — not `ReportGenerator`, but
whatever subclass was instantiated (`CsvReport`, `HtmlReport`, etc.).
`self.__class__` gives the class object, and `.__name__` is a built-in
attribute on every class that holds its name as a string. This is used in
the error messages so they name the specific subclass that forgot to
implement the method.

`generate` is the **template method**: it defines the algorithm's
skeleton. It calls `gather_data`, `format_header`, `format_body`,
`format_footer`, and `assemble` in a fixed order — the structure that
never changes, regardless of the output format. `gather_data` and
`assemble` have default implementations (so subclasses don't have to
override them if the defaults are fine). `format_header`, `format_body`,
and `format_footer` raise `NotImplementedError` — the same base-class
contract mechanism from Glossary 07's Command pattern: subclasses are
required to override these, and forgetting produces an immediate, clear
error at the moment the missing method is called.

```python
class CsvReport(ReportGenerator):
    def format_header(self):
        return "name,score,grade"

    def format_body(self, data):
        lines = []
        for item in data:
            lines.append(f"{item['name']},{item['score']},{item['grade']}")
        return "\n".join(lines)

    def format_footer(self):
        return f"# Generated: {len(self._data_ref)} records"

    def generate(self, data):
        self._data_ref = data
        return super().generate(data)
```

**Walkthrough — new syntax.** `"\n".join(lines)` is a Python string
method that joins a list of strings with the separator string between
each one — `"\n".join(["a", "b", "c"])` produces `"a\nb\nc"`. This is
the standard Python idiom for building a multi-line string from a list
of lines. `super().generate(data)` calls the parent class's `generate`
method — `super()` returns a proxy object representing the parent class
(`ReportGenerator`), and calling `.generate(data)` on it runs the
parent's version of that method. This allows `CsvReport.generate` to do
its own setup (storing `data` in `self._data_ref` so `format_footer` can
reference it) and then delegate to the template method in the parent
class, which calls all the format steps in sequence.

```python
class HtmlReport(ReportGenerator):
    def format_header(self):
        return "<html><body><table><tr><th>Name</th><th>Score</th><th>Grade</th></tr>"

    def format_body(self, data):
        rows = []
        for item in data:
            rows.append(f"  <tr><td>{item['name']}</td><td>{item['score']}</td><td>{item['grade']}</td></tr>")
        return "\n".join(rows)

    def format_footer(self):
        return "</table></body></html>"
```

```python
students = [
    {"name": "Alice", "score": 92, "grade": "A"},
    {"name": "Bob",   "score": 78, "grade": "C"},
    {"name": "Carol", "score": 85, "grade": "B"},
]

csv_generator  = CsvReport()
html_generator = HtmlReport()

csv_generator.generate(students)
print()
html_generator.generate(students)
```

```
Generating CsvReport:
name,score,grade
Alice,92,A
Bob,78,C
Carol,85,B
# Generated: 3 records

Generating HtmlReport:
<html><body><table><tr><th>Name</th><th>Score</th><th>Grade</th></tr>
  <tr><td>Alice</td><td>92</td><td>A</td></tr>
  <tr><td>Bob</td><td>78</td><td>C</td></tr>
  <tr><td>Carol</td><td>85</td><td>B</td></tr>
</table></body></html>
```

**Walkthrough:** Both report generators call `generate()` and produce
completely different output — because they override the format steps
differently — but both follow the exact same sequence of steps defined
once in `ReportGenerator.generate`. Adding a new format (say,
`MarkdownReport`) requires writing a new class with three methods —
`ReportGenerator` itself never changes. This is the open/closed principle
applied through inheritance: the skeleton is closed for modification,
new behavior is open for addition by creating new subclasses.

**CS lens — Template Method vs Strategy.** Both patterns let you vary
part of an algorithm. The key difference: Strategy (Glossary 07) uses
*composition* — you hold a reference to a separate strategy object and
delegate to it. Template Method uses *inheritance* — you define the
varying parts as methods that subclasses override. Strategy is more
flexible (you can swap strategies at runtime, and the object doing the
work doesn't need to inherit from anything), while Template Method is
simpler when the variation points are always set at class definition time
and don't need to be swapped dynamically.

**SE lens.** Template Method appears in frameworks constantly: a web
framework's base `View` class defines how a request is handled (parse →
authenticate → respond) and lets subclasses override just the "respond"
step. A test framework's `setUp`/`tearDown` mechanism is Template Method.
Django's class-based views, Java's `HttpServlet`, and JUnit's test
lifecycle all use this structure. The pattern is especially suited to
frameworks, where the framework author controls the overall algorithm and
users of the framework provide the specific behavior.

**What breaks without this:** Duplicating the `generate` sequence in
every report class means changing the sequence (say, adding a "validate
data" step before formatting) requires finding and editing every class
that has its own copy. With Template Method, changing the sequence means
editing `ReportGenerator.generate` once, and all subclasses inherit the
change automatically.

### TypeScript

```typescript
abstract class ReportGenerator {
  generate(data: Record<string, unknown>[]): string {
    console.log(`Generating ${this.constructor.name}:`);
    const gathered = this.gatherData(data);
    const header   = this.formatHeader();
    const body     = this.formatBody(gathered);
    const footer   = this.formatFooter();
    const report   = this.assemble(header, body, footer);
    console.log(report);
    return report;
  }

  protected gatherData(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data;
  }

  protected abstract formatHeader(): string;
  protected abstract formatBody(data: Record<string, unknown>[]): string;
  protected abstract formatFooter(): string;

  protected assemble(header: string, body: string, footer: string): string {
    return `${header}\n${body}\n${footer}`;
  }
}
```

**Walkthrough — new syntax.** `abstract class ReportGenerator` — the
`abstract` keyword marks a class that cannot be instantiated directly
(`new ReportGenerator()` is a compile error) and that may contain
`abstract` methods — methods declared without a body. `protected abstract
formatHeader(): string` declares a method that: (1) must be overridden
by every concrete subclass (compile error if not), and (2) is accessible
from within the class and its subclasses but not from outside.
`protected` is a new access modifier: less restrictive than `private`
(which allows access only within the class itself) and more restrictive
than `public` (which allows access from anywhere). `protected` means
"accessible within this class and any class that extends it" — the right
visibility for template method steps: subclasses need to implement or call
them, but outside code should only call `generate`. `this.constructor.name`
is TypeScript/JavaScript's equivalent of Python's
`self.__class__.__name__` — the `constructor` property of an instance
holds its class, and `.name` gives the class name as a string.

```typescript
class CsvReport extends ReportGenerator {
  private dataRef: Record<string, unknown>[] = [];

  generate(data: Record<string, unknown>[]): string {
    this.dataRef = data;
    return super.generate(data);
  }

  protected formatHeader(): string {
    return "name,score,grade";
  }

  protected formatBody(data: Record<string, unknown>[]): string {
    return data
      .map((item) => `${item["name"]},${item["score"]},${item["grade"]}`)
      .join("\n");
  }

  protected formatFooter(): string {
    return `# Generated: ${this.dataRef.length} records`;
  }
}

class HtmlReport extends ReportGenerator {
  protected formatHeader(): string {
    return "<html><body><table><tr><th>Name</th><th>Score</th><th>Grade</th></tr>";
  }

  protected formatBody(data: Record<string, unknown>[]): string {
    return data
      .map(
        (item) =>
          `  <tr><td>${item["name"]}</td><td>${item["score"]}</td><td>${item["grade"]}</td></tr>`
      )
      .join("\n");
  }

  protected formatFooter(): string {
    return "</table></body></html>";
  }
}
```

**Walkthrough — new syntax.** `class CsvReport extends ReportGenerator`
— `extends` is TypeScript/JavaScript's keyword for inheritance, declaring
that `CsvReport` is a subclass of `ReportGenerator`. It's the direct
equivalent of Python's `class CsvReport(ReportGenerator):` syntax.
`super.generate(data)` calls the parent class's `generate` method —
the TypeScript equivalent of Python's `super().generate(data)`. The
`.map((item) => ...).join("\n")` chain: `.map()` transforms each item in
the array using the arrow function (producing an array of strings), and
`.join("\n")` concatenates them with newlines between — the TypeScript
equivalent of Python's `"\n".join(lines)`, expressed as a method chain.

If `HtmlReport` forgot to implement `formatHeader`:

```typescript
// Deliberately incomplete — missing formatHeader
class BrokenReport extends ReportGenerator {
  protected formatBody(data: Record<string, unknown>[]): string { return ""; }
  protected formatFooter(): string { return ""; }
}
```

```
error TS2515: Non-abstract class 'BrokenReport' does not implement
              inherited abstract member 'formatHeader' from class
              'ReportGenerator'.
```

**Walkthrough of the compile error:** `abstract` in TypeScript means
the compiler verifies that every concrete subclass provides all required
overrides before the program runs. Python's `raise NotImplementedError`
only catches the gap at the moment the missing method is actually called
at runtime. TypeScript's `abstract` is the compile-time guarantee — you
can't even build the program if a required method is missing.

```typescript
const students: Record<string, unknown>[] = [
  { name: "Alice", score: 92, grade: "A" },
  { name: "Bob",   score: 78, grade: "C" },
  { name: "Carol", score: 85, grade: "B" },
];

const csvGenerator  = new CsvReport();
const htmlGenerator = new HtmlReport();

csvGenerator.generate(students);
console.log();
htmlGenerator.generate(students);
```

```
Generating CsvReport:
name,score,grade
Alice,92,A
Bob,78,C
Carol,85,B
# Generated: 3 records

Generating HtmlReport:
<html><body><table><tr><th>Name</th><th>Score</th><th>Grade</th></tr>
  <tr><td>Alice</td><td>92</td><td>A</td></tr>
  <tr><td>Bob</td><td>78</td><td>C</td></tr>
  <tr><td>Carol</td><td>85</td><td>B</td></tr>
</table></body></html>
```

---

## Connect the pieces

**Singleton** and **Template Method** are among the most widely
recognized pattern names in the field — both from the original Design
Patterns book (1994). They represent opposite ends of a spectrum.
Singleton is about *restriction*: limiting what the class can do
(create only one instance). Template Method is about *extension*:
defining what the class does and providing controlled points for
subclasses to add behavior.

Singleton is closely related to the Dependency Injection concept in
Glossary 18: Singleton says "there is one of this, reach out and get
it." DI says "there is one of this, and it's handed to you explicitly."
The practical difference is in testability and coupling. Template Method
is closely related to Strategy (Glossary 07): both allow varying part of
an algorithm. Template Method uses inheritance (variation fixed at class
definition time); Strategy uses composition (variation chosen at runtime
by providing a different object).

In TypeScript, `private constructor` made the Singleton enforcement a
compile-time guarantee (you simply cannot call `new` outside the class).
`abstract class` and `abstract` methods made Template Method's required
overrides a compile-time guarantee (a subclass that forgets a required
method cannot be compiled). In Python, both are runtime safeguards
(`__new__` intercepting calls, `raise NotImplementedError` catching
missing methods when called) — correct but discovered later, when the
program actually runs the relevant code path.

## What breaks without these patterns

Without Singleton, shared resources that should be one — configuration,
connection pools, loggers — risk being duplicated accidentally, causing
divergent state that's hard to diagnose. Without Template Method,
duplicated algorithm skeletons across several classes means changing the
sequence requires finding and updating every copy — and missing one
produces a subtle inconsistency that may not be caught until a specific
report format is tested.

## Definition of done

- [ ] You can explain what `__new__` does in Python and why it's used
      instead of `__init__` for the Singleton pattern.
- [ ] You can explain what `private constructor` does in TypeScript and
      why it's a stronger Singleton guarantee than Python's `__new__`
      approach.
- [ ] You can explain the honest criticism of Singleton (it's a global
      variable with extra steps) and name one alternative.
- [ ] You can explain what `abstract class` and `abstract` methods mean
      in TypeScript, and what the equivalent mechanism is in Python.
- [ ] You can explain the difference between Template Method (inheritance,
      variation fixed at class-definition time) and Strategy (composition,
      variation chosen at runtime).
- [ ] You've run both patterns in Python and TypeScript and confirmed
      matching output, including deliberately triggering and reading the
      compile error for the missing abstract method.

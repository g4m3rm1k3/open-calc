# Python Tool Database — Lesson Plan

This file captures every planned lesson before any content is written.
Each entry states what the lesson covers, what it teaches, and what the student builds.
When a lesson feels too broad, it gets split here first — before we write a single line of code.

---

## How to read each entry

- **Covers:** The surface-level topic — what we're talking about
- **Teaches:** The underlying CS or programming principle — the WHY
- **Red:** The failing test written before any production code. What we assert before anything exists.
- **Green:** The minimum code to make the test pass. Not the best code. Just enough.
- **Refactor:** What gets cleaned up after green. The code does the same thing; it just reads better.
- **Builds:** The concrete artifact the student produces and can run at the end of the lesson
- **Patterns:** Named design or architecture patterns demonstrated in this lesson (Observer, Repository, Adapter, etc.)
- **Principles:** Named principles applied or violated in this lesson (SOLID, DRY, Tell Don't Ask, etc.)
- **Alternatives:** What we chose NOT to do, what the alternatives were, and why we made this choice instead. Every significant decision has trade-offs. Name them.
- **XP principle:** Which XP practice this lesson emphasizes or demonstrates
- **Watch for:** Topics that may need to be split into their own lesson if they get too deep

Block 0 lessons are conceptual — no code yet, so Red/Green/Refactor are written as descriptions rather than actual tests. From Block 1 onward, every lesson follows the cycle with real code.

---

## Block 0 — How We Work: XP, Agile, and TDD

*Goal: Establish the working method before writing a single line of code. Every lesson from here on follows the Red-Green-Refactor cycle. Every decision is guided by the XP principles introduced here. These are not abstract values — they are practical rules that we apply visibly in every lesson.*

*These lessons have no code yet. Red/Green/Refactor sections describe what the cycle will look like, not actual test code.*

---

### Lesson 00 — Why Software is Hard and What XP Does About It

**Covers:** The fundamental problem software development solves, why plans fall apart, and what Extreme Programming is

**Teaches:**

- The core problem: requirements change. The thing you build is never exactly what was first described, because people don't fully understand what they want until they start seeing it. A methodology that assumes requirements are fixed will fail.
- What Extreme Programming (XP) is: a set of practices created by Kent Beck around 1996-1999 that embraces change instead of fighting it. Build in very small steps. Get feedback constantly. Change course early when it's cheap, not late when it's expensive.
- The Agile Manifesto (2001): seventeen people including Kent Beck met and wrote four values that captured what XP and similar methodologies had in common:
  - Working software over comprehensive documentation — a running program teaches you more than any plan
  - Individuals and interactions over processes and tools — people solve problems, tools don't
  - Customer collaboration over contract negotiation — work with the person who needs it, not against them
  - Responding to change over following a plan — change is normal, not a failure
- Why these values matter for solo projects too: you are both the developer and the customer. You will change your mind. The methodology has to handle that.
- XP's answer: keep every piece of the system small, tested, and clean so that changing any of it is never a big deal. The goal is a codebase you are never afraid to touch.

**Red:** No test yet — this lesson is conceptual. The first real Red step is Lesson 01.

**Green:** No code yet.

**Refactor:** No code yet.

**Builds:** A one-page personal notes document: in your own words, why does software change, and what does "responding to change" mean for a tool database project specifically?

**XP principle:** The whole lesson is the context for every XP principle that follows.

**Watch for:** This lesson can spark a long philosophical discussion. Keep it grounded in the tool database project — every abstract idea should be connected to a concrete example from what you are about to build.

---

### Lesson 00b — The XP Practices: A Field Guide

**Covers:** The full set of XP practices, which ones we use in this project, and how they connect to each other

**Teaches:**

- XP is not one idea — it is a set of twelve practices that reinforce each other. Using one in isolation is fine. Using all of them together is where the real benefits appear.
- The practices we use in this project and what each one means:
  - **Test-Driven Development (TDD):** Write the test before the code. The test defines what "done" means. You are never guessing whether something works — the test tells you.
  - **Refactoring:** After the test passes, improve the code without changing what it does. Rename a variable to be clearer. Break a long function into two. Remove duplication. The tests protect you — if they still pass, the refactor was safe.
  - **Simple Design:** Build only what the current test requires. If a test doesn't demand it, don't build it. This is the practice that keeps the project from growing into something unmanageable.
  - **YAGNI — You Aren't Gonna Need It:** The specific rule behind Simple Design. If you are tempted to add a feature "just in case," don't. You probably won't need it, and when you do need it, you'll understand the problem better than you do now.
  - **Small Releases:** Every lesson ends with working, runnable software. You never have a half-built system that can't run. If you stop after any lesson, you have something complete.
  - **Continuous Integration:** Run all tests after every change. If something broke, you find out immediately — not three days later when you've forgotten what you changed.
  - **Collective Code Ownership:** Any part of the code can be changed at any time. No part is untouchable because only one person understands it. Tests make this safe.
  - **Coding Standards:** Consistent style throughout. Python has PEP 8 — a standard formatting guide. We follow it so the code reads the same everywhere.
- The practices we won't use (and why): Pair Programming requires two people. On-site Customer requires a separate client. These are valuable in a team setting — just not applicable here.

**Red:** No test yet.

**Green:** No code yet.

**Refactor:** No code yet.

**Builds:** Annotate the lesson plan with which XP practice each block primarily exercises. Block 1 (Python basics): Simple Design + Small Releases. Block 2b (Testing): TDD + Continuous Integration. Block 5 (SQLAlchemy): Refactoring. And so on.

**XP principle:** This lesson IS the field guide. Return to it whenever a practice feels unclear during a later lesson.

**Watch for:** Students sometimes treat XP practices as rules to follow perfectly. They are tools, not laws. Use the ones that help; adapt the ones that don't fit. The goal is working software, not compliance.

---

### Lesson 00c — Red-Green-Refactor: The Heartbeat

**Covers:** The TDD cycle in depth — what each step means, why the order matters, how long a cycle should take

**Teaches:**

- The three steps of TDD, and why each one is necessary:
  - **Red — write a failing test first.** Not after. Before. The test defines exactly what you are about to build. Seeing it fail first matters: it proves the test actually checks something real. A test that passes before you write the code is broken — it is not checking anything.
  - **Green — write the minimum code to make the test pass.** Not the best code. Not the most flexible code. The simplest code that turns the red test green. If you can make it pass with one line, use one line.
  - **Refactor — improve the code without changing what it does.** The tests are now your safety net. Rename the variable. Break the function into two. Remove the copy-pasted logic. Run the tests after every small change. Green means the refactor was safe. Red means you accidentally changed behavior — undo and try again.
- Why the order is not optional: writing the test after is tempting but defeats the purpose. You already know the code works, so you unconsciously write a test that confirms what you already built rather than one that demands what you need. Writing it first forces you to think about the interface — what does this function take in, what does it return — before you are lost in the implementation details.
- Cycle length: a Red-Green-Refactor cycle should take minutes. If a cycle is taking more than 20 minutes, the step is too big. Break it into smaller steps. This is a skill that develops with practice.
- The psychological benefit: at any moment, you are either in Red (a specific failing test), Green (all tests passing, safe to stop), or Refactor (cleaning up, tests still green). You always know exactly where you are. There is no "I think this might work" state.

**Red:** The first real Red step: write `assert calculate_sfm(1.0, 3820) == 1000` before `calculate_sfm` exists. Run it. See it fail with `NameError: name 'calculate_sfm' is not defined`. That error IS the point.

**Green:** Write `def calculate_sfm(d, rpm): return 3.14159 * d * rpm / 12`. Run the test. Green.

**Refactor:** Rename `d` to `diameter_inches`. Extract `3.14159` to `import math; math.pi`. Run the test. Still green. The code is cleaner; the behavior is identical.

**Builds:** The `calculate_sfm` function, built entirely through one Red-Green-Refactor cycle. This is the first real code in the project, written in the exact style that every lesson from here on will follow.

**XP principle:** Test-Driven Development, Refactoring, Simple Design — all three visible in a single cycle.

**Watch for:** The temptation to write more than one test at a time. Resist it. One test. Make it pass. Clean it up. Then the next test.

---

### Lesson 00d — YAGNI and Simple Design

**Covers:** You Aren't Gonna Need It, the rule of simple design, how to decide what to build right now

**Teaches:**

- YAGNI is a rule: do not build something until a test demands it. Not "it seems like we'll need this." Not "I'll add it now while I'm thinking about it." Only when a test fails because it is missing.
- Why YAGNI matters: every line of code you write has to be read, understood, tested, and maintained forever. Code you didn't need is pure cost with no benefit. YAGNI keeps the project lean.
- Simple Design has four rules (Kent Beck's original list, in priority order):
  1. The code passes all the tests
  2. The code contains no duplication
  3. The code expresses its intent clearly (good names, small functions)
  4. The code has the fewest possible classes and methods that satisfy rules 1-3
- Rule 4 is the YAGNI rule in design terms: don't add a class, a layer, or a pattern until rules 1-3 require it.
- How this applies to the tool database: don't build the Mastercam import until a test demands it. Don't add the assembly junction table until a test fails because it's missing. Build the smallest thing that makes the current test pass, then look at the next test.
- The tension with planning: the lesson plan covers 70+ lessons, so you do know roughly where you are going. YAGNI does not mean no planning — it means no premature building. Plan broadly, build narrowly.

**Red:** No new test yet. Apply YAGNI to the `calculate_sfm` function: is there anything you added in Lesson 00c that no test required? If yes, delete it.

**Green:** The function already passes its tests. Nothing to do.

**Refactor:** No change needed.

**Builds:** A short checklist pinned to the working method: before writing any new code, ask — does a failing test demand this? If no, don't write it.

**XP principle:** YAGNI, Simple Design.

**Watch for:** YAGNI can be taken too far — "I won't write error handling until a test fails because of bad input" is correct in TDD, but some defensive checks are worth adding proactively. Use judgment. The principle is about features and abstractions, not basic safety.

---

### Lesson 00e — Refactoring: Improving Code Without Breaking It

**Covers:** What refactoring is and is not, common refactoring moves, when to refactor and when to stop

**Teaches:**

- Refactoring has a precise definition: changing the internal structure of code without changing its observable behavior. The tests pass before the refactor. The tests still pass after. If any test fails, it was not a refactor — it was a change.
- What refactoring is NOT: adding a feature, fixing a bug, or rewriting from scratch. Those are different activities. Do them separately.
- Why tests make refactoring safe: without tests, you cannot know if a cleanup changed behavior. With tests, you have proof. This is why TDD and Refactoring are inseparable XP practices.
- Common refactoring moves you will use in every lesson:
  - **Rename:** give a variable, function, or class a more accurate name. The most common and most valuable refactoring.
  - **Extract Function:** take a block of code inside a function and give it its own name. Makes the parent function shorter and more readable.
  - **Inline Variable:** a variable used only once and whose name adds nothing — just use the expression directly.
  - **Remove Duplication:** if the same logic appears in two places, extract it into one place and call it from both. This is the DRY principle — Don't Repeat Yourself.
  - **Move Function:** a function that uses more data from module B than module A belongs in module B.
- When to refactor: during the Refactor step of every Red-Green-Refactor cycle. Not during Red (you're writing a test). Not during Green (you're making it pass). After Green. Always after Green.
- When to stop refactoring: when the code clearly expresses what it does and contains no duplication. Stop before it is "perfect" — perfect is a trap. Clean is enough.

**Red:** No new feature. Find one name in `calculate_sfm` that could be clearer. Write a comment (not a test — just a note to yourself) naming the improvement.

**Green:** Make the rename.

**Refactor:** Run all tests. Still green. The refactor is complete.

**Builds:** A personal refactoring log: one entry per lesson where you note what you renamed, extracted, or removed. Keeps the habit visible.

**XP principle:** Refactoring, Simple Design, Continuous Integration (running tests after every change).

**Watch for:** Refactoring sessions can expand without limit. Set a timer. 10 minutes of refactoring per cycle is usually enough. If it takes longer, the code needed a bigger restructure — plan that as its own step.

---

### Lesson 00f — Hexagonal Architecture: The Domain at the Center

**Covers:** What Hexagonal Architecture is, why the UI being "replaceable" is an architectural property not a plan, how every external system connects to the domain through a port

**Teaches:**

- The core problem with layered thinking: "UI on top, database on the bottom" still lets each layer know too much about the next one. If the service layer imports SQLAlchemy directly, it cannot work without SQLAlchemy. If the form handler calls the repository directly, the form is coupled to the database.
- Hexagonal Architecture (also called Ports and Adapters, or Onion Architecture): the domain — the real-world concepts being modeled — lives at the center. It has zero dependencies on anything external. It does not know whether it is being called by a desktop app, a web API, a test, or a command-line script. It does not know whether data is stored in SQLite, PostgreSQL, or a flat file.
- A **port** is an interface — a defined contract describing what the domain needs from the outside world. "I need something that can save a tool and retrieve tools by material." The domain defines the port.
- An **adapter** implements the port for a specific technology. The SQLAlchemy repository is one adapter. A test fake repository (just a Python dict) is another adapter. The domain calls the port; it never knows which adapter is behind it.
- How this answers the UI question: PySide6 is an adapter. A FastAPI route handler is an adapter. React calling that route handler is another adapter. All of them plug into the same domain through the same ports. Nothing gets replaced — a new adapter is added.
- How this answers the database question: SQLite is an adapter. If the shop grows and needs PostgreSQL, write a new adapter that implements the same port. The domain does not change. The services do not change. Only the adapter changes.
- The practical consequence: the domain can be fully tested with no database, no UI, and no network. Tests are fast, isolated, and complete. This is only possible if the domain truly has no external dependencies.

**Red:** Write a test for `ToolService.create_tool` that uses a fake in-memory repository (not SQLite). The test should pass even if SQLite is not installed.

**Green:** Create a `ToolRepositoryPort` abstract class with methods `save(tool)` and `find_by_material(material)`. `ToolService` depends on `ToolRepositoryPort`, not on any concrete class. A `FakeToolRepository` implements the port with a plain Python list.

**Refactor:** The service test no longer imports anything database-related. Confirm this and note it.

**Builds:** The `ToolRepositoryPort` interface and a `FakeToolRepository` for use in tests. From this lesson forward, services depend on ports, never on concrete adapters.

**Patterns:** Ports and Adapters (Hexagonal Architecture), Dependency Inversion

**Principles:** Dependency Inversion Principle (the D in SOLID) — high-level code depends on abstractions, not concretions

**XP principle:** Simple Design, Testability

**Watch for:** Abstract base classes in Python (`ABC`, `abstractmethod`) are the tool for defining ports. Introduce them here if not covered yet, or reference Lesson 07 where they appear.

---

### Lesson 00g — SOLID: Five Rules for Code That Can Change

**Covers:** Each of the five SOLID principles with a concrete example from the tool database, what breaks when each is violated

**Teaches:**

- SOLID is not five separate ideas — it is one idea from five angles. The idea: write code so that adding a new feature or changing an existing one requires touching as little existing code as possible. Each principle is a specific rule for achieving that.
- **S — Single Responsibility Principle:** a class or function has one reason to change. `ToolRepository` changes when storage logic changes. `ToolValidator` changes when validation rules change. If one class does both, it changes for two different reasons — two different risks of breaking.
  - Violation example: a `Tool` class that validates itself, saves itself to the database, and formats itself for display. Three responsibilities. One change to the display format requires touching the same class as a change to the validation rules.
- **O — Open/Closed Principle:** open for extension, closed for modification. Add a new tool type (a thread mill) without modifying the existing `Drill` or `EndMill` code. The base class is closed (don't change it); new subclasses extend it.
  - Violation example: a long `if tool_type == "drill": ... elif tool_type == "endmill": ...` block that must be modified every time a new tool type is added.
- **L — Liskov Substitution Principle:** anywhere you use a `Tool`, a `Drill` must work correctly. A subclass must not break the behavior the base class promises.
  - Violation example: `Drill.describe()` returns `None` instead of a string. Code that calls `tool.describe()` breaks silently when given a `Drill`.
- **I — Interface Segregation Principle:** don't force a class to implement methods it doesn't need. A read-only repository for reporting doesn't need `save()` or `delete()`. Split the port into `ToolReaderPort` and `ToolWriterPort` if they have different users.
  - Violation example: one giant `ToolRepositoryPort` with 15 methods, most of which the reporting service never calls.
- **D — Dependency Inversion Principle:** high-level policy (the service) should not depend on low-level details (SQLAlchemy). Both should depend on an abstraction (the port). Already implemented in Lesson 00f — named here.
  - Violation example: `ToolService` imports `from sqlalchemy.orm import Session`. The service is now coupled to SQLAlchemy forever.

**Red:** No new feature. Read through the current `ToolService` and `ToolRepository` code. Write down which SOLID principle each method either follows or violates. This is an analysis exercise.

**Green:** Fix one violation found above.

**Refactor:** The fix itself is the refactor.

**Builds:** A SOLID checklist to run against every new class written from this lesson onward: one question per principle.

**Patterns:** Dependency Inversion, Strategy (O principle often leads here)

**Principles:** All five SOLID principles, introduced together

**XP principle:** Simple Design, Refactoring

**Watch for:** SOLID principles sometimes seem to contradict each other — adding an abstraction for D can violate S if it gets too large. Acknowledge this. The principles are guides, not absolute laws.

---

### Lesson 00h — Domain-Driven Design: Modeling the Real World

**Covers:** DDD vocabulary — entities, value objects, aggregates, repositories, ubiquitous language, domain services vs application services

**Teaches:**

- Domain-Driven Design (Eric Evans, 2003) is an approach to software design that starts with the real-world domain — the actual problem being solved — before thinking about databases, UIs, or frameworks. The software model mirrors the domain expert's mental model.
- **Ubiquitous Language:** use the same words the domain expert uses. If a machinist calls it "stickout," the code says `stickout`, not `protrusion` or `extension`. If they say "assembly," every layer uses `assembly`. Mismatched language is a constant source of confusion and bugs.
- **Entity:** something with identity that persists over time. Tool #47 is still Tool #47 even if its diameter is changed. Two tools with identical geometry are still two different tools if they have different IDs. Identity is what makes something an entity.
- **Value Object:** something defined entirely by its value. A diameter of 0.5 inches is equal to any other 0.5 inch diameter — there is no "identity" to track. Coordinates, measurements, money amounts, and date ranges are typically value objects. Value objects are immutable — you don't change a value object, you replace it with a new one.
- **Aggregate:** a cluster of objects treated as one consistent unit with a single entry point. An `Assembly` aggregate owns its `Tool` and `Holder` references. You don't reach in and modify the `Tool` directly through the `Assembly` — you go through the `Assembly`'s methods. The aggregate root (`Assembly`) enforces the invariants.
- **Repository:** the collection abstraction for retrieving and storing aggregates. Repositories speak domain language: `tool_repository.find_carbide_tools_under(diameter=0.5)`, not `session.query(Tool).filter(Tool.material == 'carbide', Tool.diameter < 0.5).all()`.
- **Domain Service:** logic that involves multiple entities but doesn't belong to any one of them. `calculate_recommended_sfm(tool, material, machine)` doesn't belong to `Tool` alone — it is a domain service.
- **Application Service:** orchestrates a use case. `ImportMastercamLibrary` is not domain logic — it coordinates reading a file, validating records, calling the domain, and saving results. It belongs in the application layer, not the domain.

**Red:** Rename one thing in the codebase whose current name doesn't match what a machinist would call it. Write the test first to confirm the new name works.

**Green:** The rename.

**Refactor:** Check that the rename is consistent everywhere.

**Builds:** A domain glossary document: the ten most important terms in this system, each defined in one sentence using the machinist's language, with its DDD classification (entity, value object, aggregate, service).

**Patterns:** Repository, Domain Service, Aggregate

**Principles:** Ubiquitous Language, Model-Driven Design

**XP principle:** Collective Code Ownership — everyone uses the same names

**Watch for:** DDD goes very deep (bounded contexts, context maps, anti-corruption layers). For this project, introduce the core vocabulary and apply it consistently. The deeper concepts are worth reading about but not necessary to implement at this scale.

---

### Lesson 00i — Programming Paradigms: Imperative, Declarative, Functional

**Covers:** The three paradigms you will use in this project, what each one is good at, how to recognize which you are using

**Teaches:**

- A paradigm is a style of giving instructions to a computer. Different problems are easier to express in different styles. Good programmers recognize which tool fits the problem.
- **Imperative:** tell the computer exactly how to do something, step by step. A `for` loop that filters a list, checks each item, appends matching ones to a result. You are describing the procedure.
  - Good for: algorithms, precise control, step-by-step processes
  - Risk: long sequences of steps become hard to read and reason about
- **Declarative:** tell the computer what you want, not how to get it. SQL's `SELECT * FROM tools WHERE material = 'carbide'` does not describe how to search — it describes the desired result. Pydantic's `class ToolCreate(BaseModel): diameter: float` does not describe how to validate — it describes what valid data looks like.
  - Good for: data retrieval, configuration, schemas, rules
  - Risk: when the "how" matters for performance, declarative abstractions can hide problems
- **Functional:** treat computation as the transformation of values through pure functions. No side effects. No shared state. A function that takes a list of tools and returns a filtered list without modifying the original.
  - Good for: data transformation pipelines, testability, parallel computation
  - Risk: can become difficult to read when chained deeply; does not map naturally to stateful systems
- How all three appear in this project:
  - Imperative: Python `for` loops, the migration runner, file scanning
  - Declarative: SQL queries, Pydantic schemas, SQLAlchemy model definitions, pytest assertions
  - Functional: data transformation in the import pipeline (map raw Mastercam rows to `ToolCreate` objects), filter functions, pure validation functions
- The practical rule: use declarative when the framework supports it (SQL for queries, Pydantic for validation). Use functional for data transformations where no side effects are needed. Use imperative when you need explicit control of steps.

**Red:** Write the same filter two ways: imperatively (a `for` loop building a list) and declaratively (a list comprehension or a SQL query). Write a test that both produce the same result.

**Green:** Both implementations pass.

**Refactor:** The SQL version is usually shorter and clearer for this case. Keep it. Delete the loop version. Note why.

**Builds:** A reference card: three columns (Imperative / Declarative / Functional), three rows (what it is / when to use it / example from this project).

**Patterns:** None specific — this is a meta-pattern lesson

**Principles:** Separation of concerns — use the right paradigm for the right layer

**XP principle:** Simple Design — use the simplest paradigm that expresses the intent clearly

**Watch for:** List comprehensions and generator expressions blur imperative and functional — they look functional but Python evaluates them imperatively. This is fine; note it rather than treating it as a contradiction.

---

### Lesson 00j — Design Patterns: A Reference for the Whole Project

**Covers:** What a design pattern is, the patterns used in this project, how to recognize when a pattern applies

**Teaches:**

- A design pattern is a named, reusable solution to a recurring design problem. The name is what makes it valuable — when you say "this is the Observer pattern," everyone who knows the pattern immediately understands the structure, the intent, and the tradeoffs.
- Patterns are not code to copy — they are shapes to recognize. The same pattern can look very different in different languages and contexts.
- Patterns used in this project, listed here so they can be recognized when they appear:
  - **Repository** (data access): hides database details behind a domain-language interface. Appears in Block 2.
  - **Adapter** (integration): translates between two incompatible interfaces. The Mastercam import layer. Appears in Block 7.
  - **Observer** (events): when something changes, notify all interested parties without coupling them. Qt signals and slots. Appears in Block 3.
  - **Command** (actions): encapsulate an action as an object with a name, shortcut, and undo capability. Qt `QAction`. Appears in Block 3.
  - **Factory** (object creation): create the right type of object based on a parameter, without the caller knowing the concrete type. Creating a `Drill` or `EndMill` from a `tool_type` string. Appears in Block 4.
  - **Strategy** (swappable algorithms): define a family of algorithms, encapsulate each, make them interchangeable. The merge policy (SKIP, OVERWRITE, RENAME). Appears in Block 9.
  - **Facade** (simplified interface): provide a simple interface to a complex subsystem. `ToolService` is a facade over validation, repository, and ORM complexity. Appears in Block 5.
  - **Proxy** (wrapped behavior): wrap an object to add behavior without changing its interface. `QSortFilterProxyModel` wraps a table model to add filtering. Appears in Block 10.
  - **Value Object** (identity-free data): an object defined by its value, not its identity. A measurement, a date range, a tool specification without an ID. Introduced in Lesson 00h; applied throughout.
  - **Decorator** (layered behavior): add behavior to an object by wrapping it. Python's `@decorator` syntax. Used in validators, fixtures, and route handlers.
- This lesson is a reference. Every subsequent lesson that introduces one of these patterns will name it explicitly and link back here.

**Red:** No test. This is a reading lesson.

**Green:** No code.

**Refactor:** No code.

**Builds:** The patterns section of the domain glossary: each pattern listed with a one-sentence description and the lesson where it first appears in the project.

**Patterns:** All of the above — introduced by name

**Principles:** Don't solve the same problem twice — recognize a pattern, apply the known solution

**XP principle:** Collective Code Ownership — shared vocabulary makes code readable to everyone

**Watch for:** Pattern overuse is a real problem. Applying a pattern where a simple function would do is over-engineering. The test: does naming it a pattern make it clearer, or just more complicated?

---

### Lesson 00k — Architecture Patterns: The Map of All the Options

**Covers:** Every major software architecture pattern, why each exists, what problem it solves, what it costs, and why Hexagonal was chosen for this project

**Teaches:**

- An architecture pattern is not a tool — it is a set of decisions about where responsibility lives and how pieces of the system communicate. Every architecture makes some things easy and other things hard. Choosing well means understanding what you are trading.
- **Big Ball of Mud:** no architecture at all. Functions call each other freely. No layers, no rules. Works for a small script. Collapses under its own weight as the project grows. Every change risks breaking something unrelated. Most software starts here and many systems stay here accidentally.
- **Layered Architecture (N-Tier):** the classic: Presentation → Business Logic → Data Access → Database. Each layer only talks to the layer directly below it. Simple to understand, widely taught. The weakness: layers still depend on each other directly. The business logic layer imports from the data access layer. Changing the database can force changes up through every layer. Good starting point; outgrown by complex systems.
- **MVC — Model, View, Controller:** designed for GUIs and web apps. The Model owns the data and rules. The View renders what the user sees. The Controller receives input and decides what to do. The problem in practice: controllers grow fat. All logic ends up in the controller because it is the one thing that talks to both Model and View. "Fat controller, thin model" is the anti-pattern. Qt's `QAbstractTableModel` is a genuine MVC implementation — the model owns the data, the view renders it, signals act as the controller.
- **MVP — Model, View, Presenter:** a stricter variation. The View is completely passive — it only displays what the Presenter tells it and forwards all input to the Presenter. The Presenter handles all logic. The View can be replaced with a test double, making the Presenter testable without a screen. Common in Android development and desktop apps.
- **MVVM — Model, View, ViewModel:** the architecture behind React, Angular, Vue, and WPF. The ViewModel holds the state of the UI as data. The View binds to the ViewModel automatically — when the ViewModel changes, the View updates without explicit code. When you get to React, this is what you are doing: component state is the ViewModel, the JSX is the View.
- **Hexagonal / Ports and Adapters:** the domain is the center. Ports (interfaces/abstract classes) define what the domain needs from the outside. Adapters implement those ports for specific technologies (SQLAlchemy implements the repository port; Qt forms implement the UI port). The domain depends on nothing external. Anything external can be swapped by replacing its adapter.
- **Clean Architecture (Robert Martin):** a more prescriptive version of Hexagonal with four explicit rings — Entities (innermost), Use Cases, Interface Adapters, Frameworks and Drivers (outermost). One strict rule: the Dependency Rule — source code dependencies must point inward only. Nothing in an inner ring knows about an outer ring. More ceremony than Hexagonal; better for large teams.
- **Event-Driven Architecture:** components communicate by publishing and subscribing to events rather than calling each other directly. A tool is saved → a "ToolSaved" event is published → any interested component (audit log, search index, notification service) reacts independently. Very loosely coupled. Very hard to trace a bug through.
- **CQRS — Command Query Responsibility Segregation:** reads and writes are handled by completely separate paths. Commands change state (create a tool, delete a job). Queries read state (list tools, get job details). The read model can be optimized for display (denormalized, pre-joined) without the write model becoming messy. Powerful for performance. Adds significant complexity.
- **Microservices:** each part of the system is a separate deployed service with its own database. Independent scaling, independent deployment, independent teams. Requires significant infrastructure. Almost certainly wrong for a desktop manufacturing tool used by one or a few people.
- **Monolith:** one codebase, one deployment. What this project is. This is not a compromise — for the scale of this project, a well-structured monolith with Hexagonal Architecture is simpler to build, easier to debug, and faster to change than any distributed alternative.

**Why Hexagonal for this project specifically:**

- We want to swap the UI without touching the domain — Hexagonal makes this an architectural property, not a promise
- We want fully isolated, fast tests that run without a database — only possible if the domain has no database dependency
- We want to potentially swap SQLite for PostgreSQL someday — one new adapter, nothing else changes
- We want to integrate with Mastercam and XML without the domain knowing about file formats — adapters handle the translation

**Why not the others:**

- Layered: too coupled for our swap requirements
- MVC: appropriate for the UI layer specifically (and we do use it there), but not sufficient as the whole-system architecture
- MVVM: the right model for the React UI when we get there — but that is one layer, not the whole system
- Clean Architecture: same goals as Hexagonal, more prescriptive, appropriate for larger teams
- Event-Driven: adds complexity we don't need; our workflows are straightforward request-response
- CQRS: interesting, worth knowing, not needed at this scale
- Microservices: wrong tool entirely for this project

**Red:** No test. Reading and analysis lesson.

**Green:** No code.

**Refactor:** No code.

**Builds:** A one-page architecture decision record (ADR) for this project: the chosen architecture, the alternatives considered, and the reasons. This document lives in the project root and is updated as architectural decisions are made throughout the project.

**Patterns:** Hexagonal Architecture, MVC, MVVM, Clean Architecture — all introduced and compared

**Principles:** Separation of concerns, Dependency Inversion

**Alternatives:** Every major architecture listed above, with reasons for and against

**XP principle:** Simple Design — use the simplest architecture that meets the actual requirements

**Watch for:** Architecture astronauts — people who add architectural complexity because it is interesting, not because it is needed. The question to ask before any architectural decision: "What problem does this solve that I actually have right now?"

---

### Lesson 00l — Clean Code: Rules for Code That Reads Like Prose

**Covers:** Naming, function size, comments, formatting, the boy scout rule — the principles applied during every Refactor step

**Teaches:**

- Clean code is not about aesthetics. It is about the cost of reading code. Every developer spends more time reading code than writing it — including reading their own code from three weeks ago. Clean code minimizes that cost.
- **Naming reveals intent:** variable names, function names, and class names should say exactly what they are. `d` is bad. `diameter_inches` is good. If you need a comment to explain a name, the name is wrong. Fix the name.
  - Functions: use verbs. `calculate_sfm`, `validate_tool`, `find_by_material`. A function name describes an action.
  - Classes: use nouns. `Tool`, `ToolRepository`, `ImportReport`. A class name describes a thing.
  - Booleans: use `is_` or `has_` prefixes. `is_valid`, `has_errors`, `is_carbide`.
- **Functions do one thing:** if you need "and" to describe what a function does, it does two things. Split it. A function that validates AND saves is two functions. A function that reads a file AND parses it AND inserts records is three functions.
- **Function length:** a function should fit on one screen without scrolling. If it does not, it is doing too much. The rule is not about line count — it is about comprehension. Can you read the function and understand it without scrolling back to remember what was at the top?
- **Comments explain WHY, not WHAT:** the code says what it does (through good names). Comments explain why it does it that way — a non-obvious constraint, a workaround for a known bug, a business rule that has no other documentation. A comment that says `# increment counter` above `counter += 1` is noise.
- **Dead code is deleted:** code that is commented out, functions that are never called, variables that are assigned but never read — delete them. Version control remembers the past. Commented-out code is clutter that erodes trust in the codebase.
- **The Boy Scout Rule:** leave the code cleaner than you found it. Every time you touch a file, improve one small thing — rename one variable, extract one function, delete one dead comment. Incremental improvement accumulates.
- **Consistency:** the most readable codebase is one where every file looks like it was written by the same person. Python has PEP 8. We use it. We use a formatter (`black`) so the formatting is never argued about.

**Red:** Pick any function written so far. Write a test that documents its current behavior exactly.

**Green:** The test passes — the behavior is unchanged.

**Refactor:** Apply at least three clean code rules to the function. Run the test after each change. Green throughout.

**Builds:** Add `black` (Python auto-formatter) to the project. Run it. Every file is now consistently formatted without effort.

**Patterns:** None specific

**Principles:** Single Responsibility (functions do one thing), DRY (don't repeat yourself), Boy Scout Rule

**XP principle:** Refactoring, Coding Standards

**Watch for:** Clean code is a skill that takes time to develop. Don't critique every lesson's code for cleanliness — that becomes paralyzing. Apply it during the Refactor step and let it improve naturally.

---

*Goal: Read and write Python confidently. Understand how Python is structured and why it works the way it does — not just syntax, but the concepts behind it. Every lesson in this block follows Red-Green-Refactor. Because we are learning Python syntax at the same time as TDD, some Red steps will be very small — a one-line assertion on a one-line function. That is intentional. Small cycles build the habit.*

---

### Lesson 01 — Running Python and the REPL

**Covers:** Installing Python, running a script, using the interactive REPL (Read-Eval-Print Loop)

**Teaches:**

- What an interpreter is vs a compiler — an interpreter runs your code line by line; a compiler translates the whole program before running it
- What the REPL is and why it exists — try a thing, see a result immediately
- The difference between a script file and an interactive session
- How Python finds and runs your code (the `__main__` entry point concept)

**Builds:** A script that prints "Tool Database" and a few tool dimensions to the terminal. Student runs it two ways: as a file and line by line in the REPL.

**Watch for:** The interpreter vs compiler distinction could become its own lesson if the student wants depth on how Python executes code internally.

---

### Lesson 02 — Variables, Types, and Expressions

**Covers:** `int`, `float`, `str`, `bool`, `None`. Variable assignment. Basic arithmetic and string operations.

**Teaches:**

- Python's dynamic typing vs JS's `var`/`let`/`const` — what "dynamic" actually means at runtime
- What a type IS — a set of values plus a set of operations
- Why `None` exists as a distinct concept (absence of value vs zero vs empty string)
- String formatting with f-strings — why f-strings are the modern approach

**Builds:** A function `describe_tool(name, diameter, flutes)` that returns a formatted string. Student calls it with different inputs and sees different outputs.

**Watch for:** Type coercion rules in Python (int + float = float, etc.) could expand into a lesson on Python's type system and duck typing.

---

### Lesson 03 — Control Flow: if, for, while

**Covers:** `if/elif/else`, `for` loops with `range()`, `for` loops over lists, `while` loops, `break`, `continue`

**Teaches:**

- Boolean expressions and truthiness — what Python considers "truthy" and why it matters
- The difference between iterating a range vs iterating a collection (index-based vs value-based)
- When to use `for` vs `while` — deterministic count vs condition-dependent
- Loop invariants as a concept: what must be true at the start of every iteration

**Builds:** A loop that iterates over a hard-coded list of tool diameters and prints which ones are "standard" (match a reference list) and which are "special order."

**Watch for:** List comprehensions are a natural follow-on and could be their own lesson. Also: `enumerate()` and `zip()` are important enough to warrant explicit coverage.

---

### Lesson 04 — Functions

**Covers:** `def`, parameters, return values, default arguments, keyword arguments, `*args`, `**kwargs`

**Teaches:**

- Functions as units of abstraction — hiding a computation behind a name
- The call stack: what happens in memory when a function is called (frame pushed, local variables created, frame popped on return)
- Default arguments and why mutable defaults are a famous Python trap
- The difference between a parameter (the name in the definition) and an argument (the value passed in)

**Builds:** A `calculate_sfm(diameter, rpm)` function and a `recommended_rpm(diameter, material)` function. Student composes them — calls one, feeds the result to the other.

**Watch for:** First-class functions (passing functions as arguments) and closures are important but belong in a later lesson when they're needed. Don't introduce them here.

---

### Lesson 05 — Lists, Tuples, Dicts, Sets

**Covers:** The four core Python collections. When to use each. Iteration, membership testing, common methods.

**Teaches:**

- List vs tuple: mutability — what it means for a value to be immutable and why immutability matters for safety
- Dict as a hash map: how keys map to values in O(1) time (hash function concept, briefly)
- Set for membership testing: why `in` is faster on a set than a list
- The difference between ordered and unordered collections

**Builds:** A dict that maps tool material (`"HSS"`, `"Carbide"`) to a recommended SFM range. A function that looks up the range and returns it. A list of tools each represented as a dict with keys `name`, `diameter`, `material`.

**Watch for:** Dict comprehensions, list comprehensions, and generator expressions could each be a lesson. Introduce list comprehensions here briefly; defer generators.

---

### Lesson 06 — Classes and Objects

**Covers:** `class`, `__init__`, instance attributes, methods, `self`

**Teaches:**

- What an object IS: a bundle of state (data) and behavior (functions that act on that data)
- Why `self` is explicit in Python and what it actually refers to (the instance)
- The difference between an instance attribute and a class attribute
- What `__init__` is — not a constructor in the C++ sense, but an initializer called after the object exists
- The mental model: a class is a blueprint, an object is a thing built from that blueprint

**Builds:** A `Tool` class with attributes `name`, `diameter`, `flutes`, `material`. A method `describe()` that returns a formatted string. Student creates multiple Tool instances and calls `describe()` on each.

**Watch for:** `__repr__` and `__str__` are important enough to cover here as a natural extension. Dunder methods as a general concept should be flagged for a future lesson.

---

### Lesson 07 — Inheritance and Polymorphism

**Covers:** `class Child(Parent)`, `super().__init__()`, method overriding

**Teaches:**

- Inheritance as code reuse — share what's common, specialize what differs
- The is-a relationship: a Drill IS-A Tool, not just HAS-A tool
- Polymorphism: calling the same method name on different types and getting different behavior
- When NOT to use inheritance — composition vs inheritance tradeoff introduced
- The Liskov Substitution Principle stated simply: anywhere you use a Tool, a Drill should work fine

**Builds:** `Drill(Tool)` and `EndMill(Tool)` subclasses. `Drill` adds `point_angle`, `EndMill` adds `corner_radius`. Each overrides `describe()` to include its own fields. A function `print_tool(t: Tool)` that accepts either type.

**Watch for:** This lesson could split into: (a) inheritance mechanics and (b) polymorphism as a design principle. If the student is hitting both at once, split.

---

### Lesson 08 — Modules, Imports, and Project Structure

**Covers:** `import`, `from x import y`, creating your own module, `__name__ == "__main__"`, `pip`, virtual environments

**Teaches:**

- What a module is: a namespace — a way to organize code so names don't collide
- How Python resolves imports (sys.path, the search order)
- What a virtual environment is and why: isolating per-project dependencies
- The `__name__ == "__main__"` guard: why it exists and what problem it solves
- `pip` as a package manager and what a package index is (PyPI)

**Builds:** Split the Tool classes into a `models.py` file. A `main.py` that imports from `models.py`. Student installs one package (`rich` for pretty terminal output) and uses it.

**Watch for:** Package structure (`__init__.py`, nested packages) could be its own lesson. Don't go deep here — just enough to have a clean two-file project.

---

### Lesson 09 — Error Handling and Context Managers

**Covers:** `try/except/finally`, raising exceptions, `with` statement, writing a context manager

**Teaches:**

- Exceptions as a control flow mechanism for exceptional conditions — not for normal logic
- The exception hierarchy: `Exception` as the base, why you should catch specific types
- The `with` statement and the context manager protocol (`__enter__`, `__exit__`) — resource acquisition is initialization (RAII concept from C++)
- Why `finally` runs even when an exception is thrown — guaranteed cleanup
- The difference between an error and a bug: errors are expected (bad input, missing file), bugs are not

**Builds:** A `load_tool_from_file(path)` function that reads a JSON file. Uses `with open(...)` to ensure the file closes even if parsing fails. Raises a custom `ToolLoadError` exception if required fields are missing.

**Watch for:** Custom exception hierarchies are worth a short mention but don't need a full lesson here.

---

## Block 2 — SQL from First Principles

*Goal: Understand relational databases as a mathematical concept, not just a storage tool. Write SQL by hand before touching any ORM.*

---

### Lesson 10 — What is a Relational Database?

**Covers:** The concept of a relation, tables as sets of tuples, rows and columns, why relational databases exist

**Teaches:**

- A table is a mathematical relation: a set of tuples where each tuple has the same attributes
- Why flat files (CSV, JSON) break down at scale — duplication, inconsistency, no enforced constraints
- The three problems a relational database solves: redundancy, inconsistency, search
- What SQLite is: a relational database that lives in a single file — no server, no installation
- ACID properties: Atomicity, Consistency, Isolation, Durability — what each means in plain language

**Builds:** No code yet. Student sketches the tool database schema on paper: what tables exist, what columns each has, what the relationship between them is. This is the design step before the build step.

**Watch for:** If the student wants depth on ACID or on how SQLite stores data internally (B-tree pages), that's a separate lesson. Keep this conceptual.

---

### Lesson 11 — CREATE TABLE, Data Types, and Constraints

**Covers:** `CREATE TABLE`, SQLite data types (`INTEGER`, `REAL`, `TEXT`, `BLOB`), `NOT NULL`, `UNIQUE`, `DEFAULT`, `PRIMARY KEY`

**Teaches:**

- Why column types exist: the database enforces what you put in a column
- The difference between a NOT NULL constraint and a default value
- What a primary key is: a column (or set of columns) that uniquely identifies each row
- Auto-increment primary keys: why they exist and what problem they solve
- SQLite's type affinity system: how SQLite is more relaxed than other databases (and why that matters)

**Builds:** Create `tools.db` with a `tools` table. Open it in DB Browser for SQLite and verify the schema. Student writes `CREATE TABLE` by hand.

**Watch for:** CHECK constraints and generated columns are worth knowing but can wait. Composite primary keys deserve a mention but not a full lesson here.

---

### Lesson 12 — INSERT, SELECT, WHERE, ORDER BY, LIMIT

**Covers:** Inserting rows, selecting all columns, selecting specific columns, filtering with `WHERE`, sorting, limiting results

**Teaches:**

- SQL as a declarative language: you describe WHAT you want, not HOW to get it
- The difference between declarative (SQL) and imperative (Python loops) approaches to data
- Boolean logic in WHERE clauses: `AND`, `OR`, `NOT`, operator precedence
- Why `SELECT *` is usually a bad idea in production code (brittle, wastes bandwidth)
- NULL handling: why `WHERE column = NULL` doesn't work and `IS NULL` does (three-valued logic)

**Builds:** Insert 10 tool records by hand. Write queries to: find all carbide tools, find all endmills larger than 0.5" diameter, find the top 5 tools by diameter.

**Watch for:** LIKE for pattern matching and BETWEEN for ranges are natural extensions. Add them here or as a short appendix.

---

### Lesson 13 — Primary Keys, Foreign Keys, and Relationships

**Covers:** `FOREIGN KEY`, `REFERENCES`, `ON DELETE CASCADE`, one-to-many relationships, the join concept introduced visually

**Teaches:**

- What referential integrity means: the database prevents orphaned records
- One-to-many vs many-to-many relationships — how each is modeled
- Why we split data into multiple tables (normalization): eliminating update anomalies
- First, Second, and Third Normal Form — explained briefly with the tool/holder example
- What happens without foreign keys: the data model breaks silently

**Builds:** Create a `holders` table. Add a `holder_id` foreign key to `tools`. Insert holders, then insert tools that reference them.

**Watch for:** The on-delete behavior (CASCADE vs RESTRICT vs SET NULL) for each relationship in this system needs an explicit decision. Think through each one before writing the schema.

---

### Lesson 14 — Many-to-Many Relationships and Junction Tables

**Covers:** Junction tables (also called bridge tables or associative tables), many-to-many relationships, extra data on the junction, and how to add/remove/query relationships

**Teaches:**

- A foreign key models one-to-many: one holder has many tools. But what if one assembly can be used on many jobs AND one job uses many assemblies? That requires a junction table.
- A junction table is a real table in its own right — it has its own primary key, its own timestamps, and can carry extra columns (like the date an assembly was assigned to a job, or a note)
- The three kinds of relationships and when each applies:
  - One-to-one: a tool has one geometry record (rare, usually means the data belongs in the same table)
  - One-to-many: a holder has many tools
  - Many-to-many: an assembly can be on many jobs; a job can use many assemblies — requires a junction table
- How to add a relationship: insert a row into the junction table
- How to remove a relationship: delete that row — neither the tool nor the job is deleted, only the link between them
- How to query: join through the junction table — `jobs JOIN job_assemblies ON ... JOIN assemblies ON ...`
- Why this is the right design for this system: tools, holders, assemblies, parts, jobs are all independent. They exist whether or not they're related to anything. Relationships between them are managed separately and can be added, removed, and changed without touching the original records.

**Builds:** An `assemblies` table (tool_id, holder_id, stickout — each assembly is a named, reusable combination). A `jobs` table. A `job_assemblies` junction table linking them. Queries: which assemblies are on job 3? Which jobs use assembly 7?

**Watch for:** The junction table pattern is one of the most important things in relational databases. Take the time to fully understand it — almost every real-world system needs it.

---

### Lesson 15 — JOIN: Combining Tables

**Covers:** `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, join conditions, joining three tables

**Teaches:**

- A JOIN is the relational algebra operation that combines rows from two tables based on a condition
- INNER JOIN: only rows where the condition matches both sides
- LEFT JOIN: all rows from the left, matched rows from the right, NULL where no match
- Why NULL appears in LEFT JOIN results and how to handle it
- The mental model: imagine laying two tables side by side and drawing lines between matching rows

**Builds:** A query that returns each tool with its holder name and holder type. A second query that returns all holders including ones with no assigned tools (LEFT JOIN). A third query that joins `tools`, `holders`, and a new `assemblies` table.

**Watch for:** Self-joins, cross joins, and subqueries are advanced and deserve separate treatment later.

---

### Lesson 15 — Aggregation: GROUP BY, COUNT, SUM, AVG

**Covers:** Aggregate functions, `GROUP BY`, `HAVING`, `COUNT(*)` vs `COUNT(column)`

**Teaches:**

- Aggregation collapses multiple rows into one summary row — the concept of a grouped set
- The difference between `WHERE` (filters before grouping) and `HAVING` (filters after grouping)
- Why `COUNT(*)` and `COUNT(column)` differ: NULL rows
- When to aggregate vs when to join — two different tools for two different questions

**Builds:** Queries: how many tools of each type are in the database, average diameter by material, which materials have more than 5 tools.

**Watch for:** Window functions (`ROW_NUMBER`, `RANK`) are powerful but advanced — flag for a future optional lesson.

---

### Lesson 16 — Transactions and Data Integrity

**Covers:** `BEGIN`, `COMMIT`, `ROLLBACK`, what a transaction is, the ACID guarantee in practice

**Teaches:**

- A transaction is a unit of work that either completes entirely or doesn't happen at all
- Why transactions exist: without them, a crash halfway through an insert leaves the database in a broken state
- Atomicity demonstrated: insert two rows in a transaction, then intentionally crash — both rows disappear
- Isolation: two connections don't see each other's uncommitted changes
- WAL mode in SQLite: what Write-Ahead Logging is and why it allows concurrent reads

**Builds:** A Python script that inserts a tool AND its holder in a single transaction. Intentionally raises an exception halfway through. Shows that neither insert survives. Then wraps it in a proper try/except/rollback.

**Watch for:** Deadlocks, savepoints, and isolation levels are worth knowing but are advanced. Mention they exist; defer.

---

### Lesson 17 — Raw SQL with Python's sqlite3 Module

**Covers:** `sqlite3.connect()`, `cursor()`, `execute()`, `fetchall()`, `fetchone()`, parameter binding, `?` placeholders

**Teaches:**

- What a database connection is vs a cursor: the connection talks to the file, the cursor executes statements and holds results
- Why parameter binding exists: SQL injection — what it is, how it works, and why `?` prevents it
- The difference between `fetchall()` (loads everything into memory) and iterating the cursor (lazy, row by row)
- How Python's sqlite3 module maps rows to tuples and how to get named columns with `row_factory`

**Builds:** A Python script with a `ToolRepository` class: methods `insert_tool`, `get_all_tools`, `get_tool_by_id`, `search_by_material`. All using raw SQL with parameter binding.

**Watch for:** The `row_factory = sqlite3.Row` pattern for named columns deserves explicit focus — it's used constantly and isn't obvious.

---

### Lesson 18 — Schema Migrations

**Covers:** `ALTER TABLE`, what a migration is, versioning a database schema, a minimal migration runner

**Teaches:**

- Why migrations exist: the database schema changes as the application grows, but existing data must survive
- The migration as a concept: a numbered, ordered script that moves the schema from version N to version N+1
- Why you can't just `DROP TABLE` and recreate: you'd lose all existing data
- SQLite's limited `ALTER TABLE` and how to work around it (recreate-and-rename pattern)
- Schema version tracking: a `schema_version` table that records which migrations have run

**Builds:** A `migrations/` folder with numbered `.sql` files. A Python `migrate.py` script that reads the current schema version and runs any pending migrations.

**Watch for:** Real migration tools (Alembic) come in the SQLAlchemy block. This lesson teaches the concept; Alembic teaches the tool.

---

### Lesson 19 — Data Provenance: Where Did This Come From?

**Covers:** Tracking the origin of every piece of data — which fields were entered manually, which came from a Mastercam import, which came from XML parsing, and which were computed

**Teaches:**

- Provenance means "where did this come from?" — it's a first-class data concern, not an afterthought
- The three sources of data in this system, and why each needs to be distinguishable:
  - **Manual entry**: a user typed it in the form — it's their data, they own it, changes should prompt confirmation
  - **Imported**: came from a Mastercam `.tooldb`, a shared network database, or an XML file — it has an upstream source, and can potentially be re-imported if the source updates
  - **Computed**: derived from other fields — stickout from gauge length, SFM from diameter and RPM. Never store a computed value unless computing it is expensive; if you do store it, mark it clearly so it doesn't get treated as ground truth
- Two levels of provenance: record-level (where did this tool come from?) vs field-level (where did THIS SPECIFIC FIELD come from?)
- Record-level is simpler: add `source` and `imported_at` columns to the table
- Field-level is more powerful but more complex: a JSON `field_sources` column that maps each field name to its origin — `{"diameter": "mastercam_import", "description": "manual", "sfm": "computed"}`
- Why field-level matters in practice: a tool's geometry (diameter, flutes) came from Mastercam, but the machinist manually added a note and a preferred feed rate. If the tool is re-imported from Mastercam, the geometry should update but the note and feed rate should be preserved.
- Mixed provenance: some fields on the same record have different sources — this is normal and must be designed for, not worked around

**Builds:** Add a `source` column (`"manual"`, `"mastercam"`, `"xml"`, `"computed"`) and a `field_sources` JSON column to the `tools` table. Update insert functions to populate both. Write a query that finds all tools where the diameter came from Mastercam but the description was manually entered.

**Watch for:** Field-level provenance adds complexity. If the student finds it too much at this stage, implement record-level only and return to field-level in the Mastercam import block where it's concretely needed.

---

### Lesson 20 — Layered Architecture: Separating UI, Logic, and Data

**Covers:** The three-layer rule — Presentation, Service, and Data. A strict contract between layers that makes the UI replaceable.

**Teaches:**

- The three layers and what each one owns:
  - **Data layer** — SQLAlchemy models and the repository classes. Talks to the database. Returns Pydantic schemas. Knows nothing about the UI.
  - **Service layer** — Business logic. Calls repositories. Makes decisions (validate, check for duplicates, calculate computed fields). Returns Pydantic schemas. Knows nothing about the UI.
  - **Presentation layer** — Widgets, routes, or whatever the current UI technology is. Calls services. Displays results. Contains no business logic and no database calls.
- The rule: nothing in the presentation layer imports from the data layer. Widgets call services; services call repositories; repositories call the database. No layer skips over another.
- Why this rule makes the UI replaceable: the service layer does not care who calls it. Today it is a PySide6 button handler. When the React lessons are done, it will be a FastAPI route handler. The service itself does not change — only the caller changes.
- The Pydantic schema as the contract between layers: a service accepts a `ToolCreate` and returns a `ToolRead`. The caller — whether it is a Qt form or an HTTP request — works in terms of those schemas, never in terms of ORM objects.
- Folder structure that enforces the rule: `ui/`, `services/`, `repositories/`, `models/`, `schemas/`. A file in `ui/` may import from `services/` and `schemas/` only. If you find yourself importing `from repositories import ...` inside a widget file, that is a violation.
- What gets thrown away when switching to React: everything in `ui/`. What stays: everything in `services/`, `repositories/`, `models/`, `schemas/`. The backend is the permanent investment; the UI is interchangeable.

**Builds:** The project folder is restructured into the five layers. The `ToolRepository` and a new `ToolService` class are moved to their correct folders. A simple rule file `ARCHITECTURE.md` written in the project root: one sentence per layer, one sentence on what it may and may not import.

**Watch for:** This is the most important structural lesson in the project. Every lesson from here on should be checked against this rule. If a later lesson violates it for simplicity, call it out explicitly and explain why it is a temporary shortcut.

---

## Block 2b — Testing and Test-Driven Development

*Goal: Learn to write tests before code. A test is a small program that calls your service and checks the result. When tests pass, you know the code works. When they keep passing after a change, you know you didn't break anything. This block runs alongside Blocks 3–6 — every new service method gets a test written first.*

---

### Lesson — What is a Test and Why Tests Exist

**Covers:** What a test is, what it checks, what happens when it fails, why tests are the answer to "how do I change code without breaking things"

**Teaches:**

- A test is a function that calls your code with known inputs and asserts that the output matches what you expect
- The problem tests solve: without them, the only way to know if a change broke something is to manually click through the whole app. For a small app that takes five minutes. For a large app it takes hours — or it doesn't happen at all, and bugs reach users.
- Tests are automated: you run one command and every check runs instantly. A thousand tests in ten seconds.
- Tests as a safety net: the bigger and older a codebase gets, the more things can interact in unexpected ways. Tests catch those interactions. They give you confidence to change old code.
- Tests as documentation: a test named `test_create_tool_rejects_negative_diameter` tells you exactly what the code is supposed to do, more precisely than a comment ever could
- What tests do NOT do: they don't prove the code is correct for every possible input — only for the cases you thought to test. Good tests cover the normal case, the edge cases, and the error cases.

**Builds:** No code yet. Read two existing test files from open source Python projects and identify: what is being tested, what inputs are used, what is being asserted, what the test name tells you. The goal is to read a test and understand it before writing one.

**Watch for:** Students sometimes think tests slow them down. Address this directly: tests feel slow for the first hour and fast forever after. The slowdown is front-loaded; the speedup compounds.

---

### Lesson — pytest: Writing and Running Your First Tests

**Covers:** Installing pytest, writing a test function, assertions, running pytest from the terminal, reading the output

**Teaches:**

- pytest is the standard Python testing tool — you write functions starting with `test_`, pytest finds and runs them
- An assertion is a statement that something must be true: `assert result == expected`. If it is false, pytest stops and shows you exactly what the actual value was.
- Test function naming: `test_<what_it_does>_<condition>` — for example `test_describe_tool_includes_diameter`. Names are documentation.
- Reading pytest output: a dot means a passing test, `F` means a failing test. The failure output shows the line that failed, the expected value, and the actual value.
- The `tests/` folder: keep test files separate from production code. `test_tools.py` tests `tools.py`.
- `pytest -v` for verbose output: shows every test name as it runs, not just dots

**Builds:** Three test functions for the `describe_tool` function from Lesson 01: one for normal input, one for zero flutes (edge case), one for a negative diameter (should this be allowed?). Run pytest and see all three pass.

**Watch for:** Students sometimes write tests that always pass because the assertion is wrong — `assert result` instead of `assert result == "expected string"`. Show this mistake and how to spot it.

---

### Lesson — Test-Driven Development: Red, Green, Refactor

**Covers:** The TDD cycle, writing the test before the code, why the failing test matters, the refactor step

**Teaches:**

- Where TDD comes from: Kent Beck formalized it as part of Extreme Programming (XP) in the late 1990s. XP is a whole methodology — small releases, constant feedback, simple design, collective code ownership. TDD is the practice that makes all the others possible because it gives you the confidence to change code at any time.
- The three steps:
  - **Red** — write a test for a function that does not exist yet. Run it. Watch it fail. The failure is important: it proves the test is actually checking something, not silently passing on nothing.
  - **Green** — write the simplest code that makes the test pass. Not the cleanest. Not the most general. Just enough to pass.
  - **Refactor** — now improve the code: rename things, remove duplication, simplify. Run the tests after every small change. If they stay green, the refactor was safe.
- Why "simplest code to pass" matters: it keeps you from writing code you don't need yet. If the test passes with three lines, don't write ten.
- The cycle length: a single Red-Green-Refactor cycle should take minutes, not hours. If a cycle takes more than 20 minutes, the step is too big — break it into smaller steps.
- TDD shapes the design: because you write the test first, you see what the function's interface feels like before you build it. Awkward tests reveal awkward APIs. This is one of the most valuable benefits.

**Builds:** Use TDD to build a `calculate_sfm(diameter_inches, rpm)` function. Write the failing test first. Write the minimum code. Watch it go green. Then add a second test for a different input. Then a third for an edge case (zero diameter — what should happen?). Refactor the function after all tests pass.

**Watch for:** The hardest part of TDD for beginners is resisting the urge to write the code first. Call this out directly. The discipline is the point — trust the process for a few cycles before judging it.

---

### Lesson — Testing the Service Layer

**Covers:** Writing tests for `ToolService` methods, testing logic without a UI, what makes a service easy to test

**Teaches:**

- The service layer is the easiest thing to test: it is pure Python logic. No widgets, no HTTP, just functions.
- A good service test: create a service with a real (test) repository, call a method, assert on the result
- Testing the normal case, the validation error case, and the duplicate detection case for `create_tool`
- What "test isolation" means: each test starts with a clean state. Tests must not share data or depend on each other's side effects.
- If a service is hard to test, that is a signal the design needs fixing — not the test. Hard-to-test code is usually code that does too many things or reaches across layers.

**Builds:** Tests for `ToolService.create_tool`: one that creates a valid tool and checks the returned `ToolRead`, one that passes invalid data and checks that a validation error is raised, one that tries to create a duplicate and checks the right error is returned.

**Watch for:** At this point the repository still talks to a real database file. The next lesson introduces test fixtures to manage that. For now, accept that the test writes to a real file and cleans up afterward.

---

### Lesson — Test Fixtures and the Test Database

**Covers:** `pytest` fixtures, setup and teardown, using a temporary in-memory SQLite database for tests

**Teaches:**

- A fixture is a function that provides something a test needs — a database connection, a sample tool, a configured service — and cleans it up afterward
- `@pytest.fixture` decorator: pytest calls the fixture before the test runs and runs the cleanup after
- `yield` in a fixture: code before `yield` is setup, code after `yield` is teardown — the `with` statement equivalent for tests
- In-memory SQLite for tests: `sqlite:///` becomes `sqlite:///:memory:` — a database that lives only in RAM, is blank at the start of every test, and disappears when the test ends. Tests run faster and never leave files behind.
- Fixture scope: `scope="function"` (default) gives each test its own database. `scope="session"` shares one database across all tests. For most cases, function scope is correct — tests must not share state.

**Builds:** A `db_session` fixture that creates a fresh in-memory database and a `ToolService` instance for each test. Rewrite the service tests to use the fixture. Run the full test suite — all tests use isolated databases and pass independently.

**Watch for:** Students sometimes accidentally use a shared fixture where they need an isolated one. Show what happens when tests share state: one test's data leaks into another, tests fail in a surprising order.

---

### Lesson — What to Test and What Not to Test

**Covers:** The difference between testing your logic and testing the framework, finding the right level of coverage, when tests become a burden

**Teaches:**

- Test your logic, not the framework: don't write tests that verify SQLAlchemy inserts rows or that Pydantic rejects bad types. Those are already tested by the libraries themselves. Test the decisions your code makes.
- What is worth testing: any function that makes a decision (if/else), any function that can fail in more than one way, any calculation, any rule that a human stated ("stickout must not exceed holder length")
- What is not worth testing: simple property assignments, trivial getters, one-line functions that just delegate to a library
- The cost of tests: tests are code too — they need to be maintained when the production code changes. Over-testing creates maintenance burden. Under-testing leaves you unprotected. The balance is: test every meaningful decision.
- Regression tests: when a bug is found, write a test that reproduces it before fixing it. The test proves the bug existed. After the fix, the test proves it is gone. It will never silently come back.

**Builds:** Review the existing test suite. Identify two tests that are testing the framework (delete them). Identify one bug scenario that has no test (add a regression test for it).

**Watch for:** "Code coverage" (the percentage of lines executed by tests) is a useful metric but a dangerous goal. 100% coverage does not mean the code is correct — it means every line ran, not that every case was checked correctly.

---

## Block 2c — Validation Strategy: Collecting and Reporting Errors

*Goal: Learn to validate data at every entry point — forms, file imports, XML parsing — and report every problem at once instead of stopping at the first one. The user always knows exactly what is wrong, where it is, and how to fix it. The app never crashes on bad data; it explains it.*

---

### Lesson — Validation Philosophy: Collect, Don't Stop

**Covers:** The two approaches to validation (fail fast vs collect all), what a good error message contains, the three layers where validation belongs

**Teaches:**

- **Fail fast** means stop at the first error. Raise an exception immediately. Simple to implement, terrible for users — they fix one problem, hit another, fix that, hit another. Seven problems means seven attempts.
- **Collect all** means run every check, gather every failure, then report them all together. The user sees all seven problems at once and fixes them in one pass. This is what you want.
- What a good error message contains — three things:
  - **Where:** which field, which row, which file. "Row 47, column 'diameter'" not just "diameter"
  - **What is wrong:** the specific rule that failed. "Must be a positive number" not "invalid value"
  - **What was received:** the actual bad value. "Got 'abc'" — this helps the user find the typo
  - Example of a good message: `Row 47 — 'diameter': expected a positive number, got 'abc'`
  - Example of a bad message: `Validation error`
- The three layers where validation belongs, and what each one catches:
  - **Type layer** — is the value the right kind of thing? Is diameter a number or a string? This is Pydantic's job.
  - **Constraint layer** — is the value in the valid range? Diameter must be positive. Flutes must be 1–16. Also Pydantic.
  - **Business rule layer** — does the value make sense in context? Stickout cannot exceed holder length. Tool name must follow the shop naming convention. Custom validator logic.
- SQL safety is separate from validation: parameterized queries mean bad characters in a tool name can never break a SQL command. This is not about catching bad input — it is about never building SQL from raw strings in the first place. Once that rule is followed, SQL injection is architecturally impossible regardless of what the user types.

**Red:** Write a test: `validate_tool_data({"diameter": "abc"})` should return a list of errors, not raise an exception. The list should contain exactly one error with the word "diameter" in it and the value "abc" in it.

**Green:** A `validate_tool_data` function that returns a list of error strings. Hard-code it to return one error for now.

**Refactor:** The function signature and error format established here will be used in every subsequent validation lesson. Make sure the format is clean before moving on.

**Builds:** A `ValidationResult` class with two fields: `errors` (a list of error messages) and `is_valid` (True when errors is empty). Every validation function in this block returns one of these. The format of the error messages is decided here and used consistently everywhere.

**XP principle:** Simple Design — establish the one result format now so it does not need to change later. YAGNI — don't build the full validator yet, just the container.

**Watch for:** The `ValidationResult` design is worth getting right. It could also carry warnings (problems that don't block the import but are worth noting) vs errors (problems that do block it). Decide now whether warnings are needed.

---

### Lesson — Pydantic Errors as User Messages

**Covers:** How Pydantic's `ValidationError` stores every field error, how to extract them into readable messages, how to add custom error text to a validator

**Teaches:**

- Pydantic already collects all field errors — it does not stop at the first one. `ValidationError.errors()` returns a list, one entry per broken field.
- Each error entry contains: `loc` (the field location as a tuple), `msg` (the error message), `type` (the error code), and `input` (the bad value that was given)
- `loc` can be nested: for a list of tools, `loc` might be `(3, 'diameter')` meaning index 3, field diameter — exactly the "Row 3, field diameter" message the user needs
- Formatting errors for display: a function that takes a `ValidationError` and returns a list of `ValidationResult` error strings in the agreed format from the previous lesson
- Adding custom messages to validators: `@field_validator` can raise `ValueError("must be a positive number, got 0.0")` — Pydantic includes that text in the error
- The `model_config` setting `str_strip_whitespace=True` — silently fix trivial user errors like leading/trailing spaces rather than failing on them. Know when to fix silently vs when to flag.

**Red:** Test that validating `{"name": "", "diameter": -1.0, "flutes": 0}` returns three errors (one per bad field), each containing the field name and the bad value.

**Green:** A `format_pydantic_errors(exc: ValidationError) -> ValidationResult` function that extracts and formats all errors.

**Refactor:** Make the error format consistent with the `ValidationResult` from the previous lesson.

**Builds:** `format_pydantic_errors` used in the tool creation service: instead of letting `ValidationError` propagate up as an exception, catch it and return a `ValidationResult` with all errors listed.

**XP principle:** TDD — the test defines the exact error format before the formatter is written.

**Watch for:** `loc` for nested models can be a tuple like `('holder', 'shank_diameter')` — the formatter needs to handle nested paths and convert them to readable strings like `'holder.shank_diameter'`.

---

### Lesson — Naming Conventions as Validation Rules

**Covers:** Defining a naming convention schema, validating tool names and part numbers against it, giving the user a helpful message that explains the convention

**Teaches:**

- A naming convention is a business rule expressed as a pattern. Example: tool names must follow `TYPE-DIAMETER-FLUTES-MATERIAL` such as `EM-0500-4FL-C` (endmill, 0.5", 4 flute, carbide). A name like `my endmill` does not follow it.
- Regular expressions as a tool for pattern matching: `^[A-Z]{2,4}-\d{4}-\d{1,2}FL-[CHT]$` matches the convention. Pydantic's `@field_validator` uses `re.match()` to check it.
- The error message must explain the convention, not just say it failed: `"Tool name 'my endmill' does not match the naming convention. Expected format: TYPE-DIAMETER-FLUTES-MATERIAL (e.g. EM-0500-4FL-C)"`
- Making conventions configurable: the pattern should live in a config file or database table, not hard-coded in the validator. Different shops use different conventions. The validator reads the active convention and applies it.
- Conventions are warnings, not always errors: a tool name that does not match the convention is suspicious, but it might still be valid. The app warns and continues rather than blocking the import.

**Red:** Test that a tool with name `"my endmill"` against a configured convention produces a warning (not an error) that includes both the bad name and an example of the correct format.

**Green:** A `check_naming_convention(name, convention_pattern, example)` function that returns a warning string or None.

**Refactor:** The warning should be part of the `ValidationResult` — add a `warnings` list alongside `errors`.

**Builds:** A `conventions` table in the database: `(entity_type, field_name, pattern, description, example)`. A validator that reads from it. Applied to tool names and part numbers.

**XP principle:** Simple Design — the convention lives in the database, not in code, so it can change without a deployment.

**Watch for:** Regular expressions can get complicated quickly. Keep the convention patterns simple enough that a machinist can read and understand them. If the pattern is unreadable, the convention is too complex.

---

### Lesson — Batch Validation: Import the Good, Report the Bad

**Covers:** Validating a list of records, separating valid from invalid, importing the valid ones, and returning a detailed report for the invalid ones

**Teaches:**

- The batch validation pattern: a function that takes a list of raw records and returns `(valid_records, errors)` — two separate lists
- Process every record: never stop on the first invalid one. Validate each record independently. Collect its errors. Move to the next.
- Partial success: if 97 of 100 tools are valid, import 97 and report 3 failures. The user does not need to fix 3 errors and re-import everything — only the 3 failures need attention.
- Error context in batch mode: the error message must include the row number (or tool name, or whatever identifies the record). `Row 47` not just `diameter is invalid`.
- The import report: a structured summary returned to the caller — total records, imported count, skipped count, and a list of `(row_number, errors)` pairs for each failure
- Wrapping each record in a try/except vs using Pydantic's collect-all approach: Pydantic collects all field errors within one record; the batch loop collects all record-level failures across records. Two levels of collection.

**Red:** Test that importing `[valid_tool, invalid_tool, valid_tool]` returns 2 imported, 1 error, and the error contains the index of the invalid record.

**Green:** A `batch_import_tools(records) -> ImportReport` function. `ImportReport` has `imported`, `errors` (list of `(index, ValidationResult)`), and a `summary()` method.

**Refactor:** Extract the per-record validation into its own function so it can be tested independently.

**Builds:** The Mastercam import pipeline from Block 7 uses this batch validator. The "Import from Mastercam" button shows the `ImportReport` in a dialog: "Imported 97 tools. 3 tools had errors:" followed by the list.

**XP principle:** TDD — the `ImportReport` structure is defined by the test before the function exists. Small Releases — the batch importer works correctly before the UI for it is built.

**Watch for:** Memory: loading 10,000 tools into a list before validating any of them is expensive. For large imports, process and validate in chunks. Flag this but do not solve it prematurely.

---

### Lesson — XML Validation: Parse What You Can, Report What You Cannot

**Covers:** Validating XML data during parsing, handling missing tags and wrong types, collecting all XML errors without stopping the parse

**Teaches:**

- XML parsing fails in two ways: structurally (the XML is malformed — tags don't close) and semantically (the XML is well-formed but the data is wrong — a tag that should contain a number contains text)
- Structural failures stop the whole parse — `ElementTree` raises an exception immediately. Wrap the entire parse in try/except and report it as a fatal error.
- Semantic failures are per-element — wrap each element's extraction in its own try/except. A missing `<diameter>` tag on tool 47 should not stop the extraction of tool 48.
- Safe element extraction: a helper function `get_text(element, tag, required=True)` that returns the text if present, adds an error to the current record's errors if required and missing, or returns None if optional
- Type coercion in XML: everything in XML is a string. Converting `"0.5"` to `0.5` can fail if the value is `"half inch"`. Wrap every conversion in try/except and report the original string value in the error.
- After parsing, pass all extracted records through the batch validator from the previous lesson — XML parsing and data validation are two separate steps

**Red:** Test that parsing an XML element with `<diameter>abc</diameter>` produces an error containing "diameter" and "abc", and that other elements in the same file are still extracted.

**Green:** `safe_float(element, tag) -> tuple[float | None, str | None]` — returns the value and an error string. None error means success.

**Refactor:** Unify the error format with the `ValidationResult` from the earlier lessons.

**Builds:** The XML parser from Block 8 uses `safe_float`, `safe_int`, `safe_text` helpers throughout. Every element extraction is wrapped. The parse returns an `ImportReport` with both parse errors and validation errors included.

**XP principle:** TDD — test the failure cases before the success case. The error path is more important to get right than the happy path.

**Watch for:** XML from Mastercam may use attributes instead of child tags for some values — `<tool diameter="0.5">` vs `<tool><diameter>0.5</diameter></tool>`. The safe extraction helpers need to handle both.

---

### Lesson — Form Validation in the UI: Inline Errors, Not Popups

**Covers:** Showing validation errors next to the relevant field in a Qt form, validating on submit vs validating on change, clearing errors when the user fixes them

**Teaches:**

- The wrong approach: a popup dialog that says "Validation failed" when the user clicks Save. The user dismisses the dialog, tries to remember what was wrong, guesses wrong, clicks Save again. Frustrating.
- The right approach: show a small red error label directly below each field that has a problem. The user sees all problems at once, inline, next to the exact field. Fix, watch the error disappear, move on.
- When to validate:
  - **On submit** — validate everything when the user clicks Save. Good for cross-field rules that only make sense when all fields are filled in.
  - **On change** — validate a field as the user types or tabs away. Good for simple type and range checks. Gives immediate feedback.
  - Combine both: immediate feedback on individual fields, full cross-field check on submit.
- Qt implementation: a `QLabel` with red text, initially hidden, placed below each input. The validator runs, populates the labels, shows them. When the field is corrected, the label is cleared and hidden.
- The service returns a `ValidationResult`. The form maps each error to the correct label by field name. Neither the form nor the service knows about the other's structure — the `ValidationResult` is the contract between them.

**Red:** Test that submitting a form with an empty name and a negative diameter populates two error labels and does not call the service.

**Green:** Error labels added to the Add Tool form. The submit handler calls `validate_tool_data`, maps errors to labels, only calls the service when `is_valid` is True.

**Refactor:** Extract the error-label population into a reusable `show_form_errors(errors, label_map)` function so other forms can use the same pattern.

**Builds:** The Add Tool form and Edit Tool form both use inline validation. The pattern is established here and applied to every form in the application.

**XP principle:** Simple Design — one function handles showing errors on any form. Refactoring — extract the pattern once it appears in the second form.

**Watch for:** Validating on every keystroke can feel jittery. Use a short delay (debounce) — wait 300ms after the user stops typing before running the field validator. This is a UX detail worth noting.

--- Learn the concepts that every GUI framework shares — event loops, layouts, data binding, forms. PySide6 is the vehicle for learning these concepts; it is not the destination. If you later want a different UI — a web app, a mobile app, a command-line tool — you replace only this block. The service and data layers do not change.*

---

### Lesson 19 — What is Qt and the Event Loop

**Covers:** What Qt is, what PySide6 is, installing PySide6, the QApplication and event loop

**Teaches:**

- What an event loop is: a loop that waits for events (mouse click, key press, timer) and dispatches them
- Why GUI programs are structured around events, not sequential steps — this is fundamentally different from a script
- Qt as a framework: widgets, layouts, signals/slots, the meta-object system
- PySide6 vs PyQt6: the licensing difference, why PySide6 is the official Digimarc/Qt binding
- `QApplication`: the object that owns the event loop — every Qt program has exactly one

**Builds:** The absolute minimum Qt program: a `QApplication`, a `QLabel` with the text "Tool Database", and `app.exec()`. Student runs it and sees a window.

**Watch for:** The Qt meta-object system (MOC, signals/slots implementation) is deep — keep this to the conceptual level.

---

### Lesson 20 — Widgets and Layouts

**Covers:** `QWidget`, `QLabel`, `QPushButton`, `QLineEdit`, `QVBoxLayout`, `QHBoxLayout`, `QGridLayout`, spacing and margins

**Teaches:**

- A widget is any visual element: buttons, labels, text fields, the window itself
- Layouts manage the position and size of widgets — you don't set pixel coordinates, you describe relationships
- The widget tree: every widget has a parent, the window is the root
- Why layouts exist instead of fixed positions: the window can resize and the layout adapts
- The box model for layouts: spacing between widgets, margins around the container

**Builds:** A window with a header label, a search bar (`QLineEdit`), and a placeholder area. No data yet — just the visual shell of the tool database.

**Watch for:** `QSizePolicy` and `stretch factors` for controlling how widgets grow/shrink could be its own short lesson.

---

### Lesson 21 — Signals and Slots

**Covers:** The signal/slot mechanism, connecting signals to slots, built-in signals (`clicked`, `textChanged`), defining custom signals

**Teaches:**

- Signal/slot is Qt's implementation of the observer (publish-subscribe) pattern
- A signal is emitted when something happens; a slot is a function that responds to it
- The decoupling benefit: the button doesn't know what happens when it's clicked — it just emits `clicked`
- How to connect: `button.clicked.connect(my_function)`
- Why this is better than callbacks: one signal can connect to many slots; slots can be connected/disconnected at runtime

**Builds:** The search bar from Lesson 20 now filters a hard-coded list of tool names displayed in a `QListWidget`. Typing in the search bar updates the list in real time via `textChanged`.

**Watch for:** Lambda functions in connect() calls are common and worth showing. Also: disconnecting signals and memory implications with lambdas.

---

### Lesson 22 — QMainWindow, Menus, and Status Bar

**Covers:** `QMainWindow` structure (central widget, menu bar, toolbar, status bar), `QMenuBar`, `QAction`

**Teaches:**

- `QMainWindow` provides a standard application frame with designated zones for each UI region
- `QAction` is the command pattern: an action has a name, icon, shortcut, and a `triggered` signal — it can live in menus AND toolbars at the same time
- The command pattern as a CS concept: decoupling the trigger (menu click) from the execution (the function)
- Status bars for non-blocking user feedback: show messages without stopping the user

**Builds:** Wrap the Lesson 21 window in a `QMainWindow`. Add a File menu with "Open Database" and "Exit" actions. Add a status bar that shows how many tools are loaded.

**Watch for:** Toolbars (`QToolBar`) are closely related and can be added here. Icons and resources (.qrc files) can wait.

---

### Lesson 23 — Displaying Data: QTableWidget

**Covers:** `QTableWidget`, setting headers, populating rows, selecting rows, reading the selected row

**Teaches:**

- `QTableWidget` is the "convenience" table: it stores the data AND renders it — simple but not scalable
- The difference between QTableWidget (data + view in one) and QTableView + Model (data separate from view) — preview of the MVC lesson to come
- How to populate a table from a Python list
- Row selection and reading which row is selected

**Builds:** Replace the QListWidget from Lesson 21 with a QTableWidget. Populate it from the hard-coded list of tools (name, diameter, material columns). Clicking a row shows tool details in a label below the table.

**Watch for:** This lesson uses QTableWidget as a stepping stone. Lesson 25 replaces it with the proper MVC approach. Make that plan explicit so the student isn't confused when we refactor.

---

### Lesson 24 — Connecting the Table to SQLite

**Covers:** Reading rows from `tools.db` and populating the QTableWidget, refresh after insert

**Teaches:**

- The database is now the source of truth — the UI just displays what's in it
- The pattern: connect to DB on startup, query all tools, populate the table
- Why you re-query after every insert instead of manually adding a row to the widget: keep the UI in sync with reality
- Thread safety warning: don't run database queries on the GUI thread in production (preview of threading concepts)

**Builds:** Replace the hard-coded list with live data from `tools.db`. The table now shows real records. Add a basic "Refresh" button.

**Watch for:** If the database has many rows, loading all of them on startup is wrong — pagination or lazy loading is a future topic.

---

### Lesson 25 — MVC: QTableView and QAbstractTableModel

**Covers:** The Model-View-Controller pattern, `QAbstractTableModel`, `data()`, `rowCount()`, `columnCount()`, `headerData()`

**Teaches:**

- MVC separates concerns: the Model owns the data, the View renders it, the Controller handles input
- Why QTableWidget is not MVC: it mixes data and rendering
- `QAbstractTableModel` is an interface — you implement it; Qt calls your methods when it needs to render
- The `data()` method and `Qt.DisplayRole` — Qt asks "what should I show at position (row, col)?" and you answer
- Why this architecture scales: swap the model (from list to database) without touching the view

**Builds:** Replace QTableWidget with a `ToolTableModel(QAbstractTableModel)`. The model holds the tool data; the `QTableView` renders it. Student sees that changing the model data automatically updates the view.

**Watch for:** `QSortFilterProxyModel` for live search is the natural next step but gets its own lesson. `Qt.EditRole` for editable cells is also a later topic.

---

### Lesson 26 — Forms: Adding and Editing a Tool

**Covers:** `QDialog`, `QFormLayout`, `QComboBox`, `QDoubleSpinBox`, form validation in the UI layer

**Teaches:**

- `QDialog` as a modal window: it blocks interaction with the parent window until closed
- `QFormLayout` for aligned label-field pairs — the standard layout for data entry forms
- Input widgets appropriate for different data types: text, number (spinbox), enum (combobox)
- Accept/reject pattern: `dialog.exec()` returns a status code, caller checks whether user confirmed or cancelled
- Validation at the UI layer vs validation at the data layer: both are needed, for different reasons

**Builds:** An "Add Tool" button opens a `QDialog` with fields for name, diameter, flutes, material, tool type. On accept, the tool is inserted into the database and the table refreshes.

**Watch for:** This dialog only handles one tool type (generic). Lesson 28 makes it polymorphic — different fields for different tool types.

---

## Block 4 — Polymorphic Tool Types

*Goal: A drill has no corner radius. An endmill has no point angle. Model this cleanly in both the database schema and the UI.*

---

### Lesson 27 — Type Hierarchies in Python

**Covers:** Abstract base classes (`ABC`, `abstractmethod`), the tool type hierarchy: `Tool → Drill, EndMill, FaceMill, TurnTool`

**Teaches:**

- Abstract classes define a contract: subclasses MUST implement these methods
- The difference between an abstract method (must override) and a regular method (can override)
- Why you can't instantiate an abstract class — it's a template, not a thing
- The `isinstance()` check and when using it is a code smell (prefer polymorphism)
- Type annotations with `Union` and the newer `|` syntax

**Builds:** An abstract `Tool` base class with abstract methods `type_name()` and `type_specific_fields()`. Concrete subclasses implement them. A `describe_tool(t: Tool)` function that works on any subclass.

**Watch for:** Protocols (structural subtyping / duck typing) are an alternative to ABC and worth mentioning as a concept, but defer implementation.

---

### Lesson 28 — Polymorphic Database Schema

**Covers:** Single-table inheritance, joined-table inheritance, the tradeoffs of each, NULL columns

**Teaches:**

- Single-table inheritance: one table with a `tool_type` discriminator column and nullable type-specific columns. Simple to query; wastes space; columns are not enforced by the DB.
- Joined-table inheritance: a `tools` base table + `drills`, `endmills` tables that JOIN to it. Normalized; harder to query.
- Which to choose and why: for a tool database with a bounded set of tool types, single-table is usually the right tradeoff
- The CHECK constraint to enforce valid `tool_type` values

**Builds:** Migrate the `tools` table to add type-specific nullable columns (`point_angle`, `corner_radius`, `included_angle`, `insert_size`). Add a `tool_type` column with a CHECK constraint. Update insert logic.

**Watch for:** If the student wants to add new tool types frequently, joined-table is better. Make the tradeoff explicit here.

---

### Lesson 29 — Polymorphic Forms

**Covers:** `QStackedWidget`, swapping form pages based on a combobox selection, hiding irrelevant fields

**Teaches:**

- `QStackedWidget` holds multiple pages but shows only one at a time — use it to swap whole sections of a form
- The signal/slot pattern for reactive UI: when the combobox changes, a slot swaps the visible page
- Why hiding fields is better than disabling them: a hidden field clearly communicates "this doesn't apply"
- The responsibility split: the UI decides which fields to show; the model decides which fields are valid

**Builds:** The "Add Tool" dialog now has a tool type combobox. Selecting "Drill" shows `Point Angle` and `Drill Length`. Selecting "Endmill" shows `Corner Radius` and `Helix Angle`. The form saves the right fields for each type.

**Watch for:** Dynamic forms (adding/removing widgets at runtime vs swapping pages) are an alternative. QStackedWidget is simpler for a bounded set of types.

---

### Lesson 30 — Polymorphic Table Columns

**Covers:** Showing/hiding table columns based on current filter, custom `QHeaderView`, column visibility toggles

**Teaches:**

- The model owns all columns; the view decides which to show — this is the MVC separation working correctly
- `QTableView.setColumnHidden()` for toggling column visibility
- Why you don't remove columns from the model when hiding them: the model index positions must stay stable
- User preference persistence: saving which columns are visible to a settings file

**Builds:** A "View" menu with checkboxes for each column group (Drill fields, Endmill fields, General fields). When "Drill Only" is checked, drill-specific columns show and others hide.

**Watch for:** Custom delegates (`QStyledItemDelegate`) for rendering cells in special ways is a natural extension — flag it.

---

## Block 5 — SQLAlchemy ORM

*Goal: Replace raw SQL with SQLAlchemy. Understand what the ORM is doing under the hood because you already know the SQL it generates.*

---

### Lesson 31 — What is an ORM and the Impedance Mismatch

**Covers:** The object-relational impedance mismatch, what an ORM solves, what it costs

**Teaches:**

- The impedance mismatch: objects have identity, inheritance, and behavior; tables have rows, foreign keys, and no behavior
- What an ORM does: maps classes to tables, objects to rows, attributes to columns
- The cost: you lose direct control over SQL — the ORM generates queries for you, sometimes inefficiently
- When to bypass the ORM: complex queries, bulk inserts, reporting — raw SQL is still valid
- SQLAlchemy's two layers: Core (SQL expression language) and ORM (object mapping). We use the ORM but the Core exists.

**Builds:** Nothing yet. This lesson is concept-only. Student reads the SQLAlchemy documentation overview and identifies where their existing code will map to SQLAlchemy concepts.

**Watch for:** This is a short conceptual lesson. If the student wants depth on the impedance mismatch (Greenspun's law, the ORM controversy), note those resources but keep the lesson focused.

---

### Lesson 32 — Declaring Models

**Covers:** `DeclarativeBase`, `mapped_column`, `Column` types, `__tablename__`, creating tables with `create_all()`

**Teaches:**

- `DeclarativeBase` is the foundation: all your model classes inherit from it
- `mapped_column` annotates class attributes to map to database columns
- SQLAlchemy types (`String`, `Float`, `Integer`) and how they map to SQLite types
- `create_all()` inspects your model classes and generates `CREATE TABLE` SQL — you can see this SQL if you enable echo mode
- Why `echo=True` on the engine is your best learning tool: read every SQL statement SQLAlchemy generates

**Builds:** Rewrite the `Tool` model class as a SQLAlchemy declarative model. Use `echo=True` to see the generated `CREATE TABLE` statement. Compare it to the SQL written in Block 2.

**Watch for:** The `Mapped[type]` annotation style (SQLAlchemy 2.0) vs the older `Column` style. Teach only the 2.0 style — it's cleaner and better typed.

---

### Lesson 33 — Session and CRUD

**Covers:** `Session`, `sessionmaker`, `add()`, `commit()`, `query` (select), `delete()`

**Teaches:**

- The Session is the unit of work: it tracks all objects you've touched and flushes changes to the database on commit
- Why the Session exists: batch multiple changes and commit them as one transaction
- The identity map: within one Session, the same row always returns the same Python object
- Lazy loading vs immediate loading: accessing `tool.holder` may trigger a new SQL query
- The `with Session() as session` pattern for automatic cleanup

**Builds:** Rewrite the `ToolRepository` class from Lesson 17 using SQLAlchemy sessions. All CRUD operations now use the ORM. Verify with `echo=True` that the generated SQL matches what was written by hand.

**Watch for:** The common mistake of reusing a Session across threads. Mention it; don't solve it yet.

---

### Lesson 34 — Relationships

**Covers:** `relationship()`, `ForeignKey`, `back_populates`, lazy vs eager loading, `joinedload()`

**Teaches:**

- `relationship()` adds a Python attribute that loads related objects — `tool.holder` returns a `Holder` object
- `back_populates` creates a bidirectional relationship: `holder.tools` returns all tools for a holder
- Lazy loading: the related object is not loaded until you access the attribute (triggers a second query)
- Eager loading with `joinedload()`: load the related object in the same query — one query instead of N+1
- The N+1 query problem: iterating a list and accessing a relationship on each item — the classic ORM performance trap

**Builds:** Add a `Holder` model with a `relationship` to `Tool`. Show the N+1 query problem in action with `echo=True`. Fix it with `joinedload()`.

**Watch for:** The N+1 problem deserves its own slow demonstration so the student really sees it. Don't rush past it.

---

### Lesson 35 — Inheritance Mapping

**Covers:** `polymorphic_on`, `polymorphic_identity`, single-table inheritance in SQLAlchemy

**Teaches:**

- SQLAlchemy mirrors the database inheritance patterns from Lesson 28: single-table, joined-table, concrete-table
- `polymorphic_on` is the discriminator column (`tool_type`) — SQLAlchemy uses it to instantiate the right subclass
- `polymorphic_identity` is the value in that column for each subclass
- `query(Tool)` returns a mix of `Drill`, `EndMill`, etc. objects — polymorphism working at the ORM level
- `isinstance()` checks are no longer a code smell here — the ORM gives you typed objects

**Builds:** Add `Drill(Tool)` and `EndMill(Tool)` SQLAlchemy models with the inheritance mapping configured. Query all tools and observe that drills come back as `Drill` instances, endmills as `EndMill`.

**Watch for:** The `__mapper_args__` syntax is dense. Step through it slowly.

---

### Lesson 36 — Querying with SQLAlchemy

**Covers:** `select()`, `where()`, `join()`, `order_by()`, `scalars()`, `scalar_one_or_none()`

**Teaches:**

- SQLAlchemy 2.0 uses `select()` statements instead of `session.query()` — the modern approach
- Chaining `.where()` conditions vs `and_()` / `or_()` for complex filters
- `.scalars()` vs `.all()`: `.scalars()` unwraps the row wrapper and gives you the ORM objects directly
- Comparing SQLAlchemy query output to hand-written SQL: they should produce identical results
- When to drop to raw SQL: complex queries with window functions, lateral joins, CTEs are easier in raw SQL

**Builds:** Rewrite all search functions from the repository class using SQLAlchemy `select()` statements. Side-by-side: raw SQL version vs SQLAlchemy version. Verify identical results.

**Watch for:** Text-based fallback with `text()` for cases where SQLAlchemy can't express the query cleanly.

---

### Lesson 37 — Alembic: Database Migrations with SQLAlchemy

**Covers:** What Alembic is, `alembic init`, `alembic revision --autogenerate`, `alembic upgrade head`

**Teaches:**

- Alembic is the migration tool for SQLAlchemy: it detects differences between your models and your database and generates migration scripts
- `--autogenerate` compares the current database schema to your model definitions and writes the migration
- Why you should always review generated migrations: autogenerate doesn't catch everything
- `upgrade` and `downgrade` functions: every migration must be reversible (ideally)
- The `alembic_version` table: how Alembic tracks which migrations have run

**Builds:** Initialize Alembic for the project. Add a new column to the `Tool` model. Run `--autogenerate` and inspect the generated migration. Run `upgrade head`. Verify in DB Browser.

**Watch for:** `--autogenerate` limitations: it doesn't detect column renames, only additions/removals. Flag this.

---

## Block 6 — Pydantic: Validation and Schemas

*Goal: Guard every data boundary. Nothing invalid enters the database. Nothing unexpected leaves it.*

---

### Lesson 38 — What is Data Validation?

**Covers:** The concept of a schema, validation at system boundaries, why runtime validation matters even with type hints

**Teaches:**

- Python type hints are not enforced at runtime — they're documentation, not contracts
- Pydantic enforces types at runtime: it will raise an error if a string is passed where a float is expected
- System boundaries: user input, file import, API response — anywhere data enters your system from outside
- The schema/model split: Pydantic schemas (what the user sends) vs SQLAlchemy models (what lives in the database). They are different things.
- Defensive programming: validate early, fail loudly, give clear error messages

**Builds:** No code yet. The lesson is a demonstration: pass bad data to raw Python (it silently stores `"abc"` as a diameter), then show what Pydantic does with the same bad data. The contrast is the lesson.

**Watch for:** This is a short conceptual lesson. The key insight is that type hints ≠ validation. Once that lands, the Pydantic code is easy.

---

### Lesson 39 — Pydantic BaseModel

**Covers:** `BaseModel`, field type annotations, automatic type coercion, `ValidationError`

**Teaches:**

- `BaseModel` is Pydantic's base class: declare fields as type-annotated class attributes
- Pydantic coerces where it can: `"1.5"` becomes `1.5` for a `float` field. Document why this is usually good.
- `ValidationError` contains all field errors, not just the first one — the whole error surface at once
- `model.model_dump()` to get a plain dict; `Model.model_validate(dict)` to parse a dict into a model
- `Optional[type]` (or `type | None`) for nullable fields

**Builds:** A `ToolCreate` Pydantic model for the "add tool" form. Validate the data from the Add Tool dialog before it touches the database. Print the validation errors when bad data is entered.

**Watch for:** `model_validate` vs `__init__` — both create a model but `model_validate` is for parsing external data.

---

### Lesson 40 — Field Constraints and Custom Validators

**Covers:** `Field(gt=0, le=100)`, `@field_validator`, `@model_validator`, validation order

**Teaches:**

- `Field()` attaches metadata and constraints to a field: min, max, regex pattern, description
- `@field_validator` runs after the type check — use it for business logic validation
- `@model_validator` runs after all fields are validated — use it for cross-field rules
- The validation order: type coercion → field constraints → field validators → model validators
- Raising `ValueError` inside a validator: Pydantic catches it and adds it to the `ValidationError`

**Builds:** Constraints on `ToolCreate`: diameter must be positive, flutes must be 1-16, stickout must not exceed a limit. A cross-field validator: stickout ≤ holder_length if holder_id is provided.

**Watch for:** `@model_validator(mode='before')` vs `mode='after'` — the difference matters and trips people up.

---

### Lesson 41 — Pydantic and SQLAlchemy Together

**Covers:** The "schema vs model" pattern: `ToolCreate`, `ToolRead`, `ToolUpdate` Pydantic schemas alongside `Tool` SQLAlchemy model

**Teaches:**

- Three distinct Pydantic schemas for three operations: Create (no ID, all required fields), Read (has ID, may have computed fields), Update (all fields optional — only send what changed)
- Why the SQLAlchemy model and Pydantic schema are separate: the ORM model owns database logic; the Pydantic schema owns validation logic
- `model_config = ConfigDict(from_attributes=True)` allows Pydantic to build a model from a SQLAlchemy ORM object
- The conversion layer: ORM object → Pydantic schema (for display), Pydantic schema → dict → ORM object (for save)

**Builds:** Add `ToolCreate`, `ToolRead`, and `ToolUpdate` schemas. Update the form to validate with `ToolCreate` before saving. Update the table model to return `ToolRead` schemas.

**Watch for:** This lesson is where the architecture crystallizes. Take the time to draw the data flow: Form input → ToolCreate → validate → Tool ORM → save → ToolRead → display.

---

## Block 7 — Mastercam Tool Database Integration

*Goal: Read and write Mastercam's .tooldb format. Import tools into your database; export your tools back.*

---

### Lesson 42 — Exploring the Mastercam .tooldb Schema

**Covers:** Opening a `.tooldb` file with sqlite3, inspecting tables with `sqlite_master`, understanding Mastercam's schema

**Teaches:**

- `sqlite_master` is a system table that describes every table, index, and view in a SQLite database — your schema inspector
- How to map an unfamiliar database schema: read the table names, read the column names, insert a known record in Mastercam and then query for it to understand what each column means
- The ETL (Extract, Transform, Load) pattern: extract from source, transform to your format, load into destination
- Why you never modify the source database directly: always extract and transform into a copy

**Builds:** A script that opens a `.tooldb` file, reads `sqlite_master`, prints every table and its columns. Then reads 5 tool records and prints them raw.

**Watch for:** If the student doesn't have a Mastercam `.tooldb` file, this lesson needs a sample file. Flag this dependency.

---

### Lesson 43 — Mapping Mastercam Fields to Your Schema

**Covers:** Writing a transformation function from a Mastercam row to a `ToolCreate` Pydantic schema

**Teaches:**

- Schema mapping: translating field names and units between two systems
- Unit conversion: Mastercam may store in inches or mm depending on configuration — always make units explicit
- Handling missing fields: what to do when the source record doesn't have a field your schema requires
- Null-safe field access: `row['field'] or default` patterns
- The adapter pattern: a translation layer that isolates your system from Mastercam's schema changes

**Builds:** A `MastercamAdapter` class with a `to_tool_create(row) -> ToolCreate` method. Test it against real records from the `.tooldb` file.

**Watch for:** Mastercam's tool type codes (numeric IDs for tool type) need to be mapped to your `tool_type` strings. This mapping table deserves explicit documentation.

---

### Lesson 44 — Importing Tools from Mastercam

**Covers:** The full import pipeline: open `.tooldb`, extract rows, transform to `ToolCreate`, validate, insert into your database

**Teaches:**

- The import as a transaction: either all tools import or none do — no partial imports
- Conflict handling: what happens when a tool with the same name already exists (skip, overwrite, or rename)
- Import reporting: how many tools were imported, how many skipped, how many failed validation
- Idempotency: running the import twice should not create duplicates

**Builds:** An "Import from Mastercam" button that opens a file picker, runs the full import pipeline, and shows a result summary (imported: 47, skipped: 3, errors: 1).

**Watch for:** The file picker uses `QFileDialog` — introduce it here if it hasn't appeared yet.

---

### Lesson 45 — Exporting Tools to Mastercam Format

**Covers:** Writing a `ToolCreate` to a Mastercam-compatible `.tooldb` file

**Teaches:**

- The reverse adapter: your schema → Mastercam schema
- Why export is harder than import: you must fill in Mastercam's required fields even if your schema doesn't have them (use defaults)
- Testing the export: import the exported file into Mastercam and verify the tools appear correctly
- File versioning: Mastercam's database format may change between versions — note which version you're targeting

**Builds:** An "Export to Mastercam" button that creates a new `.tooldb` file with all selected tools converted to Mastercam format.

**Watch for:** If Mastercam has required fields with complex defaults, this lesson could expand significantly. Keep scope tight: export the fields you know; document the rest as stubs.

---

## Block 8 — XML Parsing

*Goal: Parse Mastercam's XML operation sheets and tool reports. Join the XML data against your tool database.*

---

### Lesson 46 — What is XML?

**Covers:** XML syntax: elements, attributes, text content, nesting, namespaces, well-formedness vs validity

**Teaches:**

- XML is a tree: every document has a single root element, and elements can nest arbitrarily deep
- The difference between an element (`<tool>`) and an attribute (`<tool id="5">`) and when to use each
- Namespaces: why they exist (avoid name collisions when two XML vocabularies are combined), what the `xmlns` prefix means
- Well-formedness rules: every open tag must close, attributes must be quoted
- XPath as a query language for trees: a brief introduction — `/tools/tool[@id='5']` selects the tool element with id=5

**Builds:** Student opens a Mastercam XML file in a text editor and annotates it: mark the root element, find the tool list, find the attributes that identify each tool, find the operation list.

**Watch for:** XSLT, XML Schema (XSD), and DTDs are real XML technologies but are not needed here. Don't go there.

---

### Lesson 47 — Parsing XML with ElementTree

**Covers:** `xml.etree.ElementTree`, `parse()`, `getroot()`, `find()`, `findall()`, `get()` for attributes, iterating children

**Teaches:**

- `ElementTree` is Python's standard library XML parser — no installation needed
- `find()` returns the first matching child; `findall()` returns all matches — the difference matters
- Attribute access via `element.get('name')` — returns None if missing vs `element.attrib['name']` which raises
- Iterating all `<tool>` elements: `root.findall('.//tool')` — the `.//' XPath prefix searches all descendants
- Text content: `element.text` — and why it's often whitespace-padded in real XML

**Builds:** A script that opens a Mastercam XML operation sheet and extracts: tool number, tool name, operation name, and cutting parameters for each operation.

**Watch for:** `lxml` is a faster, more capable XML library — worth mentioning as an upgrade path if the student hits ElementTree limitations.

---

### Lesson 48 — Joining XML Data to the Database

**Covers:** Using tool numbers from XML to look up tools in the database, building a combined operation report

**Teaches:**

- The join concept applied to heterogeneous data sources: XML + SQLite joined on a shared key (tool number)
- Handling mismatches: tools in the XML that don't exist in the database — graceful fallback
- Building a report data structure: a list of dicts combining XML operation data with database tool data
- Why you build an intermediate data structure before displaying — separation between data gathering and display

**Builds:** A script that reads a Mastercam XML file, looks up each tool in the database, and prints a report: "Operation: POCKET-1, Tool: 0.5" Endmill (Carbide), SFM: 800, Feed: 0.003".

**Watch for:** If the Mastercam XML uses tool names (not numbers) as the key, the join logic changes. Document which key the student's XML uses.

---

### Lesson 49 — Displaying the XML Report in the UI

**Covers:** Adding a "Reports" tab to the application, populating a table from the joined XML+database data

**Teaches:**

- Tabbed interfaces: `QTabWidget` for switching between the tool library view and the report view
- The report as a read-only view: the user cannot edit it — `Qt.ItemIsEnabled` but not `Qt.ItemIsEditable`
- Sorting report columns: operations by tool number, by SFM, by feed
- Export to CSV: writing the report table to a file

**Builds:** A "Reports" tab with a file picker to load a Mastercam XML, a button to run the join, and a table showing the combined results.

**Watch for:** If the XML files are large, parsing on the GUI thread will freeze the UI. Flag this as a future threading task.

---

## Block 9 — Multi-Database Aggregation, File Watching, and Multi-User

*Goal: Scan a directory of .tooldb files, merge them into a master library, watch for new files added while the app is running, and handle multiple people reading and writing at the same time on a shared network.*

---

### Lesson 50 — File System Navigation with pathlib

**Covers:** `pathlib.Path`, `.glob()`, `.rglob()`, `.stat()`, file metadata, checking existence and type

**Teaches:**

- `pathlib` is the modern way to work with file paths — prefer it over `os.path`
- `Path` objects are not strings — they're objects with methods. `path / 'subfolder'` builds paths safely.
- `.glob('*.tooldb')` returns all `.tooldb` files in a directory; `.rglob()` recurses into subdirectories
- `.stat().st_mtime` is the last-modified timestamp — useful for incremental sync
- Iterating a generator vs a list: `.glob()` returns a generator (lazy), convert with `list()` if you need the count

**Builds:** A script that scans a directory, finds all `.tooldb` files, and prints their path, file size, and last-modified date.

**Watch for:** Symbolic links and permission errors are edge cases worth mentioning. `try/except PermissionError` around the scan.

---

### Lesson 51 — Merge Strategy and Conflict Resolution

**Covers:** Deciding what to do when two databases have the same tool: skip, overwrite, rename. Tracking source.

**Teaches:**

- Merge as a set operation: union of two sets, but rows are not atomic — they have fields that may differ
- Three merge strategies: skip (keep existing), overwrite (replace with incoming), rename (keep both)
- The source column: every imported tool carries the filename it came from and the import timestamp
- Idempotency again: merging a database twice should produce the same result as merging it once
- Conflict detection: two tools are "the same" if their tool number and source match — define the identity key explicitly

**Builds:** A `MergePolicy` enum (`SKIP`, `OVERWRITE`, `RENAME`). A `merge_database(path, policy)` function that imports tools from a file according to the policy.

**Watch for:** "Same tool" is ambiguous — same tool number? same name? same geometry? Make the identity key explicit before writing code.

---

### Lesson 52 — Batch Import UI

**Covers:** `QFileDialog.getExistingDirectory()`, a progress dialog, processing multiple files in sequence

**Teaches:**

- `QFileDialog.getExistingDirectory()` for selecting a folder
- `QProgressDialog` for long-running operations: show progress without freezing the UI
- Processing files in a loop and updating the progress bar after each file
- Summary reporting: total files found, imported, skipped, errors

**Builds:** A "Batch Import" menu option that opens a folder picker, scans for `.tooldb` files, imports each one, and shows a summary.

**Watch for:** For large numbers of files, this should run on a background thread. Flag it explicitly. The proper fix (QThread or concurrent.futures) is a future lesson.

---

### Lesson 53 — File System Watching

**Covers:** Detecting when new `.tooldb` files are added to the watched directory while the app is already running, and notifying the user without requiring a manual refresh

**Teaches:**

- File system watching: the OS can notify your program when files are created, modified, or deleted in a directory — you don't have to poll on a timer
- The `watchdog` library: a Python library that wraps the OS file system event APIs (inotify on Linux, FSEvents on macOS, ReadDirectoryChangesW on Windows)
- Observer and event handler pattern: `watchdog` uses an event handler class — you subclass it and override `on_created`, `on_modified`, `on_deleted`
- Thread safety problem: `watchdog` calls your handler on a background thread, but Qt widgets must only be touched from the main thread. The fix: emit a Qt signal from the handler — signals are thread-safe
- The difference between watching for new files (someone dropped a new `.tooldb` into the folder) vs watching for modifications (an existing database was updated by another process)
- Debouncing: file system events often fire multiple times for a single logical change (create, then write, then close). Wait 500ms after the last event before reacting.

**Builds:** A `DatabaseWatcher` class using `watchdog` that monitors the configured tool library directory. When a new `.tooldb` file appears, it emits a signal. The main window receives the signal and shows a notification bar: "New database found: shop_floor.tooldb — Import?" with Accept/Dismiss buttons.

**Watch for:** On Windows, network drives may not generate file system events reliably — the OS event API only works locally. Flag the fallback: a `QTimer` that polls the directory every 30 seconds as a backup when the watcher reports no events.

---

### Lesson 54 — SQLite in Multi-User and Network Environments

**Covers:** How SQLite handles concurrent access, what WAL mode is, why SQLite on a network drive is risky, and what patterns reduce data loss when multiple people use the same database

**Teaches:**

- SQLite's concurrency model: by default, only one writer at a time, and writers block readers. This is fine for a single user; it becomes a problem when two people try to save at the same time.
- WAL mode (Write-Ahead Logging): instead of writing changes directly into the database file, SQLite appends them to a separate log file. Readers see the last committed state; the writer works in the log. This allows concurrent reads during a write.
- How to enable WAL: `PRAGMA journal_mode=WAL` — run once when the database is first created. It persists.
- Network drive limitations: SQLite relies on OS-level file locking. Many network file systems (NFS, some SMB configurations) do not implement file locking correctly. A write on machine A may not be seen immediately by machine B. In the worst case, two writes happen simultaneously and corrupt the file.
- The honest answer about SQLite on a network drive: it is not designed for this. It works reliably only when one machine at a time writes, and even then only on well-configured SMB shares (not NFS). For real multi-user concurrent writes, the right tool is PostgreSQL or a similar client-server database.
- Practical patterns that reduce risk with SQLite on a network:
  - Designated writer: only one machine writes; others read a local copy synced periodically
  - File locking conventions: write a separate `.lock` file when starting a write operation; other clients check for it
  - Versioned snapshots: instead of one shared live file, each user works on a local copy; changes are merged back on a schedule
- Connection settings that help: `timeout` (how long to wait for a lock before giving up), `check_same_thread=False` (allows passing a connection between threads, but requires manual locking)

**Builds:** A `DatabaseManager` class that opens the database with WAL mode enabled, sets a connection timeout, and wraps every write in a retry loop (up to 3 attempts with backoff). Demonstrates what happens when two scripts write simultaneously — one waits, then succeeds.

**Watch for:** This lesson may be the point where the student asks "should I use PostgreSQL instead?" That's a valid question. Have an honest answer ready: PostgreSQL is the right tool for true multi-user concurrent writes; SQLite is the right tool for a desktop app with occasional network sharing. Choosing depends on the actual usage pattern.

---

### Lesson 55 — Database Backup Strategies

**Covers:** The SQLite online backup API, scheduled backups, and strategies for a shared-use tool library

**Teaches:**

- The naive backup: copy the `.db` file while the app is running. This is unsafe — if a write is in progress, the copy may be corrupt. Never do this for a live database.
- The safe backup: SQLite's built-in online backup API (`sqlite3.Connection.backup()`). It copies the database to a new file safely even while reads and writes are happening. This is the correct method.
- Backup naming: include a timestamp in the backup filename — `tooldb_backup_2026-05-20_14-30.db`. Never overwrite a backup in place.
- Rotation: keep the last N backups; delete older ones. Otherwise the backup folder fills up.
- When to back up: on app startup (before the user can make changes), on a schedule (every hour via a `QTimer`), and before any bulk import operation
- Restoring: a backup is just a regular SQLite file. Restore by closing the current connection, copying the backup file over the live file, and reopening.
- The shared-network scenario: if multiple users share one `.db` file on a network drive, designate one machine as the backup runner. The others should not attempt to back up — they would all write separate backup files and the result is chaos.

**Builds:** A `BackupManager` class with `backup_now(reason)` that uses the SQLite backup API to write a timestamped copy to a `backups/` subfolder, then prunes files older than 30 days. A "Backup Now" menu item. A startup backup that runs automatically when the app opens.

**Watch for:** The `backup()` method blocks until complete. For large databases, run it on a background thread. Flag this; solve it if the database is large enough to matter.

---

### Lesson 56 — Source Tracking and Audit View

**Covers:** Displaying where each tool came from, filtering by source, the audit trail concept

**Teaches:**

- Provenance: knowing where data came from and when it was added is a first-class data concern
- Adding `source_file` and `imported_at` columns to the tools table
- Filtering the tool table by source: show only tools from "shop_floor_db" or only tools from "library_db"
- The audit log concept: a separate table that records every change (who changed what, when)

**Builds:** A "Source" filter dropdown in the UI that filters the tool table by source file. A "Sources" summary panel showing each source file and how many tools it contributed.

**Watch for:** A full audit log (insert/update/delete history) is more complex — flag it as a future enhancement.

---

## Block 10 — Advanced UI: Search, Filters, and the Full Application

*Goal: Complete the application. Fast search, combined filters, assembly view, export.*

---

### Lesson 54 — Live Search with QSortFilterProxyModel

**Covers:** `QSortFilterProxyModel`, `setFilterKeyColumn()`, `setFilterFixedString()`, `setFilterCaseSensitivity()`

**Teaches:**

- A proxy model wraps another model and adds behavior without changing the underlying model — the proxy pattern
- `QSortFilterProxyModel` provides sorting and filtering for free — no manual filtering code needed
- `filterAcceptsRow()` override for custom filter logic: filter on multiple columns simultaneously
- The proxy model index vs the source model index: when you get a selected row from the view, the index is in proxy space — you must call `mapToSource()` to get the real row

**Builds:** Replace manual search with `QSortFilterProxyModel`. The search bar now filters all columns simultaneously. The table sorts by clicking column headers.

**Watch for:** `mapToSource()` and `mapFromSource()` are confusing at first. Demonstrate the bug (wrong row selected) before the fix.

---

### Lesson 55 — Combined Filters

**Covers:** Multiple simultaneous filters: type dropdown + material dropdown + diameter range

**Teaches:**

- Composing filters: each active filter narrows the result further (AND logic)
- Overriding `filterAcceptsRow()` to check multiple conditions
- Reset-all-filters button: clearing every filter widget and resetting the model
- Filter state as a data structure: a dict of `{field: value}` that the model checks against

**Builds:** A filter panel with dropdowns for tool type and material, plus min/max diameter inputs. All filters stack. A "Clear Filters" button resets them all.

**Watch for:** The filter state needs to be centralized — avoid connecting each widget directly to a different filter method.

---

### Lesson 62 — Assembly View and Job Assignment

**Covers:** The full independent data model — tools, holders, assemblies, and jobs are all separate entities that reference each other through relationships. Building the UI to manage all four.

**Teaches:**

- The complete entity model for this system:
  - `tools` — exist independently. A tool is a tool whether or not it is assembled or assigned to anything.
  - `holders` — exist independently. A holder is a holder whether or not anything is mounted in it.
  - `assemblies` — a named, reusable combination: tool + holder + stickout. An assembly is its own thing. The same assembly can be assigned to 10 different jobs. You don't recreate it each time — you reference it.
  - `parts` — the workpiece being machined. Exists independently of jobs.
  - `jobs` — a job runs operations on a part on a machine. It references assemblies through the `job_assemblies` junction table.
  - `machines` — exist independently. Machine name may be pulled from the Mastercam `.tooldb` file.
- Why everything is independent: you may want to browse your full tool library without being in a job context. You may want to build assemblies in advance before assigning them to jobs. You may want to see every job that uses a particular assembly. None of this is possible if assemblies "belong to" a job.
- Managing relationships in the UI: adding an assembly to a job inserts a row into `job_assemblies`. Removing it deletes that row. The assembly still exists — you just removed the link.
- The master-detail layout with `QSplitter`: entity list on the left, details + related entities on the right
- Computed fields in the UI layer: gauge length, stickout reach, stick-out from spindle face — computed from assembly + holder geometry, displayed but not stored (unless performance requires it)

**Builds:** An "Assemblies" tab listing all assemblies independently. Clicking one shows the tool, holder, stickout, and which jobs currently use it. A "Jobs" tab listing jobs, with each job showing its assigned assemblies. Drag-and-drop or a picker dialog to assign/remove assemblies from a job.

**Watch for:** The job/part/machine relationship may expand significantly once the student connects this to Mastercam XML output. Keep the initial build simple — add fields as real data sources are connected in later blocks.

---

### Lesson 57 — Export: CSV, JSON, and Mastercam

**Covers:** `csv` module, `json` module, exporting the filtered view, exporting to `.tooldb`

**Teaches:**

- `csv.DictWriter` for structured CSV export: write the header row, then each row as a dict
- `json.dump()` with `indent=2` for human-readable JSON
- Why you export the current filtered view, not everything: the user has already done the work of filtering
- The export as a snapshot: it captures the state at export time, not a live connection

**Builds:** An "Export" menu with three options: CSV, JSON, Mastercam .tooldb. All three export the currently filtered tool list.

**Watch for:** Encoding issues (special characters in tool names) in CSV exports. Always use `encoding='utf-8'` explicitly.

---

### Lesson 58 — Application Settings and Persistence

**Covers:** `QSettings`, saving window size/position, saving user preferences (last directory, column visibility)

**Teaches:**

- `QSettings` stores key-value pairs on disk using the platform's native mechanism (registry on Windows, .plist on Mac, .ini on Linux)
- What should be persisted: window geometry, last-used directory, filter states, column visibility
- What should NOT be persisted: anything the database already stores
- `closeEvent()` on `QMainWindow` for saving state when the window closes
- Restoring state on startup: load from `QSettings` before showing the window

**Builds:** The app remembers: window size, last opened database path, visible columns. These survive closing and reopening.

**Watch for:** `QSettings` with company and application name for proper namespacing on Windows.

---

### Lesson 59 — Packaging the Application

**Covers:** `pyproject.toml`, `PyInstaller` or `cx_Freeze`, creating a standalone executable

**Teaches:**

- `pyproject.toml` is the modern Python project configuration file: it replaces `setup.py`
- What "packaging" means: bundling Python, your code, and all dependencies into one thing a user can run
- PyInstaller's `--onefile` mode vs directory mode: tradeoffs in size and startup speed
- The hidden imports problem: PyInstaller misses some dynamic imports — how to fix with `--hidden-import`
- Why packaging is hard: dynamic imports, native extensions, data files, platform differences

**Builds:** A `pyproject.toml` for the project. A PyInstaller spec file. A working `.exe` on Windows.

**Watch for:** PySide6 + PyInstaller has known issues. Research the current state before this lesson and document the working command.

---

*End of lesson plan. Total: approximately 70 lessons across 11 blocks. Lesson numbers will be finalized when content is written — new lessons were inserted during planning and numbers are not yet sequential.*

---

## Block 11 — REST API and the React Migration

*Goal: Turn the Python backend into a server that React can talk to. The services and repositories from earlier blocks do not change. The only new code is a thin API layer that receives HTTP requests and calls the same services the PySide6 widgets were calling. When this block is done, the PySide6 UI can be deleted entirely.*

---

### Lesson — What is a REST API?

**Covers:** What HTTP is, what a REST API is, requests and responses, JSON, status codes, what a "route" is

**Teaches:**

- HTTP is a request/response protocol: a client sends a request to a URL, the server sends back a response
- REST is a convention for organizing those requests: use URLs to name resources (`/tools`, `/tools/5`), use HTTP methods to name actions (`GET` to read, `POST` to create, `PUT`/`PATCH` to update, `DELETE` to remove)
- JSON is the data format: the same Pydantic schemas that validate form input now serialize to JSON and back
- Status codes: `200` OK, `201` Created, `404` Not Found, `422` Unprocessable Entity (validation error), `500` Server Error
- Why an API makes the UI replaceable: the Python backend no longer cares what the UI is built in. React, a mobile app, a CLI, another Python script — anything that can send an HTTP request can use it.

**Builds:** No code yet. Student uses a browser to fetch `https://jsonplaceholder.typicode.com/todos/1` and reads the JSON response. Identifies the URL, method, status code, and body. This is exactly what React will do with your backend.

**Watch for:** REST is a convention, not a standard — there are endless debates about the "right" way to structure URLs. Teach one clear convention and use it consistently. Don't get into those debates.

---

### Lesson — FastAPI: Your First Route

**Covers:** What FastAPI is, installing it and `uvicorn`, writing a `GET` route, running the dev server, the auto-generated docs page

**Teaches:**

- FastAPI is a Python web framework for building APIs — it is fast, modern, and uses Pydantic natively
- `uvicorn` is the server that runs your FastAPI app — it listens for HTTP requests and passes them to your app
- A route is a function decorated with `@app.get("/path")` — FastAPI calls it when a matching request arrives
- The auto-generated docs at `/docs`: FastAPI reads your route function signatures and Pydantic schemas and builds interactive documentation automatically — you can test every endpoint in the browser
- Why FastAPI and not Flask or Django: it uses the same Pydantic schemas you already wrote. No new validation layer needed. The schemas serve double duty.

**Builds:** A `main.py` with FastAPI. A single `GET /tools` route that calls `ToolService.get_all()` and returns a list of `ToolRead` schemas. Run the server, open `/docs` in the browser, and call the route.

**Watch for:** The difference between `uvicorn main:app` (production) and `uvicorn main:app --reload` (development with auto-restart). Always use `--reload` while building.

---

### Lesson — CRUD Routes for Tools

**Covers:** `GET /tools`, `GET /tools/{id}`, `POST /tools`, `PATCH /tools/{id}`, `DELETE /tools/{id}`

**Teaches:**

- Path parameters: `{id}` in the URL is extracted and passed to your function — `def get_tool(id: int)`
- Request body: a `POST` route accepts a Pydantic model as the body — FastAPI deserializes the JSON automatically
- The `PATCH` vs `PUT` distinction: `PUT` replaces the whole record; `PATCH` updates only the fields that were sent. Use `PATCH` with the `ToolUpdate` schema (all fields optional) so callers only send what changed.
- Returning the right status code: `201` for created resources, `404` when the ID does not exist, `422` when validation fails (FastAPI does this automatically for Pydantic errors)
- HTTP exceptions: `raise HTTPException(status_code=404, detail="Tool not found")` — FastAPI catches it and formats the error response

**Builds:** All five CRUD routes for tools. Test every one in the `/docs` UI. The routes call the same `ToolService` that the PySide6 widgets called — no business logic is in the route functions.

**Watch for:** Route functions should be thin — a few lines each. If a route function has branching logic or database calls, that logic belongs in the service layer.

---

### Lesson — Routes for Holders, Assemblies, and Jobs

**Covers:** Repeating the CRUD pattern for the other entities. Relationship routes: assigning/removing assemblies from jobs.

**Teaches:**

- The same CRUD pattern applied to `holders`, `assemblies`, and `jobs` — reinforce that the pattern is consistent
- Relationship endpoints: `POST /jobs/{job_id}/assemblies/{assembly_id}` to assign an assembly to a job, `DELETE /jobs/{job_id}/assemblies/{assembly_id}` to remove it. These insert/delete rows in the junction table.
- Nested responses: `GET /jobs/{id}` returns the job with its full list of assemblies embedded — a nested Pydantic schema
- Why relationship endpoints are on the parent resource: `/jobs/{id}/assemblies` makes clear that you are managing the job's assembly list, not the assembly itself

**Builds:** Full CRUD routes for all four entities. Relationship endpoints for job-assembly assignment. Test in `/docs`.

**Watch for:** Nested schemas can grow large — a job with assemblies, each assembly with a tool and holder. Control the depth explicitly or responses get very large.

---

### Lesson — Search and Filter Routes

**Covers:** Query parameters for filtering — `GET /tools?material=carbide&min_diameter=0.25`

**Teaches:**

- Query parameters are the key-value pairs after the `?` in a URL — FastAPI extracts them as function arguments automatically
- Optional query parameters: `def get_tools(material: str | None = None, min_diameter: float | None = None)` — None means "not filtered"
- Passing filter parameters down to the service layer: the route extracts them, passes them to the service, the service passes them to the repository
- Why search lives in query parameters and not the request body: `GET` requests should not have a body — it is a REST convention and some tools (like browsers and caches) do not support it

**Builds:** A filterable `GET /tools` route with optional query parameters for type, material, min/max diameter, and a text search. The same filters the PySide6 UI used, now available over HTTP.

**Watch for:** Too many query parameters becomes unwieldy. For complex filters, a `POST /tools/search` with a filter body is a reasonable alternative — note the tradeoff.

---

### Lesson — CORS: Letting React Talk to the Python Server

**Covers:** What CORS is, why the browser blocks cross-origin requests by default, how to enable it in FastAPI

**Teaches:**

- CORS (Cross-Origin Resource Sharing) is a browser security rule: JavaScript on `http://localhost:5173` (React's dev server) is not allowed to fetch from `http://localhost:8000` (your FastAPI server) unless the server explicitly says it is allowed
- This restriction is enforced by the browser, not the server — the server still receives the request; the browser just refuses to give the response to JavaScript
- The `CORSMiddleware` in FastAPI: add it with `allow_origins=["http://localhost:5173"]` for development, tighten it for production
- Why you only need this during development with two separate servers. When React is built and served by the Python server from the same origin, CORS is no longer needed.
- The preflight request: browsers send an `OPTIONS` request before the real request to ask "are you willing to talk to me?" — FastAPI's CORS middleware handles this automatically

**Builds:** Add `CORSMiddleware` to the FastAPI app. Open the React dev server URL in a browser console and run a `fetch("http://localhost:8000/tools")` — it works. Remove CORS, run again — the browser blocks it. The contrast is the lesson.

**Watch for:** `allow_origins=["*"]` (allow all origins) is convenient for testing but never acceptable in production. Show it only to explain what it means; use a specific origin list from the start.

---

### Lesson — The Migration: Deleting the PySide6 UI

**Covers:** Connecting a React frontend to the FastAPI backend, verifying that the service and data layers are untouched, and removing the PySide6 code

**Teaches:**

- This lesson is the payoff for every separation-of-concerns decision made earlier. The UI is replaced; nothing else changes.
- `fetch` in React: `useEffect` to load tools on mount, `useState` to hold the list, render it in a table — the same data the PySide6 table showed
- The `ToolRead` schema is now a TypeScript interface in React (or inferred from the API response) — the contract that was defined in Python is now honored in JavaScript
- What stays: all of `services/`, `repositories/`, `models/`, `schemas/`, and the FastAPI routes
- What goes: everything in `ui/` — all the PySide6 widget code
- The lesson the deletion is meant to cement: if deleting `ui/` makes you nervous because you think business logic might be in there, go back and fix the violation. The deletion should be consequence-free.

**Builds:** A minimal React page that fetches `/tools` from the FastAPI server and renders them in a table. The PySide6 `ui/` folder is deleted. The app still works — now through a browser instead of a desktop window.

**Watch for:** This lesson is intentionally minimal on the React side — the React lessons cover React. This lesson only covers the connection point: FastAPI backend, fetch call, render. The rest of the React UI is built in the React curriculum.

---

## What to Review Before Writing Any Lesson

Before writing the content for any lesson, check:

1. **Is the lesson doing too many things?** If there are more than 3 distinct concepts, split it.
2. **Is there a BUILD checkpoint within the first half?** The student should run something before the lesson ends.
3. **Does every concept have a WHY?** Not just "here is how" but "here is why this exists."
4. **Are there concepts that were introduced but not built?** Flag them — either build them or cut them.
5. **Is the lesson's artifact reused in the next lesson?** Good lessons build on each other.

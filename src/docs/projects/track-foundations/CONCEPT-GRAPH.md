# Concept Graph — `track-foundations/`

The canonical artifact for this project. Every concept `track/`'s 34+
lessons rely on is exactly one node here — never duplicated, never
represented only inside a lesson tree. Lessons (written later) are
presentations of one or more nodes below; this file is the source of truth
they're generated from, not the other way around.

Governing rules (full detail in the approved plan,
`gleaming-giggling-noodle.md`), revised after a review pass on this first
worked chunk (Lessons 0–4):

- **Concepts are language-independent ideas; syntax is a mapping onto one.**
  A node like "explicit access to a parent's implementation" is the
  concept; `super` (Java), `super()` (Python), `base` (C#) are syntax
  mappings of it, listed on the node, never separate nodes of their own.
  Only Java is populated today (this is a Java/Android curriculum), but
  every node is structured so another language's curriculum could reuse
  the concept layer and add its own mappings later.
- Every concept gets one canonical ID with `Aliases` tracked explicitly,
  never rediscovered as a "new" synonym.
- `Required prerequisites` are blocking and drive the topological sort;
  `Related concepts` are informational only, never checked for cycles.
- `Builds toward` is the **reverse** of `Required prerequisites` — every
  node that lists this one as a requirement. It is mechanically derived,
  not separately hand-maintained; recomputed at each Validate pass, not
  trusted to stay accurate by hand as more lessons get extracted.
- Every required-prerequisite chain must terminate in the Learner Baseline
  below.
- `Depth required` (Recognition / Working / Mastery) prevents over-teaching
  concepts that only need a name and a "move on for now."
- `First needed because` (renamed from an earlier, misleading "Why") states
  why *this concept earns its own node* — not a restatement of the
  definition.
- **Promotion rule** (added after Lesson 6's review): a concept earns its
  own node if at least one of the following holds — (1) it has an
  independent mental model; (2) multiple later concepts depend on it; (3)
  it appears in more than one lesson; (4) it has substantially different
  implementations across languages/frameworks; (5) it's a prerequisite
  that would otherwise force repeating an explanation. Otherwise it stays
  documentation on an existing node rather than becoming a new one — e.g.
  RecyclerView's "binding phase" or "holder creation phase" are `Adapter`
  *behavior*, not separate concepts, where `ViewHolder`/`view-recycling`/
  `layout-inflation` each pass the rule independently.
- **All growth/reuse metrics are derived from the graph, never
  hand-maintained as a parallel table.** `Introduced` = the earliest
  lesson number in a node's `Used by (track/)` field. `Reused` = every
  later lesson number in that same field. `First reuse distance` = second-
  earliest lesson minus earliest. `Reuse count` = entry count minus one.
  `Active Vocabulary` at lesson N = the running total of distinct nodes
  introduced at or before lesson N (a proxy for the learner's cumulative
  cognitive load walking into the next lesson). `scripts/concept-graph-report.mjs`
  computes all of these mechanically by parsing this file — run it rather
  than hand-tracking a table again once past the first couple of batches.
- **`Used by (track/)` entries distinguish Introduces / Requires /
  Exercises** where it matters: the earliest lesson is implicitly
  "introduces"; a later lesson that just assumes the concept without
  teaching it is "requires" (the default, unmarked); a later lesson that
  gives the concept substantial *additional* hands-on depth beyond its
  introduction gets an explicit `(full treatment)` or similar parenthetical
  — e.g. `identity-vs-equality`'s `Lesson 0 (instanceof/cast context),
  Lesson 7 (full equals()/hashCode() treatment)`. This convention applies
  going forward from Lesson 11 on; Lessons 0–10's entries were written
  before the convention was formalized and are not being retroactively
  re-tagged wholesale — only touched if a specific node is revisited
  anyway.

**Status: Lessons 0–34 of 34 extracted (complete). 190 nodes,
`scripts/concept-graph-report.mjs` passes with 0 validation issues. Schema
frozen since Lesson 10 — no new node fields added since, only new
nodes/edges within the existing format. Extraction (build-order stage 1)
is done; the Graph Health Report has been generated and reviewed. Next:
user review of the full graph (stage 4), then global topological sort,
partition by category, and lesson grouping (stages 5–7) — no lesson prose
has been written yet.**

## Learner Baseline

Every `Required prerequisites` chain in this graph terminates here — these
are never themselves decomposed into nodes:

- variables, assignment, expressions
- if/else
- loops
- functions
- basic debugging
- simple scripts

---

## Category 00 — Programming Fundamentals

### stack-data-structure

Preferred Name: Stack (LIFO)
Aliases: []
Definition: A data structure allowing additions and removals only at the same end, so the most recently added entry is always the first one removed (Last In, First Out).
First needed because: The Android back stack (Lesson 5) is a real, live instance of this — needed as a general concept before its Android-specific application makes sense.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [activity-back-stack]
Related concepts: []
Syntax by language: Java — `java.util.Stack` or `Deque` as a real implementation, though the *concept* also shows up implicitly (the call stack, undo history) with no explicit class involved. Python — `list.append()`/`list.pop()` used as a stack, or `collections.deque`. Universal beyond any one language — also the mechanism behind function-call return addresses in every language's runtime.
Used by (track/): Lesson 5
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### field-lifetime-vs-local-lifetime

Preferred Name: Field Lifetime vs. Local Variable Lifetime
Aliases: []
Definition: A local variable's lifetime ends when its enclosing method call returns; an instance field's lifetime lasts as long as its object does.
First needed because: Code that needs to run later — an async callback, in particular — can only reach values stored in something with a long enough lifetime, which is exactly why `items`/`adapter` had to become fields instead of staying local to `onCreate`.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: [object, method]
Builds toward: []
Related concepts: [asynchronous-callback-result]
Used by (track/): Lesson 10
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### thread

Preferred Name: Thread
Aliases: []
Definition: A genuinely separate, concurrently-running unit of execution within one process, with its own call stack, able to run at the same time as other threads.
First needed because: Every callback in this course so far has silently run on the same single thread — a real, separate concurrent thread has never existed in this project until database work needed one.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [executor-service, main-thread-constraint, android-service]
Related concepts: []
Syntax by language: Java — `new Thread(() -> {...}).start()`, `Thread.currentThread()`. Python — the `threading` module, `Thread(target=...).start()`, though the GIL means true CPU-parallel execution differs from Java's model. C# — `System.Threading.Thread`, or more commonly `Task`/`async`/`await` for the same underlying capability.
Used by (track/): Lesson 14
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### synchronous-vs-asynchronous-execution

Preferred Name: Synchronous vs. Asynchronous Execution
Aliases: []
Definition: Work that blocks the calling code until done (synchronous) versus work handed off to run independently, with results delivered back later through a separate channel (asynchronous).
First needed because: Database work (Lesson 13) genuinely takes real time; running it synchronously on the main thread would freeze the whole UI for that duration.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [asynchronous-callback-result]
Used by (track/): Lesson 13, Lesson 14 (full treatment)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### volatile-vs-nonvolatile-state

Preferred Name: Volatile vs. Non-Volatile State
Aliases: []
Definition: Memory that exists only while a process runs (volatile) versus storage that outlives the process entirely (non-volatile).
First needed because: `onSaveInstanceState` (Lesson 5) rescues state across a configuration change, but the process itself — and everything in it — is still gone the moment the app is fully closed, not just backgrounded.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [process-death]
Related concepts: []
Used by (track/): Lesson 11
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### relational-database-model

Preferred Name: Relational Database Model
Aliases: []
Definition: Data organized as tables (a fixed set of named, typed columns) holding any number of rows, each row one record, queried declaratively rather than by manually walking a data structure.
First needed because: `Item.java`'s in-memory shape (Lesson 7) needs a durable, queryable version of the exact same idea the moment the app needs more than "read one saved value back" (Lesson 11's `SharedPreferences`).
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [primary-key, sql-query-language, orm-annotation-driven-persistence, sqlite-open-helper]
Related concepts: []
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### primary-key

Preferred Name: Primary Key
Aliases: []
Definition: A column (or set of columns) in a table guaranteed unique per row, used to unambiguously identify one specific record for updates or deletes.
First needed because: `Item.equals()` (Lesson 7) compares every field, which can't answer "update *this exact* item" once two items could coincidentally share every value.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: [relational-database-model]
Builds toward: [room-entity]
Related concepts: [identity-vs-equality]
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### sql-query-language

Preferred Name: SQL
Aliases: []
Definition: A declarative language for describing what data to retrieve, insert, update, or define (tables/schema) — a genuinely different language from Java, here embedded as plain strings.
First needed because: `CREATE TABLE`/`SELECT` are the actual vocabulary a relational database is operated with; nothing about them is Java syntax, and conflating the two is a real, easy trap.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: [relational-database-model]
Builds toward: [sqlite-open-helper, sql-injection]
Related concepts: []
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### directed-graph

Preferred Name: Directed Graph
Aliases: []
Definition: A data structure of nodes and directed edges between them — the same shape used to model state machines, sitemaps, and finite automata.
First needed because: A navigation graph is a literal directed graph — destinations as nodes, actions as edges — modeling an app's screen topology instead of a network or a map.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [navigation-graph]
Related concepts: []
Used by (track/): Lesson 19
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### minimal-edit-distance-diffing

Preferred Name: Minimal Edit Distance Diffing
Aliases: []
Definition: Computing the smallest set of insertions, deletions, and substitutions that transforms one ordered sequence into another.
First needed because: Replacing "assume everything changed and redraw it all" (`notifyDataSetChanged`) with the actual, precise difference between two list states — the same algorithm family behind `git diff`.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [diffutil]
Related concepts: []
Used by (track/): Lesson 20
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### event-stream-classification

Preferred Name: Event Stream Classification
Aliases: Gesture Recognition
Definition: Raw, low-level input events get interpreted into a small set of meaningful, named higher-level events by a layer sitting between the raw signal and application code.
First needed because: Distinguishing a horizontal swipe from a vertical scroll or a simple tap, from the same raw stream of touch coordinates, is exactly this problem.
Category: 00 Programming Fundamentals
Depth required: Working
Required prerequisites: []
Builds toward: [itemtouchhelper-swipe]
Related concepts: []
Used by (track/): Lesson 23
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### json-serialization

Preferred Name: JSON
Aliases: JavaScript Object Notation
Definition: A text-based, language-agnostic serialization format representing structured data as key-value objects and arrays.
First needed because: A server sends text over the network, not Java objects — JSON is the format almost every web API uses to represent that structured data.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: [serialization]
Builds toward: [retrofit-api-interface]
Related concepts: []
Used by (track/): Lesson 28
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### unit-testing

Preferred Name: Unit Testing
Aliases: []
Definition: Automated, executable tests that mechanically check specific behavior still holds, replacing manual re-verification with a permanent, runnable specification.
First needed because: Nothing stops a later change from silently breaking earlier logic (`Item.equals()`) unless someone manually retests it — manual retesting of an entire app before every change doesn't scale.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: [test-pyramid]
Related concepts: []
Used by (track/): Lesson 30
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### pure-function

Preferred Name: Pure Function
Aliases: []
Definition: A function whose output depends only on its inputs, with no side effects — the easiest category of code to test, since a test is just "call it, check the return value."
First needed because: Extracting Lesson 9's validation logic out of an `EditText`-entangled click listener into three plain functions is what makes it testable at all.
Category: 00 Programming Fundamentals
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [unit-testing]
Used by (track/): Lesson 30
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### eager-vs-lazy-evaluation

Preferred Name: Eager vs. Lazy Evaluation
Aliases: []
Definition: Doing all the work upfront regardless of whether it's needed (eager) versus doing only the work a specific moment actually requires (lazy/on-demand).
First needed because: Explains precisely what's wasteful about looping and constructing every row's View upfront instead of only the ones currently visible.
Category: 00 Programming Fundamentals
Depth required: Working
Required prerequisites: []
Builds toward: [view-recycling]
Related concepts: []
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 01 — Java Language

*(Concepts genuinely about Java's own static-type-system design — not
portable ideas wearing a Java costume. Where a concept here has real
cross-language variety, a Syntax-by-language block is included for future
reuse; where a concept is closely tied to Java's own approach to static
typing specifically, that's stated directly instead of forced into a
false universality.)*

### access-level-enforcement

Preferred Name: Access-Level Enforcement
Aliases: Access Modifiers, Visibility Modifiers
Definition: Restricting which code can read or write a class member based on a declared visibility level, checked by the compiler before the program ever runs.
First needed because: Contrasts directly with Python's underscore convention, a social agreement nothing enforces — the first proof Java's compiler catches a whole category of mistake statically.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [class]
Builds toward: [getter-setter-accessor-pattern]
Related concepts: [encapsulation]
Syntax by language: Java — `public`/`private`/`protected`/(no modifier = package-private), four real levels, compiler-checked. Python — `_leading_underscore` convention only, not enforced by the interpreter. C# — `public`/`private`/`protected`/`internal`, compiler-checked, five levels.
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### class-level-state

Preferred Name: Class-Level State
Aliases: Static State
Definition: A field or method that belongs to the class itself, existing exactly once and shared by every instance, rather than belonging to any one object.
First needed because: Explains `public static void main`, present on the first line of every lesson since Lesson 1, never itself explained until this concept exists.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [class, object]
Builds toward: [nested-class-enclosing-instance-reference, singleton-pattern]
Related concepts: []
Syntax by language: Java — `static` on a field/method. Python — a class-body attribute (no keyword), or `@staticmethod`/`@classmethod` for methods. C# — `static`, identical to Java.
Used by (track/): Lesson 0, Lesson 1 (unexplained use), Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### immutability

Preferred Name: Immutability (of a value)
Aliases: []
Definition: A value that, once assigned, is guaranteed by the compiler — not by convention — never to be reassigned again.
First needed because: "I don't currently reassign this" and "this can never be reassigned, checked by the compiler" are different guarantees; the second survives a future edit the first doesn't.
Category: 01 Java Language
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [sealing-a-type-or-method]
Syntax by language: Java — `final` on a local variable or field. JavaScript — `const`. Python — no compiler/interpreter-enforced equivalent at all (convention only, e.g. `ALL_CAPS` naming).
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### sealing-a-type-or-method

Preferred Name: Sealing a Method or Class
Aliases: []
Definition: Marking a method as un-overridable or a class as un-subclassable — a deliberate restriction on future inheritance, distinct from value immutability.
First needed because: Same Java keyword as `immutability` but a genuinely different guarantee (behavior can't be replaced vs. a value can't change) — worth separating so the two meanings aren't conflated.
Category: 01 Java Language
Depth required: Recognition
Required prerequisites: [inheritance, method-overriding]
Builds toward: []
Related concepts: [immutability]
Syntax by language: Java — `final` on a method or class. C# — `sealed` on a class, `sealed override` on a method (a separate keyword from its `readonly`/`const` immutability keywords, unlike Java's reuse of `final` for both meanings).
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### override-checking

Preferred Name: `@Override` Compiler Checking
Aliases: Override Annotation
Definition: A specific, hardcoded compiler check triggered by the `@Override` annotation — verifying a method genuinely overrides something in its parent, turning a typo'd method name into a compile error instead of a silent, unrelated new method.
First needed because: Without it, a near-miss method name (`makeSond` for `makeSound`) compiles silently as dead code nothing ever calls — a real, hard-to-notice bug class.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [annotations, method-overriding]
Builds toward: []
Related concepts: []
Syntax by language: Java — `@Override`, one of the only annotations the compiler itself (not just a tool) enforces. C# — `override` is not optional metadata but a required keyword on the override itself, so this exact failure mode can't occur the same way.
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### annotations

Preferred Name: Annotations
Aliases: []
Definition: Metadata attached to a class, method, or field, read by a compiler, IDE, or library tool — not executed as part of the program's own normal flow.
First needed because: `@Override`, `@NonNull`, `@Entity`, `@Test` all recur constantly; without this concept each looks like an unrelated, unexplained decoration.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [class]
Builds toward: [override-checking, orm-annotation-driven-persistence]
Related concepts: []
Syntax by language: Java — `@Something`, inert by default unless a tool reads it. Python — `@something` decorators look identical but are executable code that runs and can transform the decorated function, a real semantic difference, not just cosmetic. C# — `[Something]` attributes, same inert-unless-read behavior as Java's.
Used by (track/): Lesson 0, Lesson 2, Lesson 6 (`@NonNull`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### nested-class

Preferred Name: Nested Class
Aliases: Inner Class, Outer.Inner Naming
Definition: A class declared entirely inside another class's braces, with no meaningful identity outside it, referred to from outside via a dot-qualified `Outer.Inner` name.
First needed because: Java uses this constantly (`InventoryAdapter.InventoryViewHolder`, Lesson 6) where Python rarely nests classes at all.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [class]
Builds toward: [nested-class-enclosing-instance-reference]
Related concepts: []
Syntax by language: Java — `class Outer { class Inner { } }`, referenced as `Outer.Inner`. Python — nested `class` blocks are legal but idiomatically rare. C# — nested classes, same dot-qualified access.
Used by (track/): Lesson 0, Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### nested-class-enclosing-instance-reference

Preferred Name: Static vs. Non-Static Nested Classes
Aliases: []
Definition: A non-static nested class silently holds a hidden reference to the specific enclosing-class instance that created it, reachable directly inside the nested class; a static nested class carries no such reference and can be constructed independent of any enclosing instance.
First needed because: `InventoryViewHolder` is deliberately a *static* nested class — unreadable as a deliberate choice, rather than an arbitrary keyword, without this concept.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [nested-class, class-level-state]
Builds toward: [android-viewholder]
Related concepts: []
Syntax by language: Java — `outer.new Inner()` is required syntax for a non-static nested class (fails to compile without an enclosing instance); `static class` needs no enclosing instance and uses plain `new`. C# — nested classes have no non-static/static distinction of this kind at all; every nested class behaves like Java's `static` case by default.
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### generics

Preferred Name: Generics
Aliases: Type Parameters
Definition: A type parameter that lets one implementation work correctly with many types while still being checked at compile time.
First needed because: Java's collections are checked statically, unlike Python's `list`, which holds anything with no complaint until something breaks at point of use.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [class, interface-contract]
Builds toward: [list-collection, recyclerview-adapter]
Related concepts: []
Syntax by language: Java — `List<String>`, angle-bracket type parameters, erased at runtime. Python — `list[str]` type hints exist but are pure documentation, never enforced by the interpreter. C# — `List<string>`, enforced like Java's but *not* erased at runtime (a real, cited difference).
Used by (track/): Lesson 0, Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### static-typed-signatures

Preferred Name: Static-Typed Method Signatures
Aliases: []
Definition: A statically-typed language requires every parameter and return value to have a declared type, checked at compile time, including a way to declare "returns nothing."
First needed because: Needed before any real method signature (`onCreate(Bundle savedInstanceState)`) can be read as more than a memorized shape.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [method]
Builds toward: []
Related concepts: []
Syntax by language: Java — every parameter and return type declared, `void` for "returns nothing." Python — no declared types required at all (optional type hints exist, unenforced). C# — declared types required, same as Java, `void` identical.
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### method-overloading

Preferred Name: Method Overloading
Aliases: Overload Resolution
Definition: Several methods or constructors sharing one name, distinguished only by their parameter lists, with the compiler choosing which one runs based on what's actually passed at the call site.
First needed because: Java has no optional/default parameters (unlike Python) — overloading is its real mechanism for "this can reasonably be constructed a couple of different ways."
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [constructor, method]
Builds toward: []
Related concepts: []
Syntax by language: Java — same name, different parameter lists, resolved at compile time from declared argument types. Python — has no overloading at all; a redefined method with the same name simply replaces the earlier one. C# — identical overloading rules to Java.
Used by (track/): Lesson 0, Lesson 8 (`Item(Parcel in)`, `putExtra`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### runtime-type-narrowing

Preferred Name: Runtime Type Narrowing
Aliases: Downcasting, `instanceof`-and-Cast
Definition: Checking a variable's actual runtime type and then explicitly narrowing its declared type to a more specific one, verified rather than assumed.
First needed because: A statically-typed language needs an explicit escape hatch to go from a general declared type back to a specific one — Python's dynamic typing never creates this problem in the first place.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [inheritance]
Builds toward: []
Related concepts: []
Syntax by language: Java — `instanceof` to check, `(Type) value` to cast; a failed cast throws at the cast, not silently. Python — no equivalent needed; duck typing means "the type" is only ever discovered by trying to use it. C# — `is` to check, `(Type)value` or `as` to cast, same shape as Java's.
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### functional-interface

Preferred Name: Functional Interface
Aliases: []
Definition: An interface with exactly one abstract method — the only kind of interface a lambda expression can target.
First needed because: Explains why a Java lambda always has an implicit target type, unlike Python's untyped lambda values.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [interface-contract]
Builds toward: [lambda-expression, anonymous-class]
Related concepts: []
Syntax by language: Java — any interface with exactly one abstract method (`Runnable`, `View.OnClickListener`, etc.). Python/JavaScript — no equivalent concept; a lambda/function value has no interface to target at all.
Used by (track/): Lesson 0, Lesson 8 (`OnItemClickListener`), Lesson 14 (`Runnable`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### lambda-expression

Preferred Name: Lambda Expression
Aliases: []
Definition: Shorthand syntax for constructing an object that implements a single-method (functional) interface, without writing the class out by hand.
First needed because: Already in use since Lesson 4's click listener, unexplained, before this concept exists.
Category: 01 Java Language
Depth required: Mastery
Required prerequisites: [functional-interface]
Builds toward: []
Related concepts: []
Syntax by language: Java — `() -> { ... }`, must target exactly one functional interface, no standalone function type exists. Python — `lambda x: x + 1`, a bare value, no target-interface requirement. JavaScript — arrow functions `(x) => x + 1`, also a bare value. C# — lambda expressions, `x => x + 1`, targets a delegate type (`Action`/`Func`), closer to Java's requirement than Python's.
Used by (track/): Lesson 0, Lesson 8
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### exception-handling

Preferred Name: Structured Exception Handling
Aliases: `try`/`catch`
Definition: Code that might fail is wrapped in a block; a handler runs only if a specific kind of failure happens, and control resumes after it instead of the program crashing.
First needed because: Prevents a single bad input from crashing an entire program.
Category: 01 Java Language
Depth required: Working
Required prerequisites: []
Builds toward: [checked-vs-unchecked-exceptions]
Related concepts: []
Syntax by language: Java — `try { } catch (SpecificException e) { }`. Python — `try: ... except SpecificError:`, structurally identical. JavaScript — `try { } catch (e) { }`, catches everything by default (no typed catch clauses).
Used by (track/): Lesson 0, Lesson 9 (first real project use, on `Integer.parseInt`), Lesson 11 (reused for a single field), Lesson 14 (`InterruptedException` around `Thread.sleep`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### checked-vs-unchecked-exceptions

Preferred Name: Checked vs. Unchecked Exceptions
Aliases: []
Definition: Java distinguishes exceptions the compiler forces a caller to catch or explicitly re-declare (checked) from ones it doesn't force at all (unchecked).
First needed because: A real, compiler-enforced distinction with no Python equivalent — matters the first time a checked exception (`InterruptedException`, Lesson 14) appears.
Category: 01 Java Language
Depth required: Recognition
Required prerequisites: [exception-handling]
Builds toward: []
Related concepts: []
Syntax by language: Java — checked exceptions must be caught or declared with `throws`; unchecked need neither. Python — no such distinction exists; every exception is effectively "unchecked." C# — deliberately has no checked exceptions at all, a considered design choice against Java's model.
Used by (track/): Lesson 0, Lesson 9 (`NumberFormatException` unchecked vs. `FileNotFoundException` checked, contrasted directly)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### primitive-vs-reference-types

Preferred Name: Primitives vs. Reference Types
Aliases: []
Definition: Java splits every type into primitives (raw values, copied by value, never `null`) and objects/reference types (copied by reference, can be `null`).
First needed because: In Python every value is genuinely an object; Java's split is real and has consequences (a `List<int>` cannot exist — generics require an object type).
Category: 01 Java Language
Depth required: Working
Required prerequisites: [class, reference]
Builds toward: []
Related concepts: []
Syntax by language: Java — `int`/`long`/`double`/etc. (primitives, stack-stored) vs. `Integer`/`Long`/`Double`/etc. (their object wrappers). Python — no split at all; every value, including small integers, is a real object. C# — has the identical split (`int` = `System.Int32` value type vs. reference types), called `struct` vs. `class` more generally.
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### reflection-class-object

Preferred Name: `Class` Object (Reflection)
Aliases: []
Definition: A `Class` object is a language's built-in way to refer to a class itself as a value, not an instance of it.
First needed because: Lets code describe *which* class is wanted (e.g. inside an `Intent`) without constructing an instance of it.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [class]
Builds toward: [runtime-vs-compile-time-codegen, static-analysis-reflection-blind-spot]
Related concepts: []
Syntax by language: Java — `InventoryActivity.class`, a `java.lang.Class` instance. Python — every class is already a first-class value; no separate reflection step needed (`InventoryActivity` itself is directly usable as a value). C# — `typeof(InventoryActivity)`.
Used by (track/): Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### anonymous-class

Preferred Name: Anonymous Class
Aliases: []
Definition: An unnamed class defined and instantiated in a single expression, implementing an interface or extending a class inline — used when a lambda can't apply.
First needed because: `Parcelable.Creator` requires two abstract methods, not one, so a lambda (which only ever targets a functional interface) genuinely cannot supply it — an anonymous class is the only fit.
Category: 01 Java Language
Depth required: Working
Required prerequisites: [interface-contract, functional-interface]
Builds toward: []
Related concepts: [lambda-expression]
Syntax by language: Java — `new InterfaceName() { ...method bodies... }`. Python — no direct equivalent; a nested `class` statement is the closest, always named. C# — anonymous types exist but only for data (no methods); a multi-method inline implementation still requires a real named class or a lambda-based delegate per method, not one anonymous object.
Used by (track/): Lesson 8
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 02 — Core OOP

### class

Preferred Name: Class
Aliases: []
Definition: A blueprint describing what fields and methods every object built from it will have — the template objects are constructed from.
First needed because: `track/Lesson 0` explicitly lists "what a class is, in its plain form" as assumed prior knowledge, never taught by `track/` itself at all — a real gap the graph's own validator caught (14 later nodes required `class` before this node existed). A true-beginner reader needs this taught from scratch, not silently assumed.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: []
Builds toward: [access-level-enforcement, class-level-state, annotations, nested-class, generics, primitive-vs-reference-types, reflection-class-object, object, object-creation, constructor, method, inheritance, interface-contract, encapsulation, abstract-class]
Related concepts: []
Syntax by language: Java — `class Name { ... }`. Python — `class Name:`. C# — `class Name { ... }`. C++ — `class Name { ... };`.
Used by (track/): Lesson 0 (assumed, never taught), Lesson 2 (`MainActivity` itself)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### object

Preferred Name: Object
Aliases: Instance
Definition: A concrete, constructed value built from a class's blueprint, with its own independent copy of each instance field.
First needed because: Needed before "class-level state" can be meaningfully contrasted against "each object gets its own."
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class]
Builds toward: [class-level-state, reference, inheritance, current-object-reference, field-lifetime-vs-local-lifetime, serialization]
Related concepts: []
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### object-creation

Preferred Name: Object Creation (Instantiation)
Aliases: Instantiation
Definition: Constructing a new, independent object from a class's blueprint and allocating storage for its own fields.
First needed because: The literal first step behind every `new InventoryActivity()`, `new Item(...)`, and `new Intent(...)` in this course — never itself named as its own concept before now.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class]
Builds toward: [constructor]
Related concepts: [reference]
Syntax by language: Java — `new ClassName(...)`, always heap-allocated, always returns a reference. Python — `ClassName(...)`, no separate keyword; the constructor call itself creates the instance. C# — `new ClassName(...)` for reference types, identical to Java; value types (`struct`) are created without `new` needing heap allocation. C++ — `ClassName x;` allocates on the stack directly; `new ClassName()` allocates on the heap and returns a pointer — a real, consequential choice C++ exposes that Java/C#/Python hide.
Used by (track/): Lesson 0, Lesson 4 (`new Intent(...)`, `new InventoryActivity()` contrasted)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### reference

Preferred Name: Reference
Aliases: []
Definition: A variable holding not the object itself but a pointer to where it actually lives — copying the variable copies the pointer, not the object.
First needed because: Every definition that says "returns a reference" or "copied by reference" is unreadable without this concept existing first — a real gap the graph didn't have until this review.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [object]
Builds toward: [aliasing, identity-vs-equality, primitive-vs-reference-types]
Related concepts: [object-creation]
Syntax by language: Java — every non-primitive variable is a reference; there is no separate "value type" for objects. Python — every variable is a reference (this is why mutating a list passed into a function is visible to the caller). C# — reference types work identically to Java's; `struct` types are the deliberate exception, copied by value. C++ — pointers (`Type*`) and references (`Type&`) are explicit, distinct mechanisms, unlike Java's implicit always-a-reference model.
Used by (track/): Lesson 4 (implicit — `Dog d = new Dog(); Dog e = d;`-style aliasing underlies `Intent`'s `this` argument and object passing generally)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### aliasing

Preferred Name: Aliasing
Aliases: []
Definition: Two or more variables referencing the exact same underlying object, so a change made through one is visible through the other.
First needed because: Without this concept, `Dog d = new Dog(); Dog e = d;` reads as "copying a `Dog`," when it's actually two names for one object — a real, common misconception coming from a language without explicit references.
Category: 02 Core OOP
Depth required: Working
Required prerequisites: [reference]
Builds toward: [identity-vs-equality]
Related concepts: []
Syntax by language: Java — any assignment of a reference-typed variable (`Dog e = d;`) aliases. Python — identical; `e = d` aliases for any mutable object. C# — identical for reference types; `struct` assignment copies instead, a deliberate contrast worth naming when it comes up.
Used by (track/): Lesson 4 (implicit)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### identity-vs-equality

Preferred Name: Identity vs. Equality
Aliases: []
Definition: Whether two references point to the literally same object (identity) versus whether two objects merely have equal contents (equality) — two genuinely different questions.
First needed because: `equals()` (Lesson 7) is unreadable without first separating "are these the same object" from "do these represent the same value."
Category: 02 Core OOP
Depth required: Working
Required prerequisites: [reference, aliasing]
Builds toward: [equals-hashcode-contract, diffutil]
Related concepts: []
Syntax by language: Java — `==` checks identity for objects (reference equality); `.equals()` checks whatever equality the class defines. Python — `is` checks identity; `==` calls `__eq__`, closer to Java's `.equals()` by default. C# — `==` is overloadable and often means value equality by convention (surprising coming from Java); `ReferenceEquals()` checks true identity.
Used by (track/): Lesson 0 (`instanceof`/cast context), Lesson 7 (full `equals()` treatment), Lesson 20 (`areItemsTheSame` vs. `areContentsTheSame`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### equals-hashcode-contract

Preferred Name: `equals`/`hashCode` Contract
Aliases: []
Definition: Two objects considered equal via `.equals()` must also return the same `hashCode()` — a contract hash-based collections rely on to locate objects efficiently.
First needed because: Overriding `equals()` alone compiles fine but silently breaks `HashSet`/`HashMap` lookups later — a distinct, separate fact from identity-vs-equality itself, with its own failure mode.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [identity-vs-equality]
Builds toward: []
Related concepts: []
Syntax by language: Java — `equals(Object)` and `hashCode()`, both inherited from `Object`, overridden together by convention (never one without the other). Python — `__eq__` and `__hash__`, the same paired-override convention; defining `__eq__` alone makes an object unhashable by default (a deliberate safety choice, contrast with Java's silent breakage). C# — `Equals()` and `GetHashCode()`, identical contract to Java's.
Used by (track/): Lesson 7
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### getter-setter-accessor-pattern

Preferred Name: Getter/Setter Accessor Pattern
Aliases: Accessor Methods
Definition: A public method whose only job is reading (getter) or writing (setter) a private field, making the field's access path a deliberate, controllable chokepoint instead of direct exposure.
First needed because: The concrete mechanism that makes `encapsulation` real rather than abstract — a class's public surface, not its private fields, is what callers actually depend on.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [encapsulation, access-level-enforcement]
Builds toward: []
Related concepts: []
Syntax by language: Java — explicit `getName()`/`setName(...)` methods, no language support for anything shorter. Python — `@property`/`@x.setter` decorators let a method be *called* like a plain attribute. C# — auto-properties (`public string Name { get; set; }`) collapse the whole pattern into one declaration when no extra logic is needed.
Used by (track/): Lesson 7
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### constructor

Preferred Name: Constructor
Aliases: []
Definition: A special method that runs exactly once, automatically, during object creation, used to set up an object's initial state.
First needed because: Every real class in this course (starting with `Item`, Lesson 7) needs one; assumed but never taught from scratch by `track/` itself.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class, object-creation]
Builds toward: [method-overloading, current-object-reference, parcelable]
Related concepts: []
Syntax by language: Java — a method named exactly after its class, no return type at all (not even `void`). Python — `__init__`, always exactly one per class (no overloading). C# — a method named after its class, same shape as Java's, does support overloading.
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### method

Preferred Name: Method
Aliases: []
Definition: A function attached to a class, callable on an object of that class.
First needed because: The unit every later concept in this category (overriding, dynamic dispatch) is defined in terms of — deliberately kept this small; it earns no more weight than "a function that happens to live on a class."
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class]
Builds toward: [static-typed-signatures, method-overloading, method-overriding, interface-contract, field-lifetime-vs-local-lifetime]
Related concepts: []
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### inheritance

Preferred Name: Inheritance
Aliases: []
Definition: A child type that extends a parent type, receiving the parent's fields and methods and able to add or replace its own.
First needed because: The single most load-bearing concept in this whole curriculum — `MainActivity extends AppCompatActivity` (Lesson 2) is unreadable without it.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class, object]
Builds toward: [sealing-a-type-or-method, parent-implementation-access, method-overriding, template-method-pattern, activity, runtime-type-narrowing, dynamic-dispatch, sqlite-open-helper]
Related concepts: []
Syntax by language: Java — `class Dog extends Animal`. Python — `class Dog(Animal):`. C# — `class Dog : Animal`. C++ — `class Dog : public Animal`.
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### method-overriding

Preferred Name: Method Overriding
Aliases: []
Definition: A subclass supplying its own version of a method its parent already defines, replacing the parent's behavior for objects of the subclass's type.
First needed because: The mechanism behind every framework callback in this course (`onCreate`, `onBindViewHolder`, etc.).
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [inheritance, method]
Builds toward: [sealing-a-type-or-method, override-checking, dynamic-dispatch, parent-implementation-access, template-method-pattern, inversion-of-control]
Related concepts: []
Syntax by language: Java — same method signature redeclared in the subclass, optionally marked `@Override`. Python — same method name redefined; no marker exists at all. C# — requires the parent method be marked `virtual` and the child use `override` explicitly, a real, stricter contrast with Java's implicit overriding.
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### dynamic-dispatch

Preferred Name: Dynamic Dispatch
Aliases: Polymorphism, Runtime Polymorphism
Definition: A method call resolves to the actual runtime type of the object it's called on, regardless of the type the holding variable was declared as.
First needed because: Explains why `Animal dog = new Dog(); dog.makeSound();` runs `Dog`'s version, not `Animal`'s — and why a framework calling one method name gets each subclass's own behavior.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [inheritance, method-overriding]
Builds toward: [inversion-of-control]
Related concepts: []
Syntax by language: Java — always dynamic for instance methods, no opt-out. Python — always dynamic (every method lookup is dynamic by nature). C# — dynamic only for `virtual`/`override` methods; non-`virtual` methods are statically dispatched, a real, consequential difference from Java's default.
Used by (track/): Lesson 0, Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### interface-contract

Preferred Name: Interface
Aliases: Contract, Protocol
Definition: A declared set of method signatures with no implementation body — a promise about what a type can do, without saying how, that any class can commit to fulfilling.
First needed because: Lets unrelated classes (`Bird`, `Airplane`) be treated uniformly by what they can do, without sharing any real code or a common meaningful parent.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class, method]
Builds toward: [generics, program-to-an-interface, list-collection, functional-interface, anonymous-class, strategy-pattern, parcelable, abstract-class, room-dao, retrofit-api-interface, interface-segregation-tension, dependency-injection]
Related concepts: [program-to-an-interface]
Syntax by language: Java — `interface Flyer { void fly(); }`, `implements`, a class can implement several. Python — no true equivalent; duck typing gets something similar informally, `abc.ABC` abstract base classes are the closer, less-common equivalent. C# — `interface IFlyer { void Fly(); }`, `:` for implementing, same multiple-implementation rule as Java.
Used by (track/): Lesson 0, Lesson 8 (`OnItemClickListener`, `Parcelable`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### encapsulation

Preferred Name: Encapsulation
Aliases: []
Definition: Controlling which parts of a system are allowed to depend on which other parts, by restricting direct access to a class's own internals.
First needed because: The general OOP principle `access-level-enforcement` (Java's specific mechanism) actually implements.
Category: 02 Core OOP
Depth required: Working
Required prerequisites: [class]
Builds toward: [getter-setter-accessor-pattern, read-only-interface-exposure]
Related concepts: [access-level-enforcement]
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### current-object-reference

Preferred Name: Current Object Reference
Aliases: []
Definition: An implicit reference, available inside any instance method or constructor, to the object currently being operated on.
First needed because: Needed the moment a constructor parameter shares a name with the field it initializes, a real and easy mistake to get wrong without it.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [constructor, object]
Builds toward: []
Related concepts: [reference]
Syntax by language: Java — `this`, never declared as a parameter, implicit in every instance method/constructor. Python — `self`, the opposite: always explicit, must be declared as the method's first parameter by convention (not a keyword). C# — `this`, implicit like Java's. C++ — `this`, implicit, but a genuine pointer (`this->field`), not just a reference.
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### abstract-class

Preferred Name: Abstract Class
Aliases: []
Definition: A class that can have real, implemented methods and fields while also declaring some methods with no body at all, left for a subclass to supply — a middle ground between a fully-implemented class and an interface's zero implementation.
First needed because: `AppDatabase extends RoomDatabase` needs to hold real, hand-written logic (`getInstance`) alongside a method Room itself supplies an implementation for (`itemDao()`) — neither a plain class nor a plain interface expresses that mix.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [class, interface-contract]
Builds toward: [room-database]
Related concepts: []
Syntax by language: Java — `abstract class Name { abstract void method(); void other() { ... } }`. Python — `abc.ABC` with `@abstractmethod`, opt-in rather than a dedicated keyword. C# — `abstract class`, identical shape to Java's.
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### parent-implementation-access

Preferred Name: Parent Implementation Access
Aliases: []
Definition: Inside a subclass, an explicit way to call its immediate parent's own version of a method or constructor, rather than only replacing it via overriding.
First needed because: Needed the moment a subclass wants its parent's behavior to still run, not just be overridden away — e.g. every Activity's `onCreate` calling `super.onCreate(...)` before doing its own work.
Category: 02 Core OOP
Depth required: Mastery
Required prerequisites: [inheritance, method-overriding]
Builds toward: []
Related concepts: []
Syntax by language: Java — `super.method()` or `super(...)` for a parent constructor. Python — `super().method()`. C# — `base.Method()`. C++ — `ParentClass::method()`, qualified by the parent's actual name rather than a keyword.
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 03 — Java Standard Library

### list-collection

Preferred Name: `List` / `ArrayList`
Aliases: []
Definition: An interface describing an ordered, resizable sequence of elements, with one concrete implementation backed by a real growable array.
First needed because: Used constantly from Lesson 6 onward (`List<Item>`); a concrete, load-bearing example of both generics and programming-to-an-interface at once.
Category: 03 Java Standard Library
Depth required: Mastery
Required prerequisites: [generics, interface-contract]
Builds toward: []
Related concepts: []
Syntax by language: Java — `List<Item>` (interface) / `ArrayList<Item>` (concrete class). Python — `list` is both the interface and the only real implementation; no separate abstraction exists. C# — `IList<Item>` (interface) / `List<Item>` (concrete class), same split as Java's.
Used by (track/): Lesson 0
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### executor-service

Preferred Name: `ExecutorService`
Aliases: Thread Pool
Definition: A standard-library abstraction managing a pool of reusable background threads, submitting tasks to run on them instead of creating and destroying a raw `Thread` per task.
First needed because: Real database work happens repeatedly (every launch's load, every item added) — spinning up and discarding a brand-new `Thread` each time wastes real, measurable OS setup cost.
Category: 03 Java Standard Library
Depth required: Mastery
Required prerequisites: [thread, object-pool-pattern]
Builds toward: [post-to-main-thread, list-adapter, workmanager, idling-resource-sync-signaling]
Related concepts: []
Syntax by language: Java — `Executors.newSingleThreadExecutor()`/`newFixedThreadPool(n)`, `.execute(Runnable)`. Python — `concurrent.futures.ThreadPoolExecutor`, same pooling idea. C# — `Task.Run(...)` backed by the thread pool automatically, less manual pool selection than Java's explicit `Executors` factory.
Used by (track/): Lesson 13, Lesson 14 (full treatment)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 04 — General Software Engineering

### namespace

Preferred Name: Namespace / Addressing Scheme
Aliases: []
Definition: Giving every unit in a large system a globally unique, hierarchical name, so two unrelated pieces of code can each define something with the same short name without colliding.
First needed because: The general idea Java's package system, DNS domain names, and file-system paths are all specific instances of.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Syntax by language: Java — `package com.example.pocketinventory;` at the top of every file, a compiler-checked claim that the compiled class lives at a matching folder path (`com/example/pocketinventory/`) — not cosmetic, enforced by the compiler and by Android Studio's build. Python — `import` paths mirror folder structure by convention, but nothing enforces it the way Java's package/folder contract does. C# — `namespace Foo.Bar { }`, groups code logically but has no compiler-enforced link to physical folder layout at all, a real, consequential difference from Java's model.
Used by (track/): Lesson 1
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### program-to-an-interface

Preferred Name: Program to an Interface, Not an Implementation
Aliases: []
Definition: Code should depend on what something can do, never on how it does it or what concrete type it actually is.
First needed because: The reason Java allows a class to `implements` several interfaces but `extends` only one — many honest "can-do" promises, one true "is-a" relationship.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: [interface-contract]
Builds toward: [repository-pattern]
Related concepts: []
Used by (track/): Lesson 0, Lesson 17
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### constraint-satisfaction-layout

Preferred Name: Constraint Satisfaction (Layout)
Aliases: []
Definition: A system where you declare relationships that must hold between elements, and a solver — not you — computes concrete positions/sizes that satisfy all of them simultaneously.
First needed because: Explains why Android layouts describe relationships ("my bottom edge aligns with my parent's bottom edge") instead of x/y coordinates, and why the same layout survives any screen size.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [view-tree]
Used by (track/): Lesson 3
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### message-passing-through-a-broker

Preferred Name: Message Passing Through a Broker
Aliases: []
Definition: Two components communicate by each going through a separate, central dispatcher, describing what they want as data, rather than holding a direct reference to each other and calling one another's methods.
First needed because: The general shape behind Android's `Intent` system, actor-model concurrency, pub/sub queues, and HTTP routing to a named endpoint.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: [intent]
Related concepts: []
Used by (track/): Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### capability-scoping

Preferred Name: Capability Scoping
Aliases: []
Definition: Explicitly declaring what a component is and isn't allowed to be used for, rather than leaving everything globally reachable by default.
First needed because: The reasoning behind `android:exported="false"` and an Activity Manifest entry with no launcher `intent-filter`.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [access-level-enforcement, android-manifest]
Used by (track/): Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### checkpointing

Preferred Name: Checkpointing
Aliases: []
Definition: Saving just enough state before a destructive event to reconstruct correctness afterward, without persisting everything.
First needed because: The general idea behind `onSaveInstanceState` — small, transient state rescued before an Activity is torn down for a configuration change.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: [instance-state-checkpointing]
Related concepts: []
Used by (track/): Lesson 5
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### template-instance-separation

Preferred Name: Template/Instance Separation
Aliases: []
Definition: One small structural description gets instantiated many times against different data, rather than each occurrence being separately authored.
First needed because: Explains why a Recycler-based list needs a *row* layout file separate from the *screen* layout file — one template, many rendered rows.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [view-recycling]
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### ui-hint-vs-enforced-validation

Preferred Name: UI Hint vs. Enforced Validation
Aliases: Client-Side vs. Server-Side Validation
Definition: A UI-level hint about expected input (e.g. a keyboard layout matching `inputType="number"`) is for convenience and can always be bypassed; only a check that actually runs in your own code is a real guarantee.
First needed because: `inputType="number"` shows a numeric keyboard but does not stop a pasted or physically-typed non-numeric character from reaching the field — the whole point of this lesson.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [fail-fast-validation, boundary-validation]
Used by (track/): Lesson 9
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### fail-fast-validation

Preferred Name: Fail-Fast Validation
Aliases: []
Definition: Stopping immediately at the first detected invalid state rather than propagating bad data further into a system.
First needed because: An empty name, a non-numeric quantity, or a negative quantity all need to be rejected before `new Item(...)` is ever reached — checking everything and reporting only the last problem, or continuing with bad data, both let invalid state leak further.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [boundary-validation]
Used by (track/): Lesson 9
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### boundary-validation

Preferred Name: Boundary Validation
Aliases: []
Definition: Validating data specifically at the point where it crosses from an untrusted source (like user input) into the rest of a program, rather than trusting it further downstream.
First needed because: Bad data doesn't stay contained — left unchecked here, it would flow into an `Item`, then the list, then (starting Lesson 13) permanent storage, getting harder to trace back to its source the further it travels.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [sql-injection]
Related concepts: [fail-fast-validation, make-illegal-states-unrepresentable]
Used by (track/): Lesson 9
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### asynchronous-callback-result

Preferred Name: Asynchronous Callback Result
Aliases: []
Definition: A value that can't be returned synchronously — because producing it requires waiting on something external, like user interaction — is instead delivered later by invoking a registered callback.
First needed because: `startActivity` has no return channel at all; getting an answer back from a screen the user might sit on for minutes needs a fundamentally different shape than a normal method call's `return`.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [callback]
Builds toward: []
Related concepts: [field-lifetime-vs-local-lifetime]
Used by (track/): Lesson 10
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### incremental-update-notification

Preferred Name: Incremental Update Notification
Aliases: Minimal-Diff Update
Definition: Communicating precisely what changed (e.g. one inserted row) to an observer, rather than telling it to assume everything changed and recompute from scratch.
First needed because: `notifyItemInserted` lets `RecyclerView` animate and redraw exactly one row instead of the wasteful full-list redraw `notifyDataSetChanged()` would trigger for the same single addition.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [recyclerview-adapter]
Used by (track/): Lesson 10, Lesson 11 (contrast case — full refresh is the correct choice, not the wasteful one)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### orm-annotation-driven-persistence

Preferred Name: Annotation-Driven ORM
Aliases: Object-Relational Mapping
Definition: Annotating a plain class to describe a database table and its columns, then having a separate build-time tool generate the actual SQL-calling code from those annotations instead of hand-writing it.
First needed because: Room's whole value proposition — the table definition and the Java type it represents can no longer drift apart the way a hand-written `CREATE TABLE` string easily could.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [annotations, relational-database-model]
Builds toward: [room-entity]
Related concepts: [generated-r-class]
Syntax by language: Java/Android — Room's `@Entity`/`@Dao`/`@Database`. Broader ecosystem — JPA/Hibernate `@Entity` in Java, Django's ORM model classes, Protocol Buffer `.proto` schemas generating serialization code — the same "describe intent, let a build tool produce the mechanical implementation" shape recurring across ecosystems.
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### refresh-on-resume-pattern

Preferred Name: Refresh on Resume
Aliases: []
Definition: Re-reading potentially-changed state every time a screen becomes active again, rather than trusting a value read once at an earlier point is still current.
First needed because: The low-stock threshold can change on the Settings screen and back on the list without the list Activity being recreated — `onResume`, not `onCreate`, is the only point that reliably fires on that specific return.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [activity-lifecycle]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 11
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### manual-resource-cleanup

Preferred Name: Manual Resource Cleanup
Aliases: []
Definition: Some objects hold real OS resources (file handles, locks, connections) that must be explicitly released rather than left to garbage collection, unlike ordinary in-memory objects.
First needed because: A `Cursor` and a `SQLiteDatabase` left open without `.close()` is a real resource leak, not just wasted memory a garbage collector will eventually reclaim.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### sql-injection

Preferred Name: SQL Injection
Aliases: []
Definition: A security vulnerability where untrusted input is concatenated directly into a SQL query string, letting an attacker alter the query's actual meaning.
First needed because: Named explicitly as one of the most common real-world security vulnerabilities in software history, and a direct consequence of the exact string-built-query shape this lesson's raw API uses.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [sql-query-language, boundary-validation]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### lifecycle-scoped-cache

Preferred Name: Lifecycle-Scoped Cache
Aliases: []
Definition: An object's own lifecycle deliberately separated from the lifecycle of whatever currently references or requests it — the data outlives any one particular holder.
First needed because: `ViewModel`'s framework-managed retention across Activity recreation is this exact idea, conceptually adjacent to Singleton (Lesson 13) but scoped to one logical screen instead of the whole app.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [android-viewmodel]
Related concepts: [singleton-pattern]
Used by (track/): Lesson 15
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### read-only-interface-exposure

Preferred Name: Read-Only Interface Exposure
Aliases: []
Definition: Exposing a narrower, read-only-facing type from a method while the backing field stays the more capable mutable type internally — a compile-time-enforced guarantee that external code can't mutate what it only needs to observe.
First needed because: `getItems()` returns `LiveData`, not the actual `MutableLiveData` field it wraps, so nothing outside `InventoryViewModel` can call `.setValue()`/`.postValue()` on it — direct groundwork for Lesson 17's Repository pattern.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [encapsulation]
Builds toward: []
Related concepts: [program-to-an-interface]
Used by (track/): Lesson 16
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### layered-architecture

Preferred Name: Layered Architecture
Aliases: []
Definition: Each layer only ever calls downward to the layer directly below it, never sideways or back up, and no layer skips one to reach directly into a lower one.
First needed because: Activity depends on ViewModel, ViewModel depends on Repository, Repository depends on Dao — the Activity has never once imported `ItemDao` or `AppDatabase` directly, in this entire project.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [repository-pattern]
Used by (track/): Lesson 17
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### delegation

Preferred Name: Delegation
Aliases: []
Definition: A method's entire body forwards the call to another object that does the real work, rather than implementing the logic itself.
First needed because: `InventoryViewModel`'s methods, after Lesson 17's refactor, are each exactly one line calling the matching method on `ItemRepository` — the class does none of the real work itself anymore.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [repository-pattern]
Used by (track/): Lesson 17
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### open-closed-principle

Preferred Name: Open/Closed Principle
Aliases: []
Definition: Add new capability by extending or composing, without modifying existing, working, unrelated code.
First needed because: Introducing `ItemRepository` now means Lesson 28's future network-sync feature only ever touches the Repository, never `InventoryViewModel` or `InventoryActivity` again.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [repository-pattern]
Used by (track/): Lesson 17
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### two-phase-construction-initialization

Preferred Name: Two-Phase Construction/Initialization
Aliases: []
Definition: Separating "produce the object" from "the object now exists, safe to configure" into two distinct steps or methods, because the moment a thing is fully constructed isn't always the moment it's safe to configure.
First needed because: `Fragment.onCreateView`'s only job is producing and returning a `View`; `onViewCreated` runs immediately after, guaranteed the view now actually exists and is safe to call `findViewById` on — the same split `RecyclerView.Adapter`'s `onCreateViewHolder`/`onBindViewHolder` (Lesson 6) already exhibited, retroactively.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [recyclerview-adapter]
Used by (track/): Lesson 18
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### single-source-of-truth

Preferred Name: Single Source of Truth
Aliases: []
Definition: One place declares a piece of information and everything else reflects it, rather than each consumer maintaining and manually syncing its own copy.
First needed because: The Toolbar's title and Back behavior come entirely from the nav graph's declarations — the same underlying idea Lesson 7's `Item` fix and Lesson 17's Repository already applied to different kinds of drift.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [state-hoisting]
Related concepts: [make-illegal-states-unrepresentable, repository-pattern]
Used by (track/): Lesson 21
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### command-dispatch-table

Preferred Name: Command Dispatch Table
Aliases: []
Definition: A fixed set of named actions, matched by an identifier and routed to their handler.
First needed because: The exact same shape as Lesson 4's `RequestDemo` `if ("OPEN_SCREEN".equals(action))` lab, now recognized in a menu system's `getItemId()` comparisons — one idea, two distant lessons.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 21
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### projection-over-dataset

Preferred Name: Projection Over a Dataset
Aliases: []
Definition: Filtering or transforming a full in-memory collection down to a computed subset for display, without touching or mutating the underlying data source.
First needed because: Live search filtering reads the `ViewModel`'s current value and computes a display-only subset — the underlying data never changes because of a search.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: [relational-database-model]
Used by (track/): Lesson 21
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### destructive-action-confirmation

Preferred Name: Destructive Action Confirmation
Aliases: []
Definition: A destructive, hard-to-reverse action is deliberately made harder to trigger accidentally than a normal, safe action, by structuring code so the dangerous call is syntactically reachable only from inside an explicit confirmation step.
First needed because: Deletion is the first genuinely destructive action this app performs — it deserves different treatment than a normal button tap because the cost of a mistake is categorically different.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [modal-dialog-confirmation]
Used by (track/): Lesson 22
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### compensating-action-pattern

Preferred Name: Compensating Action
Aliases: Undo Instead of Prevention
Definition: Rather than blocking an operation before it happens, let it happen and provide a reliable way to reverse its effect afterward.
First needed because: A list-row swipe is a deliberate, specific gesture where immediate feedback feels right and a brief undo window costs far less friction than a confirmation dialog on every swipe.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [destructive-action-confirmation]
Used by (track/): Lesson 23
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### capability-policy-separation

Preferred Name: Capability/Policy Separation
Aliases: []
Definition: A capability has no built-in opinion about when or how safely it's invoked — every safety decision lives entirely in the caller, not the capability itself.
First needed because: This project now has two different entry points to the exact same `deleteItem` method — one gated behind a confirmation dialog, one triggered directly by a swipe — each choosing a different safety strategy for the same underlying operation.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [destructive-action-confirmation, compensating-action-pattern]
Used by (track/): Lesson 23
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### least-privilege-explicit-consent

Preferred Name: Least Privilege + Explicit Consent
Aliases: []
Definition: A capability that could genuinely harm privacy or safety requires an affirmative grant from the party actually at risk, not just a declaration from the requesting party.
First needed because: A Manifest declaration alone only means an app *might* ask for camera access — the user must be asked explicitly, and can say no, unlike every capability this app has used so far.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [runtime-permission-model]
Related concepts: []
Used by (track/): Lesson 24
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### query-before-command

Preferred Name: Query Before Command
Aliases: []
Definition: Checking current state is kept as a separate operation from requesting a state change — you can always ask "is this true right now" without triggering a side effect.
First needed because: `ContextCompat.checkSelfPermission` (read) is deliberately separate from actually requesting a permission (write) — the exact same read/write split `SharedPreferences.getInt`/`Editor.putInt` already drew.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 24
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### static-vs-dynamic-registration

Preferred Name: Static vs. Dynamic Registration
Aliases: []
Definition: Registering interest in an event either declaratively, ahead of time (surviving across restarts but restricted to an exempted set), or in code at runtime (tied to a component's actual running lifetime, unrestricted but requiring something already alive to register it).
First needed because: A Manifest-declared receiver for connectivity changes never fires on modern Android — only `BOOT_COMPLETED` and a short exempted list still work that way; everything else needs runtime registration.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [broadcast-receiver]
Related concepts: []
Used by (track/): Lesson 27
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### runtime-vs-compile-time-codegen

Preferred Name: Runtime vs. Compile-Time Code Generation
Aliases: []
Definition: Code generation can happen at compile/build time (producing an inspectable generated file) or at runtime via reflection (producing a working implementation live, with no separate generated source to inspect) — genuinely different mechanisms with different tradeoffs.
First needed because: Retrofit's `.create(CatalogApi.class)` generates a real implementation live, when the app runs, unlike Room's compile-time annotation processing or Safe Args' build-time plugin.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [reflection-class-object]
Builds toward: []
Related concepts: [orm-annotation-driven-persistence, safe-args-codegen, retrofit-api-interface]
Used by (track/): Lesson 28
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### interface-segregation-tension

Preferred Name: Interface Segregation Tension
Aliases: []
Definition: A base contract assumes full capability, but a specific implementation may only legitimately support part of it — failing loudly and immediately for the unsupported part is safer than silently doing nothing.
First needed because: `InventoryContentProvider` implements three of six required methods purely to throw, rather than silently no-op — a deliberate, defensible design choice worth naming, not an unexplained gap.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [interface-contract]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 29
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### test-double-mocking

Preferred Name: Test Double / Mocking
Aliases: []
Definition: Substituting a fake, controlled implementation of a dependency in place of the real one during a test — a mock additionally records how it was called, enabling verification.
First needed because: `ItemRepository`'s real constructor requires a real `Application` and a real Room database just to exist — a mock `ItemDao` tests its logic without either.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [dependency-injection]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 30
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### testability-as-design-signal

Preferred Name: Testability as a Design Signal
Aliases: []
Definition: The friction of trying to write a test for a piece of code is frequently the earliest, cheapest signal that a design is entangling multiple responsibilities, well before that entanglement causes a harder problem later.
First needed because: Trying to write a test for Lesson 9's original inline validation is what revealed it wasn't separable from Android at all — the refactor wasn't optional cleanup, it was the only way to make the logic checkable.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [pure-function, dependency-injection, single-responsibility-principle]
Used by (track/): Lesson 30
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### test-pyramid

Preferred Name: Test Pyramid
Aliases: []
Definition: Many fast, cheap unit tests forming a broad base, fewer slower, more realistic integration/UI tests forming a smaller layer above — each layer catching a different class of bug, at a different cost.
First needed because: Plain-JVM unit tests (Lesson 30) run in milliseconds but can't prove a real screen wires everything together; instrumented tests can, but take seconds per run.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [unit-testing]
Builds toward: [instrumented-ui-testing]
Related concepts: []
Used by (track/): Lesson 31
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### declarative-ui

Preferred Name: Declarative UI
Aliases: []
Definition: Describing UI as what it should currently look like, re-invoked automatically on state change, rather than describing initial structure and then imperatively mutating pieces of it over time.
First needed because: XML layouts (Lesson 3) are declarative *structure*, but every update to them since (`setText`, `notifyDataSetChanged`) has been imperative Java glue code — Compose makes updates declarative too.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [jetpack-compose]
Related concepts: [constraint-satisfaction-layout]
Used by (track/): Lesson 32
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### state-hoisting

Preferred Name: State Hoisting
Aliases: Unidirectional Data Flow
Definition: A stateful widget doesn't own its own value — it receives a value from above and reports changes upward via a callback, with the actual source of truth living one level higher.
First needed because: A Compose `TextField` is stateless on its own, unlike `EditText`, which always owned its text internally — letting other logic (validation, a reset) read or drive the value from outside requires the source of truth to live above the widget.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [single-source-of-truth]
Builds toward: []
Related concepts: [live-data]
Used by (track/): Lesson 32
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### feature-detection-vs-config-detection

Preferred Name: Feature Detection vs. Configuration Detection
Aliases: []
Definition: Checking whether a capability or result actually exists and branching accordingly, rather than checking a device/configuration threshold number directly — more robust since it depends only on what's actually present, not on correctly guessing every configuration that might produce it.
First needed because: Checking whether `detailContainer` exists via `findViewById` (rather than querying screen width directly in Java) means the layout resource stays the single source of truth for which configurations get a two-pane layout.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [single-source-of-truth]
Used by (track/): Lesson 33
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### build-variant-environment-profile

Preferred Name: Build Variant / Environment Profile
Aliases: []
Definition: Maintaining separate configurations (e.g. debug vs. release, development vs. production) compiled or run from one shared codebase, each suited to a different purpose.
First needed because: Every run of this app since Lesson 1 has used a debug build — a genuinely different configuration from what should ever reach a real user.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: [build-variants]
Related concepts: []
Used by (track/): Lesson 34
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### static-analysis-reflection-blind-spot

Preferred Name: Static Analysis vs. Runtime Reflection Blind Spot
Aliases: []
Definition: A tool that analyzes code by reading its structure (a shrinker, linter, type checker) can only reason about calls it can actually see — a call made indirectly, by looking up a name as a string at runtime, is invisible to that analysis by construction.
First needed because: R8's default shrinking can strip or rename `Item`'s fields, which Room and Gson only ever reference indirectly, by reflection, never through a visible method call R8's analysis could see.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [reflection-class-object]
Builds toward: []
Related concepts: [orm-annotation-driven-persistence, retrofit-api-interface, runtime-vs-compile-time-codegen]
Used by (track/): Lesson 34
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### make-illegal-states-unrepresentable

Preferred Name: Make Illegal States Unrepresentable
Aliases: []
Definition: Designing a type so an invalid combination of data (e.g. a name with no matching quantity) cannot even be constructed, rather than merely being unlikely.
First needed because: The direct lesson of the parallel-lists bug — three synchronized lists let a name and its score drift apart with no error at all; one bundled object makes that drift impossible to represent.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: [encapsulation]
Used by (track/): Lesson 7
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### single-responsibility-principle

Preferred Name: Single Responsibility Principle
Aliases: SRP
Definition: A class should have one clearly-scoped job — one reason to change — rather than accumulating unrelated responsibilities.
First needed because: The direct reason `InventoryAdapter` reports taps through a listener interface instead of calling `startActivity` itself — adding navigation logic to a data-binding class would give it a second, unrelated reason to change.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 8
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### serialization

Preferred Name: Serialization
Aliases: []
Definition: Converting an in-memory object into a linear sequence of bytes or characters that can cross a boundary the original object reference can't, plus the matching deserialization step to rebuild it on the other side.
First needed because: An `Item` object can't just be handed across the OS-mediated `Intent` boundary the way a plain method argument would be passed — it has to be converted to a transportable form first.
Category: 04 General Software Engineering
Depth required: Mastery
Required prerequisites: [object]
Builds toward: [parcelable, json-serialization]
Related concepts: []
Syntax by language: Java/Android — `Parcelable` (hand-written, fast, no reflection) or `Serializable` (automatic via reflection, slower). Python — `pickle` for arbitrary objects, or explicit `to_dict()`/`from_dict()` conventions. Universal beyond any one language — also JSON/XML request-body serialization, and any ORM's row-to-object mapping.
Used by (track/): Lesson 8
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### cache-expensive-lookup-on-first-use

Preferred Name: Cache an Expensive Lookup on First Use
Aliases: []
Definition: Doing an expensive computation or lookup exactly once, storing the result, and reusing the cached result on every subsequent need rather than repeating the work.
First needed because: The entire reason `ViewHolder` exists — `findViewById`'s tree walk is cached once per holder instead of repeated on every scroll frame.
Category: 04 General Software Engineering
Depth required: Working
Required prerequisites: []
Builds toward: [android-viewholder]
Related concepts: []
Used by (track/): Lesson 6, Lesson 15 (memoization at the lifecycle level)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 05 — Design Patterns

*(Categorized by what a pattern structurally IS, never by which capstone
lesson happens to trigger the first real example of it — a general
Software Engineering vocabulary the reader should have before any
particular framework applies it.)*

### strategy-pattern

Preferred Name: Strategy Pattern
Aliases: []
Definition: An algorithm or behavior is extracted into a separate, swappable object or interface, rather than baked directly into the class that uses it.
First needed because: `RecyclerView`'s `Adapter` (data → views) and `LayoutManager` (arrangement) are deliberately two independent, swappable collaborators — not one class doing both jobs.
Category: 05 Design Patterns
Depth required: Working
Required prerequisites: [interface-contract]
Builds toward: [recyclerview-layoutmanager, workmanager]
Related concepts: []
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### observer-pattern

Preferred Name: Observer Pattern
Aliases: []
Definition: Registering a piece of code (a listener/callback) ahead of time with a source of events, so it gets called later whenever the relevant event actually occurs, rather than being called immediately.
First needed because: The exact shape of `setOnClickListener` — composition plus a registered callback for one specific event — structurally different from Template Method's inheritance-plus-fixed-lifecycle-slot, even though both are Inversion of Control.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: [callback]
Builds toward: [live-data, lifecycle-aware-observation]
Related concepts: [template-method-pattern]
Used by (track/): Lesson 4, Lesson 8, Lesson 16 (full treatment — hand-built `ObservableValue` lab)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### singleton-pattern

Preferred Name: Singleton Pattern
Aliases: []
Definition: Exactly one instance of a class exists for the whole application's lifetime, created lazily the first time it's needed and reused on every subsequent request.
First needed because: `AppDatabase.getInstance(...)` builds the real Room database exactly once and hands back the same object every time after.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: [class-level-state]
Builds toward: [room-database]
Related concepts: []
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### builder-pattern

Preferred Name: Builder Pattern
Aliases: []
Definition: Constructing a complex object step by step through a chain of configuration calls, finalized by one explicit method that returns the real, usable object.
First needed because: `Room.databaseBuilder(...).build()` is the first appearance of a shape that recurs across other Android APIs going forward.
Category: 05 Design Patterns
Depth required: Working
Required prerequisites: []
Builds toward: [room-database, modal-dialog-confirmation]
Related concepts: []
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### object-pool-pattern

Preferred Name: Object Pool Pattern
Aliases: []
Definition: Expensive-to-create resources kept alive and reused across many requests for work, instead of created and destroyed per request.
First needed because: Names directly why `ExecutorService` reuses a small set of already-created threads instead of spinning up a brand-new `Thread` for every database operation.
Category: 05 Design Patterns
Depth required: Working
Required prerequisites: []
Builds toward: [executor-service]
Related concepts: []
Used by (track/): Lesson 14
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### dependency-injection

Preferred Name: Dependency Injection
Aliases: DI
Definition: A class accepts its dependencies as constructor parameters instead of constructing them internally — something external decides what real or fake implementation to hand it.
First needed because: `ItemRepository`'s original constructor built its own `ItemDao` internally, making it impossible to substitute a fake one for testing without a real `Application` and a real Room database.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: [interface-contract]
Builds toward: [test-double-mocking]
Related concepts: [repository-pattern]
Used by (track/): Lesson 30
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### repository-pattern

Preferred Name: Repository Pattern
Aliases: []
Definition: One class responsible only for "get me the data, from wherever it actually lives, and hand back a single, unified answer" — hiding the actual source (one database, several, a network call, a cache, any combination) behind one small, stable interface.
First needed because: `InventoryViewModel` knowing directly that its data comes from Room specifically stops being fine the moment a second data source (Lesson 28's network sync) needs to be merged in — without this seam, that change would mean rewriting the ViewModel itself.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: [program-to-an-interface]
Builds toward: []
Related concepts: [read-only-interface-exposure, layered-architecture, delegation, open-closed-principle]
Used by (track/): Lesson 17
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### iterator-pattern

Preferred Name: Iterator Pattern
Aliases: []
Definition: Traversing a sequence one element at a time via a stateful cursor/position object, without the whole collection needing to be materialized in memory up front.
First needed because: `Cursor.moveToNext()` is the exact same shape as any `for`-each loop over a `List`, just implemented against a database result set instead of an in-memory collection.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: []
Builds toward: [sql-cursor]
Related concepts: [eager-vs-lazy-evaluation, view-recycling]
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### proxy-gateway-pattern

Preferred Name: Proxy/Gateway Pattern
Aliases: []
Definition: Brokering access through a narrow, explicitly-scoped intermediary instead of exposing a raw resource directly.
First needed because: `FileProvider` grants another app temporary, scoped access to write one specific file, rather than exposing the app's raw storage path directly.
Category: 05 Design Patterns
Depth required: Mastery
Required prerequisites: []
Builds toward: [fileprovider-content-uri]
Related concepts: [capability-scoping]
Used by (track/): Lesson 25
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### template-method-pattern

Preferred Name: Template Method Pattern
Aliases: []
Definition: A base class (or framework) defines a fixed sequence of steps and defers one or more individual steps to a subclass's own overridden method.
First needed because: The actual shape behind Android calling `onCreate()` on your Activity — the framework owns the sequence, your override fills in one step of it.
Category: 05 Design Patterns
Depth required: Working
Required prerequisites: [inheritance, method-overriding, inversion-of-control]
Builds toward: [activity-lifecycle]
Related concepts: []
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 06 — Framework Concepts

*(Generic — callback, lifecycle, Inversion of Control, event-driven
programming — none of these are Android concepts; Android merely uses
them. Taught with a hand-rolled fake framework before any real Android
example, per this project's own convention.)*

### inversion-of-control

Preferred Name: Inversion of Control
Aliases: []
Definition: A framework, not your own code, decides when your code runs — it calls into your code at specific points, rather than your code calling it.
First needed because: The single idea underneath "why isn't Android's entry point `main()`" — the entire premise of Lesson 2's title.
Category: 06 Framework Concepts
Depth required: Mastery
Required prerequisites: [method-overriding, dynamic-dispatch]
Builds toward: [callback, template-method-pattern, activity]
Related concepts: [template-method-pattern]
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### callback

Preferred Name: Callback
Aliases: Event Handler
Definition: A piece of code registered ahead of time and invoked later by something else (a framework, a UI toolkit) when a specific event occurs.
First needed because: The general shape every click listener, lifecycle method, and observer in this course shares.
Category: 06 Framework Concepts
Depth required: Mastery
Required prerequisites: [inversion-of-control]
Builds toward: [event-driven-programming, observer-pattern, asynchronous-callback-result, activity-result-registration]
Related concepts: []
Used by (track/): Lesson 2, Lesson 8, Lesson 10
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### event-driven-programming

Preferred Name: Event-Driven Programming
Aliases: []
Definition: A program's execution is driven by responding to discrete events as they occur, rather than running once, top to bottom, like a script.
First needed because: The paradigm shift Lesson 2's whole title is about — Android has no `main()` because it isn't this kind of program.
Category: 06 Framework Concepts
Depth required: Working
Required prerequisites: [callback]
Builds toward: [event-loop]
Related concepts: []
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### event-loop

Preferred Name: Event Loop
Aliases: []
Definition: A single thread continuously pulling queued units of work and running them one at a time, in order, forever — the actual mechanism behind a framework calling your code at specific points.
First needed because: Every `onCreate` call and click listener invocation since Lesson 2 has silently been one task pulled off this exact queue; this is what actually does the calling, and why two callbacks never run at the same time in this project.
Category: 06 Framework Concepts
Depth required: Mastery
Required prerequisites: [event-driven-programming]
Builds toward: [main-thread-constraint]
Related concepts: []
Syntax by language: Java/Android — `Looper` and `MessageQueue`. JavaScript — the browser/Node.js event loop, the same shape, different runtime. Universal beyond any one language — also GUI toolkits' message pumps (Windows' classic message loop, GTK's main loop) and a game engine's per-frame update loop.
Used by (track/): Lesson 14
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 07 — Android Framework

### activity

Preferred Name: Activity
Aliases: []
Definition: An Android framework class representing one on-screen screen of an app; instantiated and driven entirely by the Android OS, not by your own code.
First needed because: The concrete "framework, not you, is in charge" example this whole course is built around.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [inheritance, inversion-of-control]
Builds toward: [android-context, intent, activity-lifecycle, activity-back-stack, activity-result-reporting, application-context, android-fragment, android-application-class, instrumented-ui-testing]
Related concepts: [activity-lifecycle]
Used by (track/): Lesson 1 (sighted only), Lesson 2, Lesson 4, Lesson 5
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### activity-back-stack

Preferred Name: Activity Back Stack
Aliases: []
Definition: The stack Android maintains recording every Activity navigated away from, in order — the source of truth for what the system Back button returns to.
First needed because: Explains why pressing Back returns to `MainActivity` without re-running its `onCreate` — it was only paused/stopped, not destroyed, and it's the top of the stack that gets destroyed on Back, not the one underneath.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [stack-data-structure, activity]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 5, Lesson 9 (`finish()` as a programmatic pop, contrasted with Back)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### configuration-change

Preferred Name: Configuration Change
Aliases: []
Definition: An event (screen rotation, system language change, dark-mode toggle) that Android treats as invalidating the resources an Activity was built with, triggering a full destroy-and-recreate rather than an in-place patch.
First needed because: Explains why rotating the screen destroys and rebuilds an entire Activity object — including every plain field — even though nothing about navigation happened at all.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity-lifecycle]
Builds toward: [instance-state-checkpointing, process-death, android-viewmodel]
Related concepts: []
Used by (track/): Lesson 5
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### instance-state-checkpointing

Preferred Name: `onSaveInstanceState`
Aliases: []
Definition: A callback letting an Activity write small values into a `Bundle` right before a destruction it expects to recreate from, read back out in the next `onCreate` to restore transient state.
First needed because: `Bundle savedInstanceState` has sat unexplained in `onCreate`'s signature since Lesson 1 — this is the concept that finally gives it a job.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity-lifecycle, bundle, configuration-change, checkpointing]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 5
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### view-tree

Preferred Name: View Tree
Aliases: []
Definition: Every Android screen is a tree of nested `View` objects, each one's size and position defined relative to its parent and siblings, never as an absolute pixel coordinate.
First needed because: Explains why Android layout is described as nested XML data, not drawn at arbitrary x/y like a canvas.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: []
Builds toward: [findviewbyid, editable-text-input-view, view-recycling, layout-inflation, android-fragment]
Related concepts: [constraint-satisfaction-layout, xml]
Used by (track/): Lesson 3
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### findviewbyid

Preferred Name: `findViewById`
Aliases: []
Definition: A method that walks the inflated view tree at runtime looking for the view matching a declared ID, returning it as a real object whose methods can be called.
First needed because: The runtime bridge between an XML-declared view tree and Java code that wants to react to or change a specific view.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [view-tree, generated-r-class]
Builds toward: [android-viewholder]
Related concepts: []
Used by (track/): Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### intent

Preferred Name: `Intent`
Aliases: []
Definition: A data object describing a desired action or destination, handed to the Android OS to route, rather than the source component calling the destination directly.
First needed because: Activities can't hold direct references to each other and call `new` on one another — Intent is the indirection that lets the OS-managed lifecycle still get triggered correctly.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity, message-passing-through-a-broker]
Builds toward: [activity-result-reporting, implicit-intent]
Related concepts: [android-manifest, bundle]
Used by (track/): Lesson 4, Lesson 8 (extras), Lesson 9, Lesson 10 (no-target result-carrier form)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### parcelable

Preferred Name: `Parcelable`
Aliases: []
Definition: Android's own serialization interface for objects crossing an Intent/Bundle boundary, implemented by hand (a reading constructor, `writeToParcel`, `describeContents`, a `CREATOR` field) rather than via reflection, for performance.
First needed because: Repeating one `putExtra`/`get*Extra` pair per field (Lesson 8's first attempt) drifts out of sync exactly like Lesson 7's parallel-lists bug the moment a field is added — packaging logic needs to live on the class itself.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [serialization, interface-contract, constructor]
Builds toward: []
Related concepts: [anonymous-class]
Used by (track/): Lesson 8
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-context

Preferred Name: `Context`
Aliases: []
Definition: An Android object representing the environment/identity a request originates from — an Activity is one kind of Context, used any time a component needs to say who it is.
First needed because: `new Intent(this, InventoryActivity.class)`'s first argument is a Context — unreadable as more than "just pass `this`" without this concept.
Category: 07 Android Framework
Depth required: Recognition
Required prerequisites: [activity]
Builds toward: [application-context]
Related concepts: []
Used by (track/): Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### activity-lifecycle

Preferred Name: Activity Lifecycle
Aliases: []
Definition: The fixed sequence of framework-invoked methods (starting with `onCreate`) an Activity moves through, each one a hook for your own code to fill in.
First needed because: `onCreate` is meaningless without knowing it's one stop on a fixed, framework-owned sequence, not an arbitrary starting function.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity, template-method-pattern]
Builds toward: [configuration-change, instance-state-checkpointing, refresh-on-resume-pattern, android-viewmodel, lifecycle-aware-observation]
Related concepts: []
Used by (track/): Lesson 2, Lesson 5, Lesson 11 (`onResume` doing real work for the first time)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### process-death

Preferred Name: Process Death
Aliases: []
Definition: The Android OS terminating an app's entire process (swiped away, force-stopped, or reclaimed for memory), destroying everything in memory — including any state a configuration-change rescue like `onSaveInstanceState` would have saved.
First needed because: It's tempting to assume `onSaveInstanceState` is a general-purpose persistence fix; it isn't — process death is a stronger, different event a config-change rescue was never designed to survive.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [configuration-change, volatile-vs-nonvolatile-state]
Builds toward: [shared-preferences]
Related concepts: []
Used by (track/): Lesson 11
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### shared-preferences

Preferred Name: `SharedPreferences`
Aliases: []
Definition: A small, durable key-value store backed by a file on the device's persistent storage, surviving process death, read and written by string keys.
First needed because: `lowStockThreshold` needs somewhere to live outside process memory entirely, read on every app launch and written whenever the user changes it.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [process-death]
Builds toward: []
Related concepts: [bundle]
Used by (track/): Lesson 11
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### sqlite-open-helper

Preferred Name: `SQLiteOpenHelper`
Aliases: []
Definition: Android's base class for managing a SQLite database file's lifecycle — creation and version-upgrade — extended to define a database's initial schema and migration logic.
First needed because: `SharedPreferences` is fine for one number but has no way to represent structured, queryable, repeated records the way a real relational database can.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [relational-database-model, sql-query-language, inheritance]
Builds toward: [sql-cursor]
Related concepts: []
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### sql-cursor

Preferred Name: `Cursor`
Aliases: []
Definition: An Android object representing a position within a SQL query's result rows, read one row at a time via `moveToNext()`, rather than loading every row into memory at once.
First needed because: The concrete Android realization of the iterator pattern, and the same "don't eagerly load everything" idea `RecyclerView`'s ViewHolder recycling already established.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [iterator-pattern, sqlite-open-helper]
Builds toward: []
Related concepts: [manual-resource-cleanup]
Used by (track/): Lesson 12
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### bundle

Preferred Name: `Bundle`
Aliases: []
Definition: A key-value container Android uses to pass data around the framework, including as `onCreate`'s saved-instance-state parameter.
First needed because: Appears on the very first line of every Activity's code; needs a name even before it's fully explained.
Category: 07 Android Framework
Depth required: Recognition
Required prerequisites: []
Builds toward: [instance-state-checkpointing]
Related concepts: []
Used by (track/): Lesson 2, Lesson 8 (an `Intent`'s extras *are* a `Bundle`)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### editable-text-input-view

Preferred Name: `EditText`
Aliases: []
Definition: A view combining a label's display behavior with an editable, focusable text field the on-screen keyboard writes into, whose current content code can read back out.
First needed because: Every view up to this lesson has been one-directional (code sets it, the user only looks or taps) — a form needs the opposite direction too.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [view-tree]
Builds toward: []
Related concepts: [ui-hint-vs-enforced-validation]
Used by (track/): Lesson 9
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-toast

Preferred Name: `Toast`
Aliases: []
Definition: A small, auto-dismissing message overlay shown briefly to the user, independent of the view tree it floats above.
First needed because: Confirming a successful save without a dedicated permanent UI element for it.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: []
Builds toward: [android-snackbar]
Related concepts: []
Used by (track/): Lesson 9
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### activity-result-reporting

Preferred Name: Activity Result Reporting (`setResult`)
Aliases: []
Definition: An Activity can hand back a result — a result code plus optional Intent data — before finishing, rather than only ever performing an action and vanishing.
First needed because: `finish()` alone (Lesson 9) discards the newly built `Item` with no channel back to whoever launched this Activity.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity, intent]
Builds toward: [activity-result-registration]
Related concepts: []
Used by (track/): Lesson 10
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### activity-result-registration

Preferred Name: `ActivityResultLauncher` / `registerForActivityResult`
Aliases: Activity Result API
Definition: Registering ahead of time, before `onCreate` runs, to receive a launched Activity's eventual result via a callback, keyed to this specific launch rather than a hardcoded target class.
First needed because: Plain `startActivity` fires and forgets, with no hook anywhere for a later callback to attach to.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity-result-reporting, callback]
Builds toward: [runtime-permission-model]
Related concepts: [strategy-pattern]
Used by (track/): Lesson 10
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### view-recycling

Preferred Name: View Recycling
Aliases: []
Definition: Keeping only a small, roughly-screen-sized pool of row View objects alive and reusing them as the user scrolls, refilling each recycled view with new data instead of constructing a fresh view per data item.
First needed because: The actual fix for the wasteful loop-and-`addView` approach — the reason `RecyclerView` exists rather than just looping and adding views by hand.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [view-tree, eager-vs-lazy-evaluation]
Builds toward: [recyclerview-adapter]
Related concepts: [template-instance-separation]
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### layout-inflation

Preferred Name: Layout Inflation
Aliases: []
Definition: The process of turning an XML layout resource into real, constructed View objects at runtime.
First needed because: `setContentView` does this automatically for a whole screen; a `RecyclerView.Adapter` has to trigger the same process itself, by hand, for one row layout at a time.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [xml, view-tree]
Builds toward: [recyclerview-adapter]
Related concepts: []
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-viewholder

Preferred Name: `ViewHolder`
Aliases: []
Definition: An object caching one row's view references once, at construction, so later data updates skip re-searching the view tree.
First needed because: Without it, `findViewById` would be called fresh on every scroll frame for every visible row — real, measurable overhead this design exists specifically to remove.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [findviewbyid, cache-expensive-lookup-on-first-use, nested-class-enclosing-instance-reference]
Builds toward: [recyclerview-adapter]
Related concepts: []
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### recyclerview-adapter

Preferred Name: `RecyclerView.Adapter`
Aliases: []
Definition: An object bridging a data list to a bounded number of reusable row views — responsible for creating holders, binding data into them, and reporting the total item count.
First needed because: Nothing yet connects real data to the row views a `RecyclerView` recycles; this is the collaborator that does it.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [view-recycling, generics, android-viewholder, layout-inflation]
Builds toward: [recyclerview-layoutmanager, list-adapter, itemtouchhelper-swipe]
Related concepts: [incremental-update-notification]
Used by (track/): Lesson 6, Lesson 10 (`notifyItemInserted`), Lesson 11 (`notifyDataSetChanged`, `setLowStockThreshold`), Lesson 13 (real Room-backed data)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### recyclerview-layoutmanager

Preferred Name: `RecyclerView.LayoutManager`
Aliases: []
Definition: A swappable collaborator responsible purely for arranging a RecyclerView's rows spatially (a vertical list, a grid, a horizontal list), independent of the Adapter that supplies data.
First needed because: A `RecyclerView` refuses to render anything at all without one — arrangement logic is deliberately not built into `RecyclerView` itself.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [recyclerview-adapter, strategy-pattern]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### room-entity

Preferred Name: Room `@Entity`
Aliases: []
Definition: A Room-managed class annotated to represent a database table, with one field marked as the primary key Room uses to generate real SQL from.
First needed because: `Item` needs to become the exact table Lesson 12 hand-wrote as a `CREATE TABLE` string, without the table definition and the Java type ever being able to drift apart.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [orm-annotation-driven-persistence, primary-key]
Builds toward: [room-dao]
Related concepts: []
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### room-dao

Preferred Name: Room `@Dao`
Aliases: Data Access Object
Definition: An interface declaring every database operation as a method signature, each annotated with the corresponding SQL operation; Room generates the real implementation entirely at compile time.
First needed because: Replaces Lesson 12's scattered hand-written `execSQL`/`rawQuery` calls with one place declaring every operation the app performs against a table.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [interface-contract, room-entity]
Builds toward: [room-database]
Related concepts: []
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### room-database

Preferred Name: Room `@Database`
Aliases: []
Definition: An abstract class wiring together a set of Room entities and DAOs into one real, running database instance, built via Room's builder.
First needed because: `Item` and `ItemDao` exist independently until something declares "this is the actual database, made of these entities, offering these DAOs" and provides the one real instance the rest of the app uses.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [abstract-class, room-dao, singleton-pattern, builder-pattern]
Builds toward: []
Related concepts: [application-context]
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### application-context

Preferred Name: Application Context
Aliases: []
Definition: A Context tied to the whole app process's lifetime rather than one Activity's, appropriate for objects (like a shared database instance) meant to outlive any single screen.
First needed because: `AppDatabase`'s singleton instance must not be tied to whichever Activity happened to be on screen the first time it was requested.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [android-context, activity]
Builds toward: []
Related concepts: [room-database]
Used by (track/): Lesson 13
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### main-thread-constraint

Preferred Name: Main Thread UI Constraint
Aliases: UI Thread
Definition: Android confines all UI mutation to exactly one thread (the one running the event loop), enforced defensively — a view touched from any other thread throws immediately rather than risking a hard-to-reproduce race.
First needed because: Room refuses to run a query directly on this thread at all, and `RecyclerView` refuses to be updated from any other thread — both are the same underlying rule, encountered from two directions.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [thread, event-loop]
Builds toward: [anr-blocking-main-thread, post-to-main-thread, live-data]
Related concepts: []
Used by (track/): Lesson 13, Lesson 14 (full treatment)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### anr-blocking-main-thread

Preferred Name: ANR (Application Not Responding)
Aliases: []
Definition: Android detects when the main thread's event loop hasn't returned to process the next task in time and shows a system "not responding" dialog — the direct, real consequence of running slow work on that thread.
First needed because: Proves the main-thread constraint isn't a hypothetical rule — it's the actual, reproducible failure Room's own refusal to run on that thread exists to prevent.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [main-thread-constraint]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 14
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### post-to-main-thread

Preferred Name: `runOnUiThread`
Aliases: Posting Back to the Main Thread
Definition: Explicitly posting a piece of code to run on the main thread from a background thread — the required return trip before touching any View.
First needed because: Background database work (Lesson 13) can safely read/write the database, but must hand results back through this exact mechanism before updating anything on screen.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [main-thread-constraint, executor-service]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 13, Lesson 14 (full treatment)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-viewmodel

Preferred Name: `ViewModel`
Aliases: []
Definition: A class Jetpack manages specially, retained across Activity recreation via a framework-owned store tied to the logical screen rather than the physical Activity object.
First needed because: Rotation (Lesson 5) destroys and rebuilds `InventoryActivity` on every configuration change, re-querying the database every single time — `ViewModel` is Jetpack's purpose-built answer, structural rather than a hand-written rescue per field.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity-lifecycle, configuration-change, lifecycle-scoped-cache]
Builds toward: [viewmodel-provider]
Related concepts: []
Used by (track/): Lesson 15
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### viewmodel-provider

Preferred Name: `ViewModelProvider`
Aliases: []
Definition: The framework-managed lookup that returns an existing `ViewModel` instance for a screen if one already exists, constructing a new one only the first time.
First needed because: Constructing a `ViewModel` directly with `new` would produce a brand-new object on every `onCreate`, exactly the problem `ViewModel` itself exists to fix — something has to hold the real, retained instance.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-viewmodel]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 15
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### live-data

Preferred Name: `LiveData`
Aliases: []
Definition: An observable, lifecycle-aware container holding one current value, automatically notifying registered observers on change and safely handling the cross-thread handoff back to the main thread.
First needed because: Manual notification (calling the right Adapter method at every single data-change site) doesn't scale — miss one spot and the screen silently goes stale.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [observer-pattern, main-thread-constraint]
Builds toward: [lifecycle-aware-observation, jetpack-compose]
Related concepts: [callback, read-only-interface-exposure]
Used by (track/): Lesson 16
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### lifecycle-aware-observation

Preferred Name: Lifecycle-Aware Observation
Aliases: []
Definition: An observer registration tied to a LifecycleOwner, so updates are only delivered while the observing screen is actually active, and the subscription is automatically removed once that screen is destroyed.
First needed because: Removes an entire category of "callback fired after my screen was already gone" bugs a plain Observer registration (Lesson 4/8) would otherwise require guarding against by hand.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [live-data, activity-lifecycle, observer-pattern]
Builds toward: [fragment-view-lifecycle-mismatch]
Related concepts: []
Used by (track/): Lesson 16
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-fragment

Preferred Name: `Fragment`
Aliases: []
Definition: A reusable, embeddable chunk of UI with its own related-but-distinct lifecycle, hosted inside an Activity's view tree instead of replacing it entirely.
First needed because: Every screen so far has been a whole Activity, each requiring its own Manifest entry and reached only through a full-screen `Intent` navigation — UI can't be embedded inside another screen or shown alongside something else if it can only ever exist as an entire, standalone Activity.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [activity, view-tree]
Builds toward: [fragment-transaction, fragment-view-lifecycle-mismatch, single-activity-architecture]
Related concepts: [two-phase-construction-initialization]
Used by (track/): Lesson 18
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### fragment-transaction

Preferred Name: Fragment Transaction
Aliases: []
Definition: Fragment changes (add/remove/replace) batched into an explicit transaction object, finalized by one commit call rather than each change taking effect immediately and independently.
First needed because: Placing `InventoryListFragment` inside its container requires a `FragmentManager`, a transaction, and an explicit `.commit()` — nothing takes effect on screen before that final call.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-fragment]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 18
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### fragment-view-lifecycle-mismatch

Preferred Name: Fragment vs. View Lifecycle Mismatch
Aliases: `getViewLifecycleOwner`
Definition: A Fragment object and its View have two separate lifecycles — a Fragment can remain alive while its View is destroyed and recreated — so LiveData observation must be tied to the View's lifecycle specifically, not the Fragment's own.
First needed because: Passing the Fragment itself (`this`) to `.observe(...)` instead of `getViewLifecycleOwner()` is a real, easy-to-miss bug source once a Fragment can be kept on a back stack (Lesson 19) with its view destroyed and recreated independently.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-fragment, lifecycle-aware-observation]
Builds toward: [options-menu]
Related concepts: []
Used by (track/): Lesson 18
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### single-activity-architecture

Preferred Name: Single-Activity Architecture
Aliases: []
Definition: Collapsing every screen in an app into Fragments hosted by one single Activity, rather than one Activity per screen.
First needed because: Five separate Activities means five Manifest entries and hand-built `Intent`s scattered across whichever screen triggers each navigation — a real, growing source of drift.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-fragment]
Builds toward: [navigation-graph]
Related concepts: []
Used by (track/): Lesson 19
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### navigation-graph

Preferred Name: Navigation Graph
Aliases: []
Definition: One XML resource listing every screen destination and every legal path between them as data, read by a build-time plugin that generates a typed API replacing raw Intent-based navigation.
First needed because: Every hand-built `Intent`/`putExtra` pair between screens is a Lesson 7-style "parallel lists" risk relocated to Activity boundaries — nothing checks that the sending and receiving sides agree.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [single-activity-architecture, directed-graph]
Builds toward: [safe-args-codegen, android-toolbar]
Related concepts: [generated-r-class, orm-annotation-driven-persistence]
Used by (track/): Lesson 19
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### safe-args-codegen

Preferred Name: Safe Args
Aliases: []
Definition: A build-time plugin generating typed "Directions"/"Args" classes per navigation destination from the graph's declared arguments, replacing string-keyed Intent extras with compiler-checked method calls.
First needed because: A missing or wrong-typed argument becomes a genuine compile error instead of a runtime `null` the way a mistyped `"EXTRA_ITEM"` string (Lesson 8) would have been.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [navigation-graph]
Builds toward: []
Related concepts: [make-illegal-states-unrepresentable]
Used by (track/): Lesson 19
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### diffutil

Preferred Name: `DiffUtil`
Aliases: []
Definition: Android's implementation of minimal-edit-distance diffing between two list states, used to compute exactly which rows were inserted, removed, moved, or changed rather than assuming everything changed.
First needed because: `notifyDataSetChanged()` after every `LiveData` update redraws the entire list even when only one row actually differs.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [minimal-edit-distance-diffing, identity-vs-equality]
Builds toward: [list-adapter]
Related concepts: []
Used by (track/): Lesson 20
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### list-adapter

Preferred Name: `ListAdapter`
Aliases: []
Definition: A `RecyclerView.Adapter` subclass that manages its own internal list and runs `DiffUtil` automatically off the main thread whenever a new list is submitted.
First needed because: Wiring `DiffUtil.calculateDiff`/`.dispatchUpdatesTo` by hand, correctly, every time `LiveData` posts a new list, is exactly the repeated boilerplate Room's generated DAOs already exist to avoid elsewhere in this project.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [recyclerview-adapter, diffutil, executor-service]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 20
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-toolbar

Preferred Name: `Toolbar`
Aliases: App Bar
Definition: A Material Design app bar widget wired to an Activity's action-bar slot and, via a navigation-aware helper, to the current navigation destination's title and back behavior automatically.
First needed because: Replaces the framework's plain default title bar (no Back affordance, nowhere to place menu actions) with one every destination's title and Back behavior stay in sync with, without any per-screen title-setting code.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [navigation-graph]
Builds toward: [options-menu]
Related concepts: [single-source-of-truth]
Used by (track/): Lesson 21
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### options-menu

Preferred Name: Options Menu (`MenuProvider`)
Aliases: []
Definition: A declared set of actions in an XML menu resource, shown in a Toolbar's overflow or as visible icons, dispatched to a handler through an interface scoped to a Fragment's view lifecycle.
First needed because: Every action so far has needed its own permanently-visible button competing for screen space — the menu system exists specifically for actions that don't need to be permanently on-screen.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-toolbar, fragment-view-lifecycle-mismatch]
Builds toward: []
Related concepts: [command-dispatch-table]
Used by (track/): Lesson 21, Lesson 22 (reused for Delete)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### modal-dialog-confirmation

Preferred Name: `AlertDialog` (Modal Confirmation)
Aliases: []
Definition: A dialog blocking interaction with the rest of the screen until the user makes an explicit choice, inserted as a synchronous confirmation gate before an irreversible operation.
First needed because: Deletion is the first destructive action in this app — wiring it directly to a menu tap would make data loss exactly one mis-tap away, with no chance to reconsider.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [builder-pattern]
Builds toward: []
Related concepts: [destructive-action-confirmation]
Used by (track/): Lesson 22
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### itemtouchhelper-swipe

Preferred Name: `ItemTouchHelper`
Aliases: []
Definition: A RecyclerView helper detecting swipe (and optionally drag) gestures against rows, distinguishing them from vertical scrolling, and reporting completed swipes for the app to act on.
First needed because: `RecyclerView` handles vertical scrolling but has no built-in swipe-to-delete behavior of its own — that requires a separate, purpose-built helper.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [recyclerview-adapter, event-stream-classification]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 23
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-snackbar

Preferred Name: `Snackbar`
Aliases: []
Definition: A brief, auto-dismissing bar anchored to the screen, similar to `Toast` but interactive — capable of holding a real, tappable action.
First needed because: A row vanishing with zero feedback would feel abrupt and offer no recovery path — this is the mechanism giving swipe-to-delete a working Undo.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [android-toast]
Builds toward: []
Related concepts: [compensating-action-pattern]
Used by (track/): Lesson 23
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### runtime-permission-model

Preferred Name: Runtime Permission Model
Aliases: Dangerous Permissions
Definition: A Manifest declaration alone only means an app might ask for a sensitive capability — the user must explicitly grant it at runtime, and code must handle every way that request can be answered, including permanent denial.
First needed because: The camera is the first capability this project has used that the OS actively protects — every capability before it (database, `SharedPreferences`, navigation) was unconditionally available inside the app's own sandbox.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-manifest, activity-result-registration, least-privilege-explicit-consent]
Builds toward: [permission-rationale-state-machine]
Related concepts: []
Used by (track/): Lesson 24
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### permission-rationale-state-machine

Preferred Name: Permission Rationale State Machine
Aliases: []
Definition: A small state machine layered on top of a seemingly binary yes/no permission — distinguishing "ask normally" from "explain first" from "permanently denied, guide to Settings" — because a single boolean can't express all three.
First needed because: `shouldShowRequestPermissionRationale` and a permanently-denied silent auto-refusal are both real, distinct states a bare granted/denied check cannot tell apart.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [runtime-permission-model]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 24
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### implicit-intent

Preferred Name: Implicit Intent
Aliases: []
Definition: An Intent describing a desired action via a standard action string, without naming a specific target class, letting the OS resolve any installed app capable of handling it.
First needed because: "Open the camera" cannot possibly work as an explicit Intent — this project has no camera Activity of its own and no compile-time knowledge of which camera app, if any, a given device has installed.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [intent]
Builds toward: []
Related concepts: [message-passing-through-a-broker]
Used by (track/): Lesson 25
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### content-provider

Preferred Name: `ContentProvider`
Aliases: []
Definition: A fourth kind of app component exposing structured access to data across app boundaries under OS-mediated permission control.
First needed because: `FileProvider` is a ready-made, specific instance of this general mechanism, first met in passing before Lesson 29 builds the general case from scratch.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-manifest]
Builds toward: [fileprovider-content-uri]
Related concepts: [command-dispatch-table, interface-segregation-tension]
Used by (track/): Lesson 25 (via `FileProvider`, recognition only), Lesson 29 (full treatment)
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### fileprovider-content-uri

Preferred Name: `FileProvider`
Aliases: Content URI
Definition: A `content://` URI brokered through a `FileProvider`, granting another app temporary, scoped access to write a specific file without exposing the app's raw storage directly.
First needed because: A bare `file://` URI shared across app boundaries is specifically blocked by modern Android as a security measure — the Camera app needs a sanctioned way to write the captured photo.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [content-provider, proxy-gateway-pattern]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 25
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-service

Preferred Name: `Service`
Aliases: []
Definition: A fourth kind of app component running code with no window or UI of its own, declared in the Manifest like an Activity, for work that needs to run without any visible screen.
First needed because: Every background operation so far has been tied directly to a visible screen's lifecycle — nothing in this app does anything while it's closed.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-manifest, thread]
Builds toward: [background-execution-limits]
Related concepts: []
Used by (track/): Lesson 26
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### background-execution-limits

Preferred Name: Background Execution Limits
Aliases: Doze Mode
Definition: OS-imposed restrictions on what an app with no visible UI can do unprompted, increasingly strict since Android 8, specifically to protect battery life — including batching and delaying background work during extended idle periods.
First needed because: A plain started `Service` with no special handling can be stopped by the OS within moments of the app leaving the foreground — nothing about it schedules periodic, reliable work on its own.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-service]
Builds toward: [workmanager]
Related concepts: []
Used by (track/): Lesson 26
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### workmanager

Preferred Name: `WorkManager`
Aliases: []
Definition: A library for deferrable, guaranteed-eventually background work, internally choosing the best underlying scheduling mechanism per device so the app doesn't have to.
First needed because: Manually building "run periodically, survive reboots, respect Doze, retry on failure, adapt to whichever Android version this device runs" correctly, by hand, is real, substantial, error-prone work.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [background-execution-limits, executor-service, strategy-pattern]
Builds toward: []
Related concepts: [notification-channel]
Used by (track/): Lesson 26
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### notification-channel

Preferred Name: Notification Channel
Aliases: []
Definition: A declared category of notification, created once, that every individual notification must reference — letting the user control categories of notifications individually without the app building its own preference UI.
First needed because: Posting any notification on Android 8+ requires a channel to exist first, and Android 13+ additionally requires explicit runtime permission, the exact pattern already established for camera access.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-manifest, android-application-class]
Builds toward: []
Related concepts: [least-privilege-explicit-consent, runtime-permission-model]
Used by (track/): Lesson 26
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-application-class

Preferred Name: `Application`
Aliases: []
Definition: A class representing the whole running process, not one screen or component — exactly one instance exists for the app's entire lifetime, created before any Activity.
First needed because: The notification channel needs to be created exactly once, before any screen opens — a job no Activity or Fragment is positioned to own correctly.
Category: 07 Android Framework
Depth required: Working
Required prerequisites: [activity]
Builds toward: [notification-channel]
Related concepts: []
Used by (track/): Lesson 26
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### broadcast-receiver

Preferred Name: `BroadcastReceiver`
Aliases: []
Definition: The fourth major Android app component, reacting to system-wide or cross-app announcements via a short-lived `onReceive` callback with no lifecycle of its own — heavy work must be handed off elsewhere.
First needed because: Everything this project has reacted to so far originated inside the app itself — nothing yet reacts to events the system, or another app, announces.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [android-manifest, static-vs-dynamic-registration]
Builds toward: []
Related concepts: [observer-pattern, workmanager]
Used by (track/): Lesson 27
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### retrofit-api-interface

Preferred Name: Retrofit
Aliases: []
Definition: Declaring a remote API as an annotated Java interface; a library generates a real, working implementation at runtime via reflection, converting between HTTP calls and typed Java objects automatically.
First needed because: Hand-parsing JSON field by field, and manually managing HTTP connections, threading, and error cases for every endpoint, doesn't scale.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [interface-contract, json-serialization]
Builds toward: []
Related concepts: [room-dao, safe-args-codegen, asynchronous-callback-result, runtime-vs-compile-time-codegen]
Used by (track/): Lesson 28
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### instrumented-ui-testing

Preferred Name: Instrumented UI Testing (Espresso)
Aliases: []
Definition: Automated tests that launch a real Activity on an actual device or emulator and simulate real taps and keystrokes against real Views, verifying the screen genuinely wires everything together rather than testing pure logic in isolation.
First needed because: Plain-JVM unit tests deliberately avoid real Views and a real RecyclerView entirely — incapable of proving the screen itself works.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [test-pyramid, activity]
Builds toward: [idling-resource-sync-signaling]
Related concepts: []
Used by (track/): Lesson 31
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### idling-resource-sync-signaling

Preferred Name: `IdlingResource`
Aliases: []
Definition: A counter-based signal telling a test framework "still busy, keep waiting" versus "idle, safe to proceed" for background work the framework's own automatic waiting can't see.
First needed because: Espresso waits for the main thread's UI queue to go idle automatically, but has no idea a separate background thread (Room's `dbExecutor`) is still working — without this, a test could assert before the real work finishes, producing flakiness.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [instrumented-ui-testing, executor-service]
Builds toward: []
Related concepts: [asynchronous-callback-result]
Used by (track/): Lesson 31
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### jetpack-compose

Preferred Name: Jetpack Compose
Aliases: []
Definition: A UI toolkit where a function describes UI declaratively and is automatically re-invoked (recomposition) whenever the state it depends on changes, collapsing separate XML structure and imperative view-mutation code into one thing.
First needed because: Every screen since Lesson 3 has been built from two separate halves — an XML file and imperative Java glue code kept in sync by hand — Compose collapses both into one.
Category: 07 Android Framework
Depth required: Mastery
Required prerequisites: [declarative-ui, live-data]
Builds toward: []
Related concepts: [state-hoisting]
Used by (track/): Lesson 32
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Category 08 — Android Project Concepts

### xml

Preferred Name: XML
Aliases: []
Definition: A markup format using nested tags and attributes to describe structured data — Android uses it for both the Manifest and UI layouts.
First needed because: Read before either the Manifest or a layout file can make sense as more than unfamiliar punctuation.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: []
Builds toward: [android-manifest, android-resources, layout-inflation]
Related concepts: [view-tree]
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-manifest

Preferred Name: Android Manifest
Aliases: []
Definition: A required XML file declaring every component an Android app has (Activities, permissions, and more) so the OS knows what the app contains before ever running any of it.
First needed because: The concrete reason a new Activity has to be *declared*, not just written, before Android will treat it as a launchable screen.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [xml]
Builds toward: [intent-filter, runtime-permission-model, content-provider, android-service, notification-channel, broadcast-receiver]
Related concepts: [intent-filter, intent, capability-scoping]
Used by (track/): Lesson 2, Lesson 4
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### intent-filter

Preferred Name: Intent Filter
Aliases: []
Definition: A Manifest declaration stating what kind of external request (such as "be the app's launcher screen") a given Activity is willing to handle.
First needed because: The mechanism behind `MAIN`/`LAUNCHER`, the specific Manifest lines that make one Activity the one that opens when the app icon is tapped.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: [android-manifest]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-resources

Preferred Name: Android Resources
Aliases: []
Definition: Non-code assets — strings, layouts, styles, images — stored in a structured `res/` folder, separate from source code, referenced symbolically rather than hardcoded inline.
First needed because: The reason UI text and layout live in separate files instead of directly inside Java code.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: [xml]
Builds toward: [generated-r-class, resource-qualifiers]
Related concepts: [generated-r-class]
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### generated-r-class

Preferred Name: Generated `R` Class
Aliases: []
Definition: A class Android's build tools generate automatically, giving every resource a compile-time-checked integer constant (`R.layout.activity_main`) instead of an error-prone raw string or file-path lookup.
First needed because: `setContentView(R.layout.activity_main)` is unreadable as anything but a magic incantation without this concept.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [android-resources]
Builds toward: [findviewbyid]
Related concepts: []
Used by (track/): Lesson 2, Lesson 3
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### logcat

Preferred Name: Logcat
Aliases: []
Definition: Android's system-wide logging output stream, viewable inside Android Studio, used to observe what a running app is actually doing as it runs.
First needed because: The primary way to prove, concretely, that framework lifecycle methods really are being called when the course claims they are.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 2
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### android-views-vs-compose

Preferred Name: Views vs. Jetpack Compose
Aliases: []
Definition: Android offers two different UI-building systems — XML-layout-based Views (older, this curriculum's choice) and code-first Jetpack Compose (newer) — a real architectural fork, not a cosmetic setting.
First needed because: Silently accepted at project creation (Lesson 1's "Empty Views Activity" wizard choice) with zero explanation; the fork isn't resolved until Lesson 32.
Category: 08 Android Project Concepts
Depth required: Recognition
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 1
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### minimum-sdk

Preferred Name: Minimum SDK
Aliases: []
Definition: The oldest Android API version an app declares it supports; a device running an older version than this cannot install the app at all.
First needed because: Accepted as a wizard default in Lesson 1 with zero explanation of what it even is.
Category: 08 Android Project Concepts
Depth required: Recognition
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 1
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### dp-sp-density-independent-units

Preferred Name: `dp` / `sp` (Density-Independent Units)
Aliases: []
Definition: Android size units that get automatically scaled per-device so the same value produces roughly the same physical size regardless of screen pixel density; `sp` additionally respects the user's system font-size accessibility setting.
First needed because: A view sized in raw pixels looks a different physical size on different-density phones — `dp`/`sp` bake that correction into the unit itself instead of leaving it to per-device developer math.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Used by (track/): Lesson 3
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### build-dependency-management

Preferred Name: Build Dependency Management
Aliases: []
Definition: Declaring an external library your project needs in a build configuration file, which a build tool then downloads and makes available to your code.
First needed because: `RecyclerView` isn't part of the Android SDK's always-available classes — it has to be declared as a dependency and synced before its classes exist to import at all.
Category: 08 Android Project Concepts
Depth required: Working
Required prerequisites: []
Builds toward: []
Related concepts: []
Syntax by language: Java/Android — `build.gradle`'s `dependencies { implementation '...' }`, resolved by Gradle. Python — `requirements.txt`/`pyproject.toml`, resolved by pip. C#/.NET — `.csproj`'s `PackageReference`, resolved by NuGet. The general idea (a declared, tool-resolved dependency list) is universal; the file format and resolution tool are not.
Used by (track/): Lesson 6
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

### resource-qualifiers

Preferred Name: Resource Qualifiers
Aliases: []
Definition: The same resource name resolves to different actual files depending on the device's current configuration (dark mode, screen size, density, locale), selected automatically by the platform outside application code.
First needed because: `dp`/`sp` already relied on this mechanism implicitly since Lesson 3 — this is the first lesson to use it explicitly and visibly, for colors and for entire alternate layouts.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [android-resources]
Builds toward: []
Related concepts: [feature-detection-vs-config-detection]
Used by (track/): Lesson 33
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### build-variants

Preferred Name: Build Variants (Debug vs. Release)
Aliases: []
Definition: Separate build configurations — at minimum debug and release — compiled from one shared codebase, differing in signing, debuggability, and code shrinking.
First needed because: Every run of this app has used a debug build, signed with an insecure auto-generated key, fully debuggable, and unshrunk — none of which belongs in a build handed to a real user.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [build-variant-environment-profile]
Builds toward: [app-signing, code-shrinking-obfuscation]
Related concepts: []
Used by (track/): Lesson 34
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### app-signing

Preferred Name: App Signing
Aliases: []
Definition: A cryptographic signing key permanently tied to an app's identity — every future update must be signed with the same key to be accepted as a legitimate update rather than a different app entirely.
First needed because: A release build needs a real, private signing key before it can be distributed at all, kept permanently and never committed to version control.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [build-variants]
Builds toward: []
Related concepts: []
Used by (track/): Lesson 34
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

### code-shrinking-obfuscation

Preferred Name: R8 (Code Shrinking, Optimization, Obfuscation)
Aliases: ProGuard
Definition: A build step removing unused classes/methods/resources (tree-shaking), rewriting bytecode for size and speed (optimization), and renaming identifiers to meaningless names (obfuscation) — run automatically for release builds.
First needed because: A debug build ships every class this app and its libraries define, completely unshrunk, with full, readable class and method names — larger than necessary and trivially reverse-engineerable.
Category: 08 Android Project Concepts
Depth required: Mastery
Required prerequisites: [build-variants]
Builds toward: []
Related concepts: [static-analysis-reflection-blind-spot]
Used by (track/): Lesson 34
Recognition taught in (track-foundations):
Fully taught in (track-foundations):

---

## Notes from the extraction pass (Lessons 0–34, now complete)

- Category 00 (Programming Fundamentals) got its first two nodes from
  Lessons 5–6 (`stack-data-structure`, `eager-vs-lazy-evaluation`) — both
  are genuine CS fundamentals that a specific `track/` lesson happened to
  need, confirming the category isn't structurally empty, just rare. It
  ended extraction at 15 nodes total — still the smallest non-stdlib
  category, which is expected: most "fundamentals" gaps surface once, early.
- `package-declaration` (an earlier, separate node) was removed and folded
  into `namespace`'s `Syntax by language` field — it was Java syntax for
  an idea `namespace` already covered as a concept, not a second concept.
- `Builds toward` was populated by hand through Lesson 6, then re-verified
  mechanically at every batch from Lesson 7 onward via
  `scripts/concept-graph-report.mjs`'s staleness diff (recomputing the true
  reverse graph and comparing). That check caught and fixed real drift on
  almost every batch — confirms the mechanical approach was worth building
  rather than trusting continued by-hand accuracy through all 34 lessons.
- The projected 250–400 node range (estimated after Lesson 6, at ~75 nodes)
  did not materialize — the graph closed at 190 nodes. Growth was bursty by
  subsystem exactly as predicted, but later lessons (11 onward) were far
  more reuse-heavy than the early estimate assumed, so the node count grew
  sub-linearly relative to lesson count rather than staying roughly
  constant per lesson.
- Full results are in the Graph Health Report (generated by
  `scripts/concept-graph-report.mjs`, run after Lesson 34's extraction):
  structure, reuse, curriculum, and quality metrics computed directly from
  the graph. See that script's output for current numbers rather than
  duplicating them here — they will drift the moment new nodes are added
  during the topological-sort/lesson-grouping stages.

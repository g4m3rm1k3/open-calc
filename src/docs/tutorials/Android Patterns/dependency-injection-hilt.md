# Building the Object Graph For You: Dependency Injection with Hilt

**What problem this solves.** A class that needs a collaborator — a
repository, a network client, anything — has two ways to get one:
construct it itself, or have it handed in from outside. Constructing it
itself seems simpler at first, but it means this class now also owns
deciding exactly which concrete implementation to use, how to configure
it, and how to obtain *that* object's own dependencies in turn — work
that has nothing to do with this class's actual job, duplicated
wherever the same collaborator is needed. It also means nothing can ever
substitute a fake version for testing, because the real one is
hard-wired inside via a direct call to build it. The abstract fix:
classes declare what they need; something else, entirely separate, is
responsible for actually building everything and handing each class its
already-built dependencies.

**Classic pattern family.** Not from the Gang-of-Four book — the term
and the underlying principle, *Inversion of Control*, come from later
software-architecture writing, closely associated with Martin Fowler
and the Spring framework. Its own idea: a class never constructs its
own dependencies; it only declares what it needs, and a separate outside
mechanism resolves and supplies the whole connected graph of objects.

**Where you'll meet it in Android.** Google's recommended dependency-
injection library, Hilt (`androidx.hilt`, built on Dagger), via four
annotations: `@Inject`, `@HiltAndroidApp`, `@AndroidEntryPoint`, and the
`Application` base class they attach to.

**Terms used in this pattern.**

- **Annotation** — a marker attached to a class, method, or field that
  a separate tool reads and acts on, without changing what the marked
  code itself does at the moment it's written. It exists so metadata
  about a declaration (here: "Hilt is responsible for building this")
  can live right next to that declaration instead of in separate
  configuration.
- **Compile-time code generation** — a process where a tool reads
  annotations while the project is being built and writes real,
  additional source code implementing the behavior they imply, before
  the app is ever run. It exists so dependency wiring resolves to
  ordinary, fast method calls rather than something computed freshly
  every time the app runs, and so a genuinely unresolvable dependency
  becomes a build failure instead of a runtime crash.
- **Object graph** — the complete, connected structure of every object
  in play and which others each one depends on, considered as one
  whole rather than object-by-object. It exists as the actual thing a
  dependency-injection tool is managing — not just one class's needs,
  but the entire connected set, built in the correct order.

**Objects and methods used.**

- **`@Inject` on a constructor**
  *What it is:* an annotation on a constructor.
  *Implementation:* placed directly above a constructor declaration,
  e.g. `@Inject public ContactRepository(ContactApiService apiService)`.
  *Its use:* tells Hilt it is allowed to call this constructor itself
  to build an instance, and that doing so first requires resolving
  every one of this constructor's own parameters the same way,
  recursively.
- **`@Inject` on a field**
  *What it is:* an annotation on a field.
  *Implementation:* placed directly above a field declaration, e.g.
  `@Inject ContactRepository repository;`.
  *Its use:* used specifically where a constructor can't be annotated
  — an `Activity` is constructed by the Android system itself, not by
  app code, so Hilt has nothing to call; instead, Hilt fills in this
  already-declared field on an existing object, right after the system
  creates it.
- **`@AndroidEntryPoint`**
  *What it is:* a class-level annotation.
  *Implementation:* placed directly above an `Activity` subclass's
  declaration.
  *Its use:* tells Hilt to generate the code that performs field
  injection into this specific class whenever the system creates an
  instance of it.
- **`@HiltAndroidApp`**
  *What it is:* a class-level annotation.
  *Implementation:* placed directly above an `Application` subclass's
  declaration.
  *Its use:* triggers generation of the top-level container the entire
  app's injected object graph is rooted in.
- **`Application`**
  *What it is:* the base class for the single object representing the
  whole running app process.
  *Implementation:* `public class Application extends ContextWrapper`,
  instantiated by the system before any `Activity` exists.
  *Its use:* the one class guaranteed to exist for the app's entire
  lifetime, which is why Hilt roots its whole graph here rather than at
  any individual, comparatively short-lived `Activity`.

---

## The Shape

Four participants:

- **Every class with an `@Inject` constructor** (`ContactApiService`,
  `ContactRepository` below) — declares what it needs, never builds it.
- **`ContactApp`, marked `@HiltAndroidApp`** — the root Hilt generates
  its whole container from.
- **`ContactListActivity`, marked `@AndroidEntryPoint`, with an
  `@Inject` field** — a consumer that receives an already-built
  dependency rather than constructing one.
- **Hilt's own generated code** (produced at compile time, never
  written by hand) — the actual mechanism that reads all of the above
  and does the real building, in the right order, the first time each
  piece is needed.

The relationship: no class in this whole graph ever writes `new
ContactRepository(...)` or `new ContactApiService(...)` anywhere in
code the developer typed. Every such call exists only inside code Hilt
itself generated at compile time, driven entirely by which constructors
carry `@Inject`. Every class here only ever *declares* what it needs;
something else, entirely outside this code, is responsible for actually
calling `new` and handing the result over.

```
  @HiltAndroidApp ContactApp
        |
        |  roots the generated container
        v
  Hilt-generated code (compile-time, never hand-written)
        |
        |  builds, in dependency order:
        v
  ContactApiService()  ---->  ContactRepository(apiService)
                                     |
                                     |  assigned into the @Inject field of
                                     v
                    @AndroidEntryPoint ContactListActivity
```

---

## Mechanical Walkthrough

```java
public class ContactApiService {
    @Inject
    public ContactApiService() {
    }
}
```

```java
public class ContactRepository {
    private final ContactApiService apiService;

    @Inject
    public ContactRepository(ContactApiService apiService) {
        this.apiService = apiService;
    }
}
```

```java
@HiltAndroidApp
public class ContactApp extends Application {
}
```

```java
@AndroidEntryPoint
public class ContactListActivity extends AppCompatActivity {

    @Inject
    ContactRepository repository;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}
```

- **`@Inject public ContactApiService() { }`** — a no-argument
  constructor, marked so Hilt knows it can build one of these itself,
  with no further dependencies to resolve first — the simplest possible
  case in this whole graph.
- **`@Inject public ContactRepository(ContactApiService apiService)`**
  — marked the same way, but this constructor has a parameter; before
  Hilt can call this constructor, it must first have already resolved
  an `ContactApiService`, which is exactly what the previous class
  supplies.
- **`this.apiService = apiService;`** — an ordinary field assignment,
  nothing Hilt-specific about this one line — the injected value, once
  handed in, is stored and used like any other constructor parameter.
- **`@HiltAndroidApp public class ContactApp extends Application`** —
  this specific annotation-and-superclass combination is what causes
  Hilt's compile-time code generator to produce the whole top-level
  container in the first place; without a class marked this way,
  nothing below it would have anywhere to be rooted.
- **`@AndroidEntryPoint public class ContactListActivity extends AppCompatActivity`**
  — marks this specific `Activity` as one Hilt should inject into,
  generating the code that does so at the right moment during this
  class's own creation.
- **`@Inject ContactRepository repository;`** — a field, not a
  constructor parameter, because `ContactListActivity` itself is never
  built with `new` by app code — the Android system constructs it — so
  there is no constructor call for Hilt to hook into; the field is
  filled in afterward instead.
- **`super.onCreate(savedInstanceState);`** — an ordinary lifecycle
  call (see the Activity lifecycle contract for its own full
  treatment), included here specifically because Hilt's generated
  injection code runs as part of this same call chain — by the time
  the line after it executes, `repository` is already safely non-null.

---

## Collaboration — how it actually runs

1. The app process starts; the system instantiates `ContactApp`
   because it's declared as the app's `Application` class. Because it's
   marked `@HiltAndroidApp`, this triggers Hilt's generated top-level
   container to be created once, for the entire app process's lifetime.
2. Later, the user opens the contact list; the system creates a
   `ContactListActivity`. Because it's marked `@AndroidEntryPoint`,
   Hilt's generated injection code runs automatically as part of this
   Activity's own `onCreate` call chain, before the developer's own
   `onCreate` body finishes running past its `super.onCreate(...)` line.
3. To fill the `repository` field, Hilt's generated code needs a
   `ContactRepository`. None has been built yet in this app run, so
   Hilt calls its `@Inject` constructor — but that constructor first
   needs a `ContactApiService`.
4. Hilt resolves `ContactApiService` the same way: none built yet, its
   `@Inject` constructor takes no parameters, so Hilt calls it directly
   with nothing further to resolve.
5. With a real `ContactApiService` now in hand, Hilt finishes building
   the `ContactRepository`, then assigns it into
   `ContactListActivity`'s `repository` field — all of this completing
   before any code the developer wrote after `super.onCreate(...)` runs,
   which is exactly why using `repository` starting on the next line is
   always safe.

---

## Why It's Shaped This Way

The design principle is **inversion of control**: a class shouldn't be
responsible for locating or constructing its own collaborators, only
for declaring what it needs — something else, outside the class
entirely, inverts that responsibility and takes it on instead.

The alternative not chosen: each class constructs what it needs itself,
wherever it's first used — `new ContactRepository(new
ContactApiService())` written directly inside the Activity. The real
cost: every place that needs a `ContactRepository` has to know its full
construction recipe, including the recipe for everything *it* needs in
turn, and changing that recipe later — say, `ContactRepository` gains a
second dependency — means finding and editing every call site instead
of one constructor. It also makes automated testing far harder: nothing
can substitute a fake `ContactApiService` without changing the
production code itself, since the real one is hard-wired in with `new`.

The cost this pattern itself carries: when Hilt genuinely can't figure
out how to build something in the graph, the failure surfaces as a
build-time error from generated code, often pointing at a location
further from the actual mistake than a directly-written `new` call's
own compiler error would have — genuinely one of the harder parts of
learning Hilt specifically, and a real, honest cost of moving
construction outside the code that uses the result.

---

## Recognizing It Elsewhere

Also recognized in: Spring Framework's `@Autowired` in Java's other
major ecosystem, solving the identical problem the identical way; a
game engine handing a `GameObject` its required `Rigidbody` or
`Collider` components rather than each component fetching its own; a
plain function's parameter list, at the smallest possible scale — the
function declares what it needs, the caller decides what to actually
pass in — dependency injection is sometimes described as exactly this
idea, applied to whole objects instead of single values.

---

## Where This Actually Breaks

The most common real mistake with Hilt specifically: reading an
`@Inject` field before Hilt has had the chance to fill it in — most
often by moving code that uses it into a constructor, an instance
initializer, or anywhere that runs before `super.onCreate(...)`
completes. Because Hilt performs field injection as part of that same
`super.onCreate(...)` call, any code that runs earlier than that sees
the field still at its default, unset value — `null`, for an object
field — producing a `NullPointerException` that reads exactly like the
dependency was never provided at all, when the real issue is only that
it was read too early.

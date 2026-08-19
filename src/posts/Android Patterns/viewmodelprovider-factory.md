# Delegating a Construction Recipe ViewModelProvider Can't Guess: ViewModelProvider.Factory

**What problem this solves.** `ViewModelProvider` can construct a plain
`ViewModel` automatically because it can call a no-argument constructor
itself, with nothing to supply. But a well-designed `ViewModel` that
needs a real collaborator — a Repository, say — shouldn't construct
that collaborator internally: per the same dependency-injection
reasoning that applies everywhere else, it should receive it from
outside, so a test can substitute a fake one. That creates a genuine
conflict: `ViewModelProvider` needs to know how to build a `ViewModel`
automatically, but it has no way to guess what value to pass for a
required constructor parameter it knows nothing about. The abstract
fix: hand `ViewModelProvider` a separate object whose entire job is
knowing the real construction recipe — built once, supplied explicitly
— so `ViewModelProvider` can delegate the actual construction decision
to something that does know how, instead of needing to guess itself.

**Classic pattern family.** This is the Gang-of-Four **Factory Method**
pattern: defining a separate method — or, here, a whole small object —
responsible for creating an object, so the code that needs an instance
doesn't have to know the concrete construction details itself.

**Where you'll meet it in Android.**
`androidx.lifecycle.ViewModelProvider.Factory` (an interface) and the
constructor overload `ViewModelProvider(ViewModelStoreOwner,
ViewModelProvider.Factory)` that accepts one.

**Terms used in this pattern.**

- **Bounded generic method parameter** (`<T extends ViewModel> T
  create(Class<T> modelClass)`) — a placeholder type restricted to
  `ViewModel` or a subclass of it, filled in fresh at each call. It
  exists so `create` can return whatever specific `ViewModel` subtype
  was actually asked for, typed correctly, rather than a generic
  `ViewModel` base reference.
- **Unchecked cast** — a cast the compiler cannot fully verify is safe
  at compile time, because the real target type is only known at the
  call site, not inside the casting code's own body. The compiler
  allows it but flags it as a genuine, accepted risk. It exists here
  because this Factory implementation only ever actually builds one
  specific `ViewModel` type, so the cast is safe in practice even
  though the compiler itself can't prove it.

**Objects and methods used.**

- **`ViewModelProvider.Factory`**
  *What it is:* an interface defining the contract for constructing a
  `ViewModel`.
  *Implementation:* `public interface Factory { <T extends ViewModel> T
  create(@NonNull Class<T> modelClass); }`.
  *Its use:* the pluggable construction strategy `ViewModelProvider`
  delegates to whenever it needs to build a `ViewModel` it can't
  construct with a plain no-argument constructor itself.
- **`Factory.create(Class<T> modelClass)`**
  *What it is:* the interface's one required method, returning `T`.
  *Implementation:* `<T extends ViewModel> T create(@NonNull Class<T>
  modelClass)`.
  *Its use:* where the real construction recipe actually lives — here,
  calling `InventoryViewModel`'s own constructor directly, supplying
  the repository this Factory itself was given when it was built.
- **`ViewModelProvider(ViewModelStoreOwner owner, ViewModelProvider.Factory factory)`**
  *What it is:* a constructor overload on `ViewModelProvider`.
  *Implementation:* `public ViewModelProvider(@NonNull
  ViewModelStoreOwner owner, @NonNull ViewModelProvider.Factory
  factory)`.
  *Its use:* the specific entry point that hands a custom Factory to
  `ViewModelProvider`, telling it to delegate to this Factory instead
  of attempting a no-argument construction on its own.

---

## The Shape

Four participants:

- **`InventoryViewModel`** — needs a real `ItemRepository`, never
  builds one itself.
- **`InventoryViewModelFactory`** — the pluggable construction
  strategy, holding the real repository and knowing how to call
  `InventoryViewModel`'s constructor with it.
- **`ViewModelProvider`** — the framework mechanism, now delegating
  construction to the given Factory instead of guessing.
- **The calling `Activity`** — supplies the real Factory, already
  holding a real repository, at the point it asks for the `ViewModel`.

The relationship: `ViewModelProvider` itself never calls `new
InventoryViewModel(...)` directly anywhere in this whole picture — that
call exists only inside `InventoryViewModelFactory.create(...)`, the
one place that actually knows both the constructor's required shape and
where to get a real value for its parameter. `ViewModelProvider`'s own
only job, once handed a Factory, is calling `create(...)` on it and
caching whatever comes back, tied to its usual survives-rotation scope
— the actual construction decision has moved entirely out of
`ViewModelProvider`'s own responsibility.

```
   Activity (holds a real ItemRepository already)
        |
        |  new InventoryViewModelFactory(itemRepository)
        v
   InventoryViewModelFactory  (knows the real recipe)
        |
        |  new ViewModelProvider(this, factory).get(InventoryViewModel.class)
        v
   ViewModelProvider
        |
        |  "I can't guess how to build this one myself --
        |   delegate to the Factory I was given"
        v
   factory.create(InventoryViewModel.class)
        |
        |  new InventoryViewModel(repository)
        v
   real InventoryViewModel instance, cached by
   ViewModelProvider exactly as any other ViewModel would be
```

---

## Mechanical Walkthrough

```java
public class InventoryViewModel extends ViewModel {
    private final ItemRepository repository;

    public InventoryViewModel(ItemRepository repository) {
        this.repository = repository;
    }
}
```

- **`private final ItemRepository repository;`** — the collaborator
  this `ViewModel` needs; note there is no default constructor here at
  all, which is exactly what makes `ViewModelProvider`'s ordinary,
  no-argument construction path impossible for this class.

```java
public class InventoryViewModelFactory implements ViewModelProvider.Factory {
    private final ItemRepository repository;

    public InventoryViewModelFactory(ItemRepository repository) {
        this.repository = repository;
    }

    @NonNull
    @Override
    public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
        return (T) new InventoryViewModel(repository);
    }
}
```

- **`class InventoryViewModelFactory implements ViewModelProvider.Factory`**
  — opts this plain class into the contract `ViewModelProvider` knows
  how to call.
- **`private final ItemRepository repository; public InventoryViewModelFactory(ItemRepository repository)`**
  — this Factory receives the real repository through its own
  constructor, exactly the same constructor-injection idea used
  everywhere else — it doesn't build one itself either.
- **`public <T extends ViewModel> T create(@NonNull Class<T> modelClass)`**
  — the one required method; `modelClass` names which `ViewModel` type
  is actually being requested, though this specific implementation
  ignores it and always builds the one type it knows about.
- **`return (T) new InventoryViewModel(repository);`** — the real
  construction, using the repository this Factory was given at its own
  construction time; the cast to `T` is required because the compiler
  can't otherwise prove a plain `InventoryViewModel` matches whatever
  `T` the caller asked for.

```java
InventoryViewModelFactory factory = new InventoryViewModelFactory(itemRepository);
InventoryViewModel viewModel = new ViewModelProvider(this, factory).get(InventoryViewModel.class);
```

- **`new InventoryViewModelFactory(itemRepository)`** — builds the
  Factory, handing it the real repository this Activity already has.
- **`new ViewModelProvider(this, factory)`** — the constructor overload
  that accepts a Factory explicitly, `this` still supplying the scope
  identity as before.
- **`.get(InventoryViewModel.class)`** — the same retrieval call as the
  plain `ViewModel` pattern, now backed by the supplied Factory instead
  of an implicit no-argument construction.

---

## Collaboration — how it actually runs

1. The Activity already has, or obtains, a real `ItemRepository` —
   a separate concern, not shown in detail here.
2. The Activity constructs `InventoryViewModelFactory`, handing it that
   real repository — this Factory object now privately holds the one
   piece of information `ViewModelProvider` itself has no way to
   obtain.
3. The Activity constructs `new ViewModelProvider(this, factory)` and
   calls `.get(InventoryViewModel.class)` on it, exactly as the plain,
   no-argument `ViewModel` pattern does, except now supplying a Factory
   as a second argument.
4. Internally, `ViewModelProvider` checks its own store first — if an
   instance already exists for this scope, it's returned directly, and
   `factory.create(...)` is never even called this time.
5. Only if no instance exists yet does `ViewModelProvider` call
   `factory.create(InventoryViewModel.class)` — the one and only place
   `new InventoryViewModel(repository)` is ever actually written and
   called, using the repository the Factory was given back in step 2.
6. The newly built instance is cached by `ViewModelProvider` exactly as
   before, surviving whatever future rotations happen, with the Factory
   itself no longer needed again for this same instance's lifetime.

---

## Why It's Shaped This Way

The design principle is **delegating a specific, non-guessable
construction decision to a separate object built specifically to know
it**, so the general-purpose framework mechanism doesn't need
special-case logic for every possible kind of `ViewModel` constructor
shape anyone might ever write.

The alternative not chosen: letting `InventoryViewModel` construct its
own `ItemRepository` internally, inside its own constructor, so
`ViewModelProvider` could keep using its ordinary no-argument
construction path with nothing extra required. The real cost: this is
exactly what dependency injection warns against — nothing outside
`InventoryViewModel` could ever substitute a fake repository for a
test, since the real one would be hard-wired inside via a direct
constructor call no external code could intercept.

The cost this pattern itself carries: an extra class and an extra
explicit construction step for every `ViewModel` that needs any
constructor parameter at all — genuinely more code than the
no-argument case, which is exactly the cost a DI framework's own
generated-Factory machinery exists to eliminate, by writing this same
boilerplate automatically instead of by hand.

---

## Recognizing It Elsewhere

Also recognized in: a class library's own factory method
(`Calendar.getInstance()` instead of a public constructor) hiding which
real concrete subclass gets built; a GUI toolkit's dialog-builder
handing off to a factory for producing the right platform-specific
native dialog implementation; a plugin loader that delegates actual
object construction to each plugin's own registered factory, since the
loader itself has no way to know any specific plugin's real constructor
requirements.

---

## Where This Actually Breaks

The most common real mistake: the unchecked cast inside
`create(Class<T> modelClass)` silently returning the wrong `ViewModel`
type when a single Factory is mistakenly reused for more than one
different `ViewModel` class without actually checking which
`modelClass` was requested. Because the cast compiles with only a
warning, not an error, and succeeds at runtime for any object — Java's
generic type erasure means the cast itself can't actually fail there —
the real failure only surfaces later, often confusingly, as a
`ClassCastException` thrown from ordinary calling code the moment it
tries to use the wrongly typed result as if it were the class it
actually asked for.

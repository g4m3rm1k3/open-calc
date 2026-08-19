# Exactly One Shared Instance: The Room Database Singleton

**What problem this solves.** Some objects genuinely must exist as
exactly one instance for a whole running program — a single database
connection, a single shared cache, a single running app's own process-
wide state. Creating more than one wastes resources at best (opening
the same underlying database file twice) and causes real correctness
bugs at worst (two independent copies silently disagreeing about what's
actually true). The abstract fix: make the class itself responsible for
guaranteeing only one instance ever exists, handing back that same
instance to every caller instead of letting anyone construct a fresh
one.

**Classic pattern family.** This is the Gang-of-Four **Singleton**
pattern directly: restrict a class to exactly one instance, and provide
a single, well-known point of access to it.

**Where you'll meet it in Android.** Hand-rolled, in application code,
most often around a Room database — `Room` provides no built-in
Singleton itself; the convention below is written by the app.

**Terms used in this pattern.**

- **`static` field** — a field belonging to the class itself, not to
  any one instance of it; exactly one copy exists no matter how many
  objects of the class are ever created. It exists here because the
  entire point of a Singleton is one shared value for the whole class,
  and only a `static` field can hold something that isn't duplicated
  per instance.
- **`volatile` keyword** — a field modifier guaranteeing that once one
  thread writes a new value to it, every other thread sees that new
  value immediately, instead of possibly reading a stale copy from its
  own local cache. It exists specifically because multiple threads
  might call this class's accessor around the same moment; without it,
  a second thread could see an outdated `null` even after a first
  thread has already finished building the real object.
- **`synchronized` block** — a region of code only one thread may be
  executing at a time, for a given lock object; any other thread
  attempting to enter waits until the first one leaves. It exists
  because "check whether the instance already exists, and if not,
  build one" is two separate steps, not one atomic operation — without
  this, two threads could both see "not built yet" at the same moment
  and both proceed to build a duplicate.
- **Double-checked locking** — the specific idiom of checking the
  condition once *before* acquiring a lock (fast, for the overwhelmingly
  common case where the instance already exists) and checking it again
  *after* acquiring the lock (safe, in case another thread finished
  building it while this one was waiting). It exists as a deliberate
  compromise: synchronizing every single call would be correct but slow,
  forcing every call forever to wait on a lock even once the instance
  obviously already exists; checking only once with no lock at all
  would be fast but unsafe.

**Objects and methods used.**

- **`RoomDatabase`**
  *What it is:* Room's abstract base class for a database access point.
  *Implementation:* `public abstract class RoomDatabase`, subclassed
  here as `AppDatabase`, carrying the class-level `@Database(entities =
  {Contact.class}, version = 1)` annotation.
  *Its use:* the required base type for any Room database; naturally a
  good Singleton candidate, since only one is meant to exist per
  underlying database file for the app's whole life — Room's own
  generated implementation doesn't even allow `AppDatabase` to be
  constructed with a plain `new`, since it stays `abstract`.
- **`Room.databaseBuilder(Context, Class, String)`**
  *What it is:* a `static` factory method on the `Room` class.
  *Implementation:* `public static <T extends RoomDatabase> Builder<T>
  databaseBuilder(Context context, Class<T> klass, String name)`,
  returning a further chainable `Builder` object whose own `.build()`
  call finally produces the real database instance.
  *Its use:* the actual construction path for a Room database — nothing
  before `.build()` in this chain has produced a real object yet.
- **`Context.getApplicationContext()`**
  *What it is:* an instance method on `Context`.
  *Implementation:* `public abstract Context getApplicationContext()`.
  *Its use:* returns the one process-wide `Application` context,
  instead of whatever more narrowly scoped context (an `Activity`,
  say) happened to be passed in — critical, because storing a narrower
  context inside a long-lived `static` field would keep that narrower
  object (and everything it references) alive for the rest of the
  process's life.

---

## The Shape

Three participants:

- **`AppDatabase`** — both the Singleton class itself and the sole
  authority over its own one instance.
- **The `static volatile instance` field** — the one shared storage
  location every caller ultimately reads from.
- **Any caller, anywhere in the app** — never allowed to build an
  `AppDatabase` directly (it's `abstract`, and even if it weren't, the
  convention forbids it); the only path in is `getInstance(context)`.

The relationship: `getInstance` either returns the already-built shared
instance or builds it exactly once, guarded so that even multiple
threads calling at nearly the same moment can't end up creating more
than one.

```
  Thread A                          Thread B
     |  getInstance(ctx)               |  getInstance(ctx)
     v                                 v
  instance == null? --- yes ---    instance == null? --- yes ---
     |                                 |
     v                                 v
  synchronized(AppDatabase.class) -- one thread waits here --
     |
     v
  instance == null?  (checked again, inside the lock)
     |
    yes -> build the real instance, assign it
     |
     v
  return instance   (both threads eventually get the SAME object)
```

---

## Mechanical Walkthrough

```java
@Database(entities = {Contact.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {

    public abstract ContactDao contactDao();

    private static volatile AppDatabase instance;

    public static AppDatabase getInstance(Context context) {
        if (instance == null) {
            synchronized (AppDatabase.class) {
                if (instance == null) {
                    instance = Room.databaseBuilder(
                            context.getApplicationContext(),
                            AppDatabase.class,
                            "contacts.db"
                    ).build();
                }
            }
        }
        return instance;
    }
}
```

- **`private static volatile AppDatabase instance;`** — the single
  shared storage location, `static` so it belongs to the class and not
  any instance, `volatile` so a write on one thread is guaranteed
  visible to every other thread's very next read of it, and initialized
  to `null` implicitly, meaning "not built yet."
- **`if (instance == null)`** — the first check, run with no locking at
  all. For the overwhelmingly common case (the instance was already
  built by some earlier call), this alone is enough to skip straight to
  `return instance` without ever paying the cost of acquiring a lock.
- **`synchronized (AppDatabase.class)`** — only entered on the rare
  first-ever call where the outer check found `null`. Using the class
  object itself (`AppDatabase.class`) as the lock means any other
  thread attempting to enter this same block, on this same class, has
  to wait its turn.
- **`if (instance == null)`** (the inner, repeated check) — necessary
  because between this thread's outer check and actually acquiring the
  lock, another thread could have already finished building the
  instance while this one was waiting to get in; re-checking here is
  what prevents a second, duplicate database from being built.
- **`Room.databaseBuilder(context.getApplicationContext(), AppDatabase.class, "contacts.db").build()`**
  — the actual construction: names the application-wide context to
  build against, the concrete database class, and the real underlying
  file name, then `.build()` produces the real object.
- **`instance = ...`** — the one and only assignment this field ever
  receives for the life of the process.
- **`return instance;`** — reached by every call, whether it just built
  a brand-new instance or skipped straight here from the very first,
  unlocked check.

---

## Collaboration — how it actually runs

1. The first call to `getInstance(context)` from anywhere in the app
   finds `instance` still `null`, enters the `synchronized` block,
   confirms it's still `null` on the second check, and builds the real
   database.
2. Every later call, from anywhere in the app, finds `instance` already
   non-null on the very first, unlocked check and returns immediately —
   the `synchronized` block is never entered again for the rest of the
   process's life.
3. If two threads happen to call `getInstance` for the very first time
   at nearly the same moment, both may see `null` on their outer,
   unsynchronized check simultaneously — but only one can actually be
   inside the `synchronized` block at a time. Whichever gets there
   second finds `instance` already non-null on its own inner check, and
   simply returns the first thread's result instead of building a
   duplicate.

---

## Why It's Shaped This Way

The design principle is **exactly one shared instance for a resource
where more than one would be wasteful or actively wrong** — opening the
same underlying SQLite file twice from the same process serves no
purpose and risks real inconsistency between two independent copies.

The alternative not chosen: build a fresh `AppDatabase` wherever it's
needed, or hand it out through ordinary constructor injection instead
of a hand-rolled static accessor. The real cost avoided by choosing
Singleton here: constructor injection still needs *something* to
guarantee there's only one in the first place — a hand-rolled static
Singleton is the traditional way to provide that guarantee directly,
without first needing a dependency-injection framework wired into the
project at all.

The cost this pattern itself carries: a `static` field is global,
shared, mutable state, invisible in any class's own constructor
signature — which makes test setup genuinely harder, since there's no
clean way to hand one specific test a fake database without also
resetting or working around this same shared field. This is exactly the
problem constructor injection is built to avoid, which is why modern
Android guidance increasingly prefers a dependency-injection framework
handing out one shared instance instead of a hand-rolled static
Singleton like this one.

---

## Recognizing It Elsewhere

Also recognized in: a print spooler serving an entire operating system;
a single shared configuration object read throughout one running
application; a hardware device driver representing one specific,
non-duplicable physical device; a logging framework's single shared
logger instance collecting output from every part of a program.

---

## Where This Actually Breaks

The most common real mistake: forgetting `context.getApplicationContext()`
and instead storing whatever `Context` happened to be passed in — an
`Activity`'s own context — directly inside the long-lived `static`
field. Because that field survives for the entire app process, this
pins that specific `Activity` object in memory for the rest of the
process's life, long after the user has left that screen and the
system wants to reclaim it — a textbook Android memory leak. Everything
still visibly works, which is exactly what makes it easy to miss until
a memory profiler reveals an `Activity` instance that should have been
destroyed but never was.

# Hiding Data Sources Behind One Object: The Repository Pattern

**What problem this solves.** A screen that needs data — a list of
contacts, say — often has more than one real place that data could
come from: a local database cached on the device, a remote network API,
sometimes both combined. The logic for deciding which source to use,
when to fall back to another, and how to reconcile them doesn't belong
copy-pasted into every screen that happens to need contacts. The
abstract fix: put one object between the data's real sources and
everything that consumes data, so a consumer can ask for "the contacts"
without knowing or caring whether the answer came from a local
database, a network call, or some blend of the two.

**Classic pattern family.** Not from the Gang-of-Four book — this comes
from later enterprise-application-architecture literature (Martin
Fowler's *Patterns of Enterprise Application Architecture* names it
directly). Its own idea: a Repository presents an interface that looks
like a simple in-memory collection of objects, while actually mediating
between the app and one or more real underlying data sources hidden
behind that appearance.

**Where you'll meet it in Android.** No single official base class —
by convention, it's a plain class sitting between a `ViewModel` and
real data sources, most often a local database (commonly built with
Room) and a remote API client (commonly built with Retrofit); this
pattern's own shape doesn't depend on either specific library.

**Terms used in this pattern.**

- **Interface** — a contract naming methods with no implementation of
  their own. It exists here so the repository's dependencies are named
  by what they promise to do, not by which concrete class actually does
  it — letting a real implementation be swapped (a fake for testing, a
  different local store later) without changing the repository's own
  code.
- **Constructor injection** — a class receiving the objects it depends
  on as constructor parameters, rather than constructing them itself
  inside its own body. It exists so this class doesn't need to know
  *how* to build its dependencies, only that it needs them — a plain,
  manual version of the idea, with no framework involved yet.

**Objects and methods used.**

- **`ContactRepository`**
  *What it is:* a plain class, the pattern's own subject.
  *Implementation:* holds a `ContactDao` and a `ContactApiService`,
  received through its constructor; exposes one public method,
  `getContacts()`.
  *Its use:* the single object every consumer talks to instead of
  talking to either real source directly.
- **`ContactDao`**
  *What it is:* an interface representing the local, on-device source.
  *Implementation:* `List<Contact> getAll()` and
  `void insertAll(List<Contact> contacts)` — both abstract, no bodies of
  their own.
  *Its use:* gives the repository a local source it can call without
  knowing whether it's really backed by a database, a flat file, or
  something else — that choice is made wherever this interface is
  actually implemented, not here.
- **`ContactApiService`**
  *What it is:* an interface representing the remote source.
  *Implementation:* `List<Contact> fetchContacts()` — abstract, no body.
  *Its use:* the same idea as `ContactDao`, for whatever real network
  client actually implements it.

---

## The Shape

Three participants:

- **`ContactRepository`** — the mediator. Holds references to both real
  sources and decides, internally, which one to actually ask.
- **`ContactDao`** — one real source (local), known to the repository
  only through this interface.
- **`ContactApiService`** — another real source (remote), known to the
  repository only through this interface.
- **The consumer** (typically a `ViewModel`, not shown here) — holds a
  reference only to `ContactRepository`, never to either source
  directly.

The relationship: the consumer's only contact with data is
`repository.getContacts()`; it has no way to reach `ContactDao` or
`ContactApiService` directly even if it wanted to, because it was never
given a reference to either. Neither source knows the other exists, or
that a repository is even mediating them — each one only ever receives
calls, from the repository, and returns a plain result. All of the
actual policy — try local first, fall back to remote, write remote
results back to local — lives in exactly one place: inside the
repository's own method body.

```
   ViewModel (consumer)
        |
        |  getContacts()
        v
   ContactRepository ------ calls ------> ContactDao (local)
        |
        |------------------ calls ------> ContactApiService (remote)
```

---

## Mechanical Walkthrough

```java
public class ContactRepository {
    private final ContactDao localDao;
    private final ContactApiService remoteService;

    public ContactRepository(ContactDao localDao, ContactApiService remoteService) {
        this.localDao = localDao;
        this.remoteService = remoteService;
    }

    public List<Contact> getContacts() {
        List<Contact> cached = localDao.getAll();
        if (!cached.isEmpty()) {
            return cached;
        }
        List<Contact> fresh = remoteService.fetchContacts();
        localDao.insertAll(fresh);
        return fresh;
    }
}
```

- **`private final ContactDao localDao; private final ContactApiService remoteService;`**
  — both fields are typed as the interfaces, never a concrete class,
  which is what makes it possible to hand this repository a real Room-
  backed `ContactDao` in the running app and a fake, in-memory one in a
  test, with no change to any line below.
- **`public ContactRepository(ContactDao localDao, ContactApiService remoteService)`**
  — the constructor is the *only* place these two dependencies enter
  this object; nothing inside this class ever calls `new` to build
  either one, which is the constructor-injection term above made
  concrete.
- **`List<Contact> cached = localDao.getAll();`** — asks the local
  source first, unconditionally, every single call.
- **`if (!cached.isEmpty()) { return cached; }`** — the actual
  local-first policy: if the local source already has anything at all,
  trust it and stop here, never touching the network. This one
  condition is the entire caching strategy this repository implements.
- **`List<Contact> fresh = remoteService.fetchContacts();`** — only
  reached when the local source had nothing — the fallback path.
- **`localDao.insertAll(fresh);`** — writes the freshly fetched network
  data back into the local source *before* returning it, so the very
  next call to `getContacts()` finds it during the first `getAll()`
  check and skips the network entirely — this single line is what turns
  a one-time fetch into a lasting cache.
- **`return fresh;`** — hands back the same data just fetched and
  cached, so the very first call returns real data instead of an empty
  list one call cycle earlier than the cache it just built.

---

## Collaboration — how it actually runs

1. The consumer calls `repository.getContacts()` — the only call it
   ever makes; it has no visibility into what happens next.
2. The repository calls `localDao.getAll()` first, every time, with no
   exception.
3. If that result is non-empty, the repository returns it immediately —
   the remote source is never contacted on this path at all.
4. If that result is empty, the repository calls
   `remoteService.fetchContacts()` next.
5. Before returning the network result, the repository writes it back
   through `localDao.insertAll(...)` — so that the *next* time step 2
   runs, for any consumer, it finds this same data already local and
   takes the fast path in step 3 instead of repeating step 4.

---

## Why It's Shaped This Way

The design principle is a **single point of truth for how to get a
piece of data**, so the caching/fallback policy exists in exactly one
place instead of being duplicated at every call site that happens to
need contacts.

The alternative not chosen: letting the `ViewModel` or UI code call
`ContactDao` and `ContactApiService` directly itself, deciding on the
spot which one to use. The real cost: that decision logic — check the
cache, fall back to the network, write the result back — would have to
be copied into every single screen that ever needs contacts, and
changing the caching policy later means finding and editing every one
of those call sites instead of one repository method.

The cost this pattern itself carries: an extra object and an extra
layer of indirection between the UI and the data, which buys nothing in
an app with only one real data source and no caching policy worth
naming — it earns its cost specifically once there's more than one real
source, or the logic for choosing between them stops being trivial.

---

## Recognizing It Elsewhere

Also recognized in: an ORM's session object hiding raw SQL from
application code behind method calls that look like working with
plain in-memory objects; a CDN edge node transparently serving a cached
copy or fetching from the origin server on a cache miss; a web
browser's own HTTP cache layer sitting between page code and the
network.

---

## Where This Actually Breaks

The most common real mistake: calling a slow operation like
`remoteService.fetchContacts()` synchronously, directly on the calling
thread, exactly as shown in the simplified walkthrough above. In a real
Android app this either throws at runtime (the platform actively
forbids real network calls on the main/UI thread) or, for a source that
doesn't throw, freezes the UI for as long as the call takes — a real
repository has to push that call onto a background thread and return
its result asynchronously instead. A second real mistake: a cache check
with no notion of expiration, exactly as shown here — `cached` being
non-empty is treated as "still good" forever, so once anything has ever
been cached, the network is never consulted again even after the real
remote data has since changed. The symptom: a user swears the data was
updated (maybe even on another device) but this app keeps showing old
values indefinitely.

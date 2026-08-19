# Requesting Without Knowing Who Answers: Intent

**What problem this solves.** One component needs to ask another
component to do something, or announce that something has happened, but
often doesn't know — and shouldn't need to know — exactly which
concrete class will actually handle that request. It might be a
specific class within the same app, or it might be an entirely
different app the system chooses on the user's behalf, the way a share
action works. The requesting code shouldn't have to hard-code that
decision. The abstract fix: describe the desired action and its data as
a standalone message object, hand it to a central dispatching system,
and let that system — not the sender — decide which real component
actually receives and handles it.

**Classic pattern family.** This is Android's own thing more than any
single clean Gang-of-Four label. It borrows real elements from
**Command** (an action wrapped up as a standalone object) and from
**Mediator** (a central object coordinating communication between
otherwise-unconnected participants, so sender and receiver never hold a
direct reference to each other) — but forcing either single label onto
it undersells what's actually distinctive here: resolution can cross
app and even process boundaries entirely, chosen by the system,
sometimes with the user picking between several matching apps. Worth
learning as its own shape, not a case closed by naming a GoF pattern.

**Where you'll meet it in Android.** `android.content.Intent`, resolved
and dispatched by the Android system, sent off through entry points
such as `Context.startActivity(Intent)`.

**Terms used in this pattern.**

- **Action** — a `String` constant (`Intent.ACTION_VIEW`, here) naming
  the general *kind* of operation being requested — "view this," not
  "open in this specific app." It exists so a request can describe what
  should happen in the abstract, leaving which concrete component
  actually performs it entirely up to resolution.
- **Extras** — a set of additional key-value data attached to an
  `Intent`, carrying information the receiving component needs beyond
  just the action and data. They exist because an `Intent` has to be
  able to carry arbitrary structured data along with the request
  itself, not only its two primary fields.

**Objects and methods used.**

- **`Intent`**
  *What it is:* a class representing an abstract description of an
  operation to be performed, or an event that has occurred.
  *Implementation:* `public class Intent`, with constructors including
  `Intent(String action, Uri uri)` (implicit) and `Intent(Context
  packageContext, Class<?> cls)` (explicit), plus `putExtra(String,
  ...)` for attaching further data.
  *Its use:* the standalone message object itself — built once, handed
  off, and never touched again by the sender.
- **`Intent.ACTION_VIEW`**
  *What it is:* a `public static final String` constant on `Intent`.
  *Implementation:* `public static final String ACTION_VIEW =
  "android.intent.action.VIEW"`.
  *Its use:* names the general kind of request being made, without
  naming any specific component to fulfill it.
- **`Intent(Context packageContext, Class<?> cls)`** (the explicit
  constructor)
  *What it is:* a constructor on `Intent`.
  *Implementation:* `public Intent(Context packageContext, Class<?>
  cls)`.
  *Its use:* names one specific target component directly by its class,
  skipping the system's usual "which component matches this action"
  resolution step, while still going through the same dispatch
  mechanism.
- **`Intent.putExtra(String name, ...)`**
  *What it is:* an instance method on `Intent` (many overloads for
  different value types), returning `Intent`.
  *Implementation:* for example, `public Intent putExtra(String name,
  long value)`.
  *Its use:* attaches one additional piece of data to the `Intent` by
  name, to be read back later by whatever component ends up actually
  receiving it.
- **`Context.startActivity(Intent)`**
  *What it is:* an instance method on `Context`, returning `void`.
  *Implementation:* `public abstract void startActivity(Intent
  intent)`.
  *Its use:* hands the finished `Intent` object off to the system for
  resolution and dispatch — the actual point where control passes out
  of the sender's own code entirely.

---

## The Shape

Four participants:

- **The sender** — builds an `Intent` describing what it wants done and
  hands it to the system.
- **The `Intent` object itself** — a standalone, self-contained
  description of the requested action, carrying no reference to any
  real receiving component at all.
- **The Android system** — the actual dispatcher, responsible for
  resolving which real component should receive this specific `Intent`.
- **The receiver** — whatever component the system ultimately decides
  on, entirely unknown to the sender at the moment the `Intent` was
  built.

The relationship: the sender never holds a direct reference to the
receiver — not even for the explicit form, where a specific class is
named but the sender still goes through `startActivity(...)` rather
than calling anything on that class directly, because the receiving
`Activity` has to be created and started by the system itself, never
constructed with `new` by app code. For the implicit form, the sender
may not even know which single component, or which app, will end up
handling the request at all — possibly not decided until the user picks
one from several installed apps offering to handle the same action.

```
   sender code
        |
        |  new Intent(ACTION_VIEW, uri)  -- builds a standalone message,
        |                                   no receiver reference at all
        v
      Intent object
        |
        |  startActivity(intent)
        v
   Android system   (the dispatcher / resolver)
        |
        |--- explicit: goes to the exact class named
        |--- implicit: resolved to whichever installed
        |               component(s) declare they handle
        |               this action -- possibly user-chosen
        v
   receiving component (unknown to the sender at build time,
   for the implicit case)
```

---

## Mechanical Walkthrough

```java
Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com"));
startActivity(intent);
```

The explicit form skips resolution and names a target directly, while
still going through the exact same dispatch call:

```java
Intent intent = new Intent(this, ContactDetailActivity.class);
intent.putExtra(EXTRA_CONTACT_ID, contact.getId());
startActivity(intent);
```

- **`new Intent(Intent.ACTION_VIEW, Uri.parse("https://example.com"))`**
  — builds an implicit `Intent`: an action naming *what* should happen,
  and a `Uri` naming *what it should happen to*, with no specific
  component named anywhere in this call.
- **`startActivity(intent);`** — the moment control actually passes to
  the system; nothing about which real component ends up receiving this
  is decided by this line, only that resolution should now happen.
- **`new Intent(this, ContactDetailActivity.class)`** — builds an
  explicit `Intent` instead: `this` supplies the package context, and
  `ContactDetailActivity.class` names the exact target directly — no
  resolution step is needed, since the receiver is already known.
- **`intent.putExtra(EXTRA_CONTACT_ID, contact.getId())`** — attaches
  one additional piece of data by name; the receiving `Activity` will
  read this back later under the exact same key string.
- **`startActivity(intent);`** — the same dispatch call as before, even
  though this `Intent` already names its target directly — the explicit
  form still goes through the system rather than the sender ever
  constructing `ContactDetailActivity` itself.

---

## Collaboration — how it actually runs

1. The sender constructs an `Intent` — explicit or implicit — a plain
   object at this point, doing nothing on its own.
2. If needed, the sender attaches further data with `putExtra(...)` —
   still nothing dispatched yet.
3. The sender calls `startActivity(intent)` — this is the moment
   control actually passes to the system; the sender's own code has no
   further say in what happens next.
4. The system resolves the `Intent`: for an explicit one, it goes
   directly to the named class; for an implicit one, the system checks
   every installed app's declared capabilities for anything matching
   the given action and data, and either starts the single match
   automatically or presents the user a choice among several.
5. The chosen receiving component is created, or reused, by the
   system — never by the sender — and receives the same `Intent`
   object, reading its action, data, and any extras to determine what
   it's actually being asked to do.

---

## Why It's Shaped This Way

The design principle is **decoupling a request from any specific
component capable of fulfilling it**, so the sender's own code never
needs to hard-code which concrete class, or even which app, actually
performs the action.

The alternative not chosen: the sender directly constructing and
calling into a specific target component itself. The real cost: this
would only ever work for a receiver within the same app that the
sender already has a reference to, and would make swapping in a
different or user-chosen handler at all impossible for anything
crossing an app boundary — exactly what an implicit, share- or
view-style `Intent` routinely does.

The cost this pattern itself carries: an `Intent`-based call is far
less direct and far less type-checked than an ordinary method call — a
receiver has to read expected extras back out by string key, with no
compiler-enforced guarantee that a sender actually provided them, or
provided them under a matching key.

---

## Recognizing It Elsewhere

Also recognized in: a postal system, where a letter is addressed by a
general description — an address — rather than the sender holding a
direct connection to the recipient; a message bus in a microservices
architecture, where a service publishes an event without knowing, or
caring, which other services are actually subscribed to receive it; an
operating system's own "open with" file-type association mechanism,
resolving a file to whichever installed application registers itself as
capable of opening it; a restaurant order sent to the kitchen by ticket
rather than the server personally walking back and cooking it
themselves.

---

## Where This Actually Breaks

The most common real mistake: reading an extra back with the wrong key,
or the wrong expected type, from what the sender actually put in — this
fails silently at runtime rather than at compile time. A wrong key
returns a default value instead of throwing; a wrong type for a typed
getter can throw a runtime exception that names the mismatch but gives
no hint which of possibly many `putExtra` calls in the whole codebase
was actually responsible. A second real mistake, specific to implicit
`Intent`s: assuming a matching app will always be installed and calling
`startActivity(intent)` with no handling for the case where zero
components declare they can handle the given action — this throws an
`ActivityNotFoundException` at runtime on any device that genuinely
lacks a matching app, something that may never surface during the
original developer's own testing if their device happens to already
have a suitable app installed.

# A Snapshot Only the Original Understands: onSaveInstanceState

**What problem this solves.** An object sometimes needs to be destroyed
and later recreated as if nothing happened, from the outside
perspective of whoever's using it — but whatever's responsible for that
recreation may have no idea what "the same as before" actually means
for this specific object. Only the object itself knows which of its own
internal details are worth restoring. The abstract fix: let the object
capture a snapshot of just the state it cares about, hand that snapshot
to an outside caretaker to hold onto — without the caretaker peeking
inside or understanding it — and later give that same snapshot back to
a new instance of the object so it can restore itself.

**Classic pattern family.** This is the Gang-of-Four **Memento**
pattern: capturing and externalizing an object's internal state without
violating its own encapsulation, so that state can be restored later,
with the object that captured it being the only one that ever actually
interprets what's inside.

**Where you'll meet it in Android.** `Activity.onSaveInstanceState(Bundle
outState)`, called before an `Activity` may be destroyed for a reason
it can survive (a rotation, for example), and the matching `Bundle
savedInstanceState` parameter handed back into `onCreate(Bundle)` when
that `Activity` is recreated.

**Terms used in this pattern.**

- **String constant as a key** — a fixed, named string used
  consistently as a lookup key into the `Bundle`, defined once rather
  than repeated as a literal at every use. It exists so a typo at one
  of the two use sites (saving versus restoring) becomes a single
  missed constant to fix, instead of two separately typed strings that
  quietly stop matching each other.
- **`static final` field** — combining `static` (one shared copy per
  class) and `final` (assigned once, never reassigned). It exists here
  as the standard idiom for exactly this kind of fixed, shared constant.

**Objects and methods used.**

- **`Bundle`**
  *What it is:* a key-value container class.
  *Implementation:* `public final class Bundle`, with methods including
  `public void putString(@Nullable String key, @Nullable String value)`
  and `public String getString(@Nullable String key)`, among others for
  other value types.
  *Its use:* the Memento object itself — the externalized snapshot of
  whatever internal state this `Activity` decides is worth keeping.
- **`Activity.onSaveInstanceState(Bundle outState)`**
  *What it is:* a `protected` instance method on `Activity`, returning
  `void`.
  *Implementation:* `protected void onSaveInstanceState(@NonNull Bundle
  outState)`.
  *Its use:* called by the system before an `Activity` might be
  destroyed for a reason it could later be recreated from, specifically
  to give this `Activity` a chance to write its own state into the
  `Bundle` it's handed — that `Bundle` already exists when this method
  runs; the method's job is only to add to it.
- **`Bundle.putString(String key, String value)`**
  *What it is:* an instance method on `Bundle`, returning `void`.
  *Implementation:* `public void putString(@Nullable String key,
  @Nullable String value)`.
  *Its use:* the actual act of writing one piece of state into the
  snapshot, under a chosen key.
- **`Bundle.getString(String key)`**
  *What it is:* an instance method on `Bundle`, returning `String`.
  *Implementation:* `public String getString(@Nullable String key)`.
  *Its use:* reads back a previously saved value by the same key it was
  written under — returns `null` if that key was never written, or the
  `Bundle` itself is entirely absent.

---

## The Shape

Four participants:

- **This `Activity` instance, about to be destroyed** — the only one
  that knows which of its own fields (a typed-but-unsaved note, here)
  are actually worth keeping.
- **The `Bundle` (`outState`)** — the Memento itself, an opaque
  snapshot this `Activity` writes into, but that means nothing to
  whoever is carrying it around.
- **The Android system** — the caretaker, responsible for holding this
  `Bundle` across the destroy/recreate boundary and handing it back
  later, without ever looking inside it or interpreting a single value.
- **The next `Activity` instance, created fresh afterward** — receives
  the exact same `Bundle` back, and is the only other party that ever
  reads what's inside it.

The relationship: the system treats the `Bundle` purely as an opaque
parcel carried across the gap between one `Activity` object's
destruction and its replacement's creation — it never inspects
individual keys, never validates what's inside, and has no idea what
any given key even means. Only the `Activity` class itself, on both the
writing end and the reading end, actually understands what's stored —
the core Memento idea: the object being snapshotted is the only one
that ever really understands its own snapshot.

```
   Activity instance #1 (about to be destroyed)
        |
        |  onSaveInstanceState(outState)  -- writes its own chosen state
        v
      Bundle   (the Memento -- opaque to everyone but the Activity class)
        |
        |  held by the system (the caretaker) across the gap
        v
   Activity instance #2 (newly created, replacing #1)
        |
        |  onCreate(savedInstanceState)  -- reads the same Bundle back
        v
   restored to look the same as instance #1 did, from the outside
```

---

## Mechanical Walkthrough

```java
public class ContactDetailActivity extends AppCompatActivity {

    private static final String KEY_DRAFT_NOTE = "draft_note";
    private EditText noteField;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_contact_detail);
        noteField = findViewById(R.id.note_field);

        if (savedInstanceState != null) {
            String draft = savedInstanceState.getString(KEY_DRAFT_NOTE);
            noteField.setText(draft);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putString(KEY_DRAFT_NOTE, noteField.getText().toString());
    }
}
```

- **`private static final String KEY_DRAFT_NOTE = "draft_note";`** —
  the single, shared key both the write side and the read side use;
  defined once so a typo can only happen in one place, not two.
- **`if (savedInstanceState != null)`** — distinguishes "this Activity
  is being recreated" from "this is a genuinely first-ever launch,"
  since a fresh launch's `onCreate` always receives `null` here — only
  a recreation carries a real, filled `Bundle` back in.
- **`savedInstanceState.getString(KEY_DRAFT_NOTE)`** — reads back
  exactly what was written under this same key, whenever it was
  written, by a previous instance of this same class.
- **`noteField.setText(draft)`** — the actual restoration: writes the
  recovered value back into the live widget, making the new instance
  visually indistinguishable from the destroyed one it replaced.
- **`@Override protected void onSaveInstanceState(Bundle outState)`** —
  the write side of the same contract; `outState` is not constructed
  here — it's handed in already existing, ready to be added to.
- **`super.onSaveInstanceState(outState)`** — lets `AppCompatActivity`'s
  own base implementation save whatever state it independently cares
  about (view hierarchy state, for instance) into the same `Bundle`,
  alongside whatever this subclass adds next.
- **`outState.putString(KEY_DRAFT_NOTE, noteField.getText().toString())`**
  — the actual capture: reads the live, current text out of the widget
  and writes it into the snapshot under the shared key, ready to be
  handed back later.

---

## Collaboration — how it actually runs

1. The system decides this `Activity` may be destroyed for a survivable
   reason (a rotation, for example) — before actually destroying it, it
   calls `onSaveInstanceState(outState)` on the current instance,
   handing it an already-created, empty `Bundle`.
2. Inside that call, this `Activity`'s own code decides what's worth
   keeping — here, whatever text has been typed but not yet saved
   anywhere else — and writes it into the `Bundle` under a chosen key.
3. The system takes the now-filled `Bundle` and holds onto it purely as
   an opaque object, with no interpretation of its contents at all,
   while the old `Activity` instance is actually destroyed.
4. The system creates a brand-new `Activity` instance to replace it,
   and calls `onCreate(savedInstanceState)` on this new instance,
   passing the exact same `Bundle` from step 2 as the argument.
5. This new instance checks whether `savedInstanceState` is non-null
   and, if so, reads back the same key it knows it wrote under,
   restoring its own field to match what the destroyed instance had.

---

## Why It's Shaped This Way

The design principle is **preserving encapsulation while still allowing
state to be captured and restored**: the object being snapshotted
decides what matters and how to represent it, while whoever's
responsible for carrying that snapshot around — here, the whole Android
system — never has to understand or depend on its internal shape.

The alternative not chosen: letting the system inspect and copy an
`Activity`'s own fields directly, by reflection or some other generic
mechanism, with no explicit save/restore code written by the `Activity`
itself. The real cost avoided: the system has no way to know which
fields are meaningful to restore (a cached reference to a `View`, say,
would be actively wrong to blindly copy into a new instance) versus
which are safe or necessary — only the `Activity`'s own author actually
knows that distinction, which is exactly why this pattern hands the
decision to the object itself rather than to whatever's carrying the
snapshot.

The cost this pattern itself carries: state genuinely has to be
manually written into and read back out of the `Bundle`, by hand, for
every single field worth preserving — nothing about this is automatic,
and forgetting either half (the write in `onSaveInstanceState`, or the
matching read in `onCreate`) fails silently, producing no error, only
state that simply doesn't come back.

---

## Recognizing It Elsewhere

Also recognized in: a video game's save file, capturing just the state
that matters (position, inventory, progress) without the game engine's
save system needing to understand what any of it means; an undo
system's snapshot of a document's contents before an edit, held by an
undo manager that never interprets the snapshot itself; a database
transaction's savepoint, letting the system roll back to a captured
state without the transaction manager needing to understand the
meaning of the data itself; a version-control commit, an opaque,
restorable snapshot from the point of view of the tool storing it.

---

## Where This Actually Breaks

The most common real mistake: saving a value under one string key
literal in `onSaveInstanceState` and typing that key slightly
differently — a typo, a copy-paste that wasn't updated — in `onCreate`.
Because `Bundle.getString(...)` with a key that was never actually
written simply returns `null` instead of throwing any error, this fails
completely silently: the app runs, rotates, and appears to work, except
this one specific piece of state quietly resets to its default every
single time, with nothing in the logs or behavior pointing at the
mismatched key as the cause.

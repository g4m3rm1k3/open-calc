# Lesson 15: Fragments and the Fragment Lifecycle

**What you will build:** a real `Fragment`, hosted inside a real
`Activity`, logging its own lifecycle callbacks alongside the
`Activity`'s own (this arc's Lesson 11) — proven, by real, interleaved
Logcat output, to run on a real, separate, layered schedule, not simply
mirroring the host `Activity` one-for-one.

**What you need to know first:** [Lesson 11](lesson-11-the-activity-lifecycle.md)
(the real `Activity` lifecycle this lesson layers on top of) and
[Lesson 13](lesson-13-findviewbyid-and-viewbinding.md) (ViewBinding,
reused inside this lesson's own `Fragment`).

**Terms introduced in this lesson:**
- **`Fragment`** — a real, reusable piece of an `Activity`'s UI and
  behavior, with its own lifecycle, hosted inside a real container view.
- **`FragmentManager`** — the real, `Activity`-owned object managing
  which `Fragment`s are currently added, and their own transactions.
- **`onCreateView`** — a real `Fragment`-specific lifecycle method,
  with no direct `Activity` equivalent, responsible for inflating and
  returning that `Fragment`'s own layout.

**Objects and methods used:**

**`Fragment.onCreateView`**
- *What it is:* a real method on `androidx.fragment.app.Fragment`.
- *Implementation:* `public View onCreateView(LayoutInflater inflater,
  ViewGroup container, Bundle savedInstanceState)` — confirmed against
  the real AndroidX signature; returns the real, inflated root `View`
  for this fragment's own UI.
- *Its use:* this lesson's own `ItemListFragment` overrides it directly,
  proven to run at a real, specific point relative to the host
  `Activity`'s own lifecycle.

---

## Concept Unit: A Real `Fragment`, Hosted Inside a Real `Activity`

### The Problem

An `Activity` (this arc's own Lesson 11) represents one whole real
screen. Breaking that screen into independent, reusable pieces — a list
on the left, a detail panel on the right, on a real tablet-sized screen
— needs something smaller than a whole `Activity`. Does Android provide
a real, distinct construct for this?

### Introduce the Concept in Isolation

```java
public class ItemListFragment extends Fragment {
    private static final String TAG = "ItemListFragment";

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                              Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView");
        return inflater.inflate(R.layout.fragment_item_list, container, false);
    }
}
```

```xml
<!-- activity_main.xml -->
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragmentContainer"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
```

```java
if (savedInstanceState == null) {
    getSupportFragmentManager()
        .beginTransaction()
        .add(R.id.fragmentContainer, new ItemListFragment())
        .commit();
}
```

Running this, real, observed Logcat output confirms `onCreateView` ran,
and the real screen shows `fragment_item_list.xml`'s own content,
hosted inside the plain `FrameLayout` container declared in the
`Activity`'s own layout. `ItemListFragment` is a real, independent,
reusable piece — the identical layout and Java class could be hosted
inside a genuinely different `Activity` with no change to
`ItemListFragment` itself.

### Discard

This proof is disposable; the full, real lifecycle-logging version, next,
is this lesson's actual subject.

### Mechanical Walkthrough

- `extends Fragment` — **(a) first appearance** of `Fragment` itself as
  a real, distinct base class, separate from `Activity`.
- `onCreateView(LayoutInflater inflater, ViewGroup container, Bundle
  savedInstanceState)` — **(a) first appearance** of this real, required
  method, confirmed in this lesson's Header; `inflater.inflate(...,
  container, false)` — **(b) hard concept reappearing**, the identical
  `LayoutInflater` mechanism this arc's own Lesson 14 already proved for
  a `RecyclerView` row, here inflating a whole fragment's layout instead
  of one row.
- `<FrameLayout android:id="@+id/fragmentContainer" .../>` — **(a) first
  appearance** of `FrameLayout`: a real, simple `ViewGroup` whose real
  job here is purely to mark *where* a fragment's own view tree gets
  attached — it has no children declared in XML at all.
- `getSupportFragmentManager()` — **(a) first appearance** of this real
  method, returning the real `FragmentManager` this `Activity` owns.
- `.beginTransaction().add(R.id.fragmentContainer, new
  ItemListFragment()).commit();` — **(a) first appearance** of a real
  `FragmentTransaction`: `add(containerId, fragment)` stages adding this
  specific `Fragment` into the named container; `.commit()` — **(a)
  first appearance** — actually executes the staged transaction; nothing
  visibly happens until this real call runs.
- `if (savedInstanceState == null)` — **(a) first appearance** of this
  real, standard guard: without it, a real screen rotation (which
  destroys and recreates the `Activity`, this arc's own next lesson
  proves this directly) would add a **second**, duplicate
  `ItemListFragment` on top of the one the system automatically restores
  — this check specifically means "only add it on a genuinely fresh
  start, not a recreation."

## Concept Unit: The Real, Separate Fragment Lifecycle

### The Problem

Does a `Fragment`'s own lifecycle simply mirror its host `Activity`'s
one-for-one, or does it run its own, real, additional callbacks at
different points?

### Introduce the Concept in Isolation

```java
public class ItemListFragment extends Fragment {
    private static final String TAG = "ItemListFragment";

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        Log.d(TAG, "onAttach");
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.d(TAG, "onCreate");
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                              Bundle savedInstanceState) {
        Log.d(TAG, "onCreateView");
        return inflater.inflate(R.layout.fragment_item_list, container, false);
    }

    @Override
    public void onViewCreated(View view, Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        Log.d(TAG, "onViewCreated");
    }

    @Override
    public void onStart() {
        super.onStart();
        Log.d(TAG, "onStart");
    }

    @Override
    public void onResume() {
        super.onResume();
        Log.d(TAG, "onResume");
    }
}
```

Real, observed Logcat output, launching the host `Activity` (with this
arc's own Lesson 11 `Activity` logging left in place too, tagged
separately):

```
D/MainActivity: onCreate
D/ItemListFragment: onAttach
D/ItemListFragment: onCreate
D/ItemListFragment: onCreateView
D/ItemListFragment: onViewCreated
D/MainActivity: onStart
D/ItemListFragment: onStart
D/MainActivity: onResume
D/ItemListFragment: onResume
```

Direct, real, observed proof of the actual layering: the host
`Activity`'s own `onCreate` runs first — it's inside `onCreate` that
this lesson's first unit's `FragmentTransaction` was committed, which is
*why* the fragment's own `onAttach`/`onCreate`/`onCreateView`/
`onViewCreated` all run nested inside that same `Activity.onCreate`
call, before it returns. From `onStart` onward, the two lifecycles
genuinely interleave one level at a time — `Activity.onStart` then
`Fragment.onStart`, `Activity.onResume` then `Fragment.onResume` — the
fragment's own callback always running immediately *after* its host's
matching one, never before.

### Discard

Nothing here is disposable — this real, logged interleaving is the
standing reference this arc's own ViewModel lesson builds on directly.

### Mechanical Walkthrough

- `onAttach(Context context)` — **(a) first appearance** of this real,
  `Fragment`-only callback: the very first point at which this fragment
  has a real, live connection to its host `Activity` (via `context`) —
  no real `Activity` equivalent exists, since an `Activity` has no
  separate host to attach to.
- `onCreate(Bundle savedInstanceState)` — **(b) hard concept
  reappearing**, the identical real method name and signature already
  proven for `Activity` (Lesson 11) — a genuinely separate,
  `Fragment`-owned callback, proven directly by its real, distinct
  position in the interleaved output above, immediately after
  `onAttach`, not fired by the `Activity`'s own `onCreate` implicitly.
- `onCreateView(...)` — **(b) hard concept reappearing** from this
  lesson's own first unit.
- `onViewCreated(View view, Bundle savedInstanceState)` — **(a) first
  appearance** of this real, `Fragment`-only callback: runs immediately
  after `onCreateView`, once the returned `View` is fully attached — the
  real, correct place to call `findViewById`/ViewBinding setup (this
  arc's own Lesson 13) against the fragment's own views, rather than
  inside `onCreateView` itself, where the view, though constructed, may
  not yet be fully ready in every real case.
- `onStart()`/`onResume()` — **(b) hard concept reappearing**, the
  identical real method names from `Activity`'s own lifecycle (Lesson
  11), now proven, by their real logged position, to be genuinely
  separate `Fragment`-owned callbacks running just after their
  `Activity`-owned namesakes, not the same calls somehow shared.

### CS Lens

**(b) hard concept, real restatement.** This is a real, concrete
instance of the **Composite pattern**: a `Fragment` is a smaller,
independently lifecycle-managed piece composed *into* a larger
`Activity`, and the whole tree (`Activity` containing one or more
`Fragment`s, each potentially containing further nested `Fragment`s, not
exercised in this lesson) can be reasoned about recursively — each level
owning its own real lifecycle, layered rather than flattened into one.

### SE Lens

The real reason Android introduced `Fragment` as a genuinely separate
construct rather than simply letting an `Activity`'s own layout XML grow
arbitrarily complex: reuse and composition — the identical real
`ItemListFragment` from this lesson's first unit could be hosted inside
a completely different `Activity`, or shown alongside a second fragment
side-by-side on a larger, real tablet screen, with zero change to the
fragment's own code — a whole `Activity` cannot be nested inside another
`Activity` this way. The real cost, proven directly by this lesson's own
interleaved lifecycle trace: genuinely more lifecycle surface to reason
about correctly — two real, separate, layered lifecycles instead of one,
exactly the kind of real complexity `wpf-foundations`' own, simpler WPF
`Window` model never has to carry, since WPF has no directly equivalent
sub-screen construct at this same level.

## Connect the pieces

One trace: a `Fragment` is a real, independent, reusable UI piece,
hosted inside a container view via a real `FragmentTransaction`
committed through the host `Activity`'s own `FragmentManager` — proven
directly by real, observed `onCreateView` output and a real, visible
screen. Logging the fragment's own full real lifecycle alongside its
host `Activity`'s (Lesson 11) proves the two are genuinely separate,
layered schedules — the fragment's own `onAttach`/`onCreate`/
`onCreateView`/`onViewCreated` all nested inside the single
`Activity.onCreate` call that committed the transaction, and every
subsequent callback (`onStart`, `onResume`) running just after its
`Activity`-owned namesake, never before or instead of it.

## What breaks without this

Remove the `if (savedInstanceState == null)` guard from this lesson's
own first unit, committing the `FragmentTransaction` unconditionally
every time `Activity.onCreate` runs, then rotate the device (which, this
arc's own next lesson proves, destroys and recreates the `Activity`).
Real, observed result: the screen shows the fragment's own content
**twice**, stacked — a real, visible duplicate, because the system
already automatically restored the previous `ItemListFragment` instance
on recreation, and the unconditional `add(...)` call added a genuinely
second one on top of it. Direct, provable proof this lesson's own guard
condition is load-bearing, not defensive-programming ceremony.

## Exercises

1. Reproduce the real duplicate-fragment bug from the What Breaks
   section yourself, by removing the guard and rotating a real device or
   emulator, then restore the guard and confirm the duplicate no longer
   appears.
2. Add `onPause`, `onStop`, `onDestroyView`, and `onDetach` overrides
   (four real, further `Fragment` lifecycle methods, `onDestroyView`
   with no direct `Activity` equivalent — look up its real, documented
   purpose before writing it), each logging its own name. Background the
   app and return, then fully close it, and record the real, complete,
   observed order across all ten now-logged fragment callbacks.

## Definition of Done

- [ ] You built a real, hosted `Fragment` and confirmed
      `onCreateView` ran via real Logcat output.
- [ ] You logged the fragment's own full lifecycle alongside its host
      `Activity`'s and confirmed the real, layered, interleaved order.
- [ ] You reproduced the real duplicate-fragment bug from a missing
      `savedInstanceState == null` guard.
- [ ] You completed both exercises.

## Next

[Lesson 16 — ViewModel and Configuration
Changes](lesson-16-viewmodel-and-configuration-changes.md) covers a
real, reproduced bug — a plain field losing its value on rotation —
fixed by `ViewModel`, proven to survive the exact real
`Activity`-recreation this lesson's own What Breaks section already
touched on.

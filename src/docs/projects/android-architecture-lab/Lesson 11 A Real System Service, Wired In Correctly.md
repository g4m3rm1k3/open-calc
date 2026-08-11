# Lesson 11: A Real System Service, Wired In Correctly

**What you will build:** Two real, new pieces on the inventory grid: a
long-press on any row copies its name and quantity to the device's real
clipboard, using the identical `ClipboardManager`/`ClipData` API
`android-hardware-lab` Lesson 01 already proved in isolation — and a
real, registered `OnPrimaryClipChangedListener`, active only while the
grid is actually visible, correctly unregistered when it isn't, using
that same series' Lesson 03 own manual discipline by hand, since
nothing about `ClipboardManager`'s own listener API gets `LiveData`'s
automatic lifecycle-awareness for free. The transferable problem: this
entire series has shown `LiveData` removing the *need* for manual
listener lifecycle management — this lesson confronts a real, concrete
case where that manual discipline is still genuinely required, and
proves precisely why.

**What you need to know first:** `android-hardware-lab` Lesson 01
(`getSystemService`, the Manager pattern, `ClipboardManager`). Lesson
02 (`Context`, already directly applied in this series' own Lesson
10). Lesson 03 (`OnPrimaryClipChangedListener`, the real register/
unregister pairing, tied to `onDestroy`). This series' own Lesson 05
(`LiveData`'s automatic lifecycle-awareness — this lesson's own real
point of contrast).

**Terms introduced in this lesson:** none new — every real API this
lesson uses was already given full treatment in
`android-hardware-lab`; this lesson's own real subject is applying it,
for real, inside this project's actual architecture.

**Objects and methods used:**

**`ClipboardManager` / `ClipData`**
- *What they are:* the real, phone-wide clipboard service, and the
  real, labeled parcel handed to it.
- *Implementation:* given full treatment in `android-hardware-lab`
  Lesson 01 and Lesson 03 — real declared shapes already verified there,
  unchanged here:
  ```java
  public void setPrimaryClip(ClipData clip);
  public void addPrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public void removePrimaryClipChangedListener(OnPrimaryClipChangedListener what);
  public static ClipData newPlainText(CharSequence label, CharSequence text);
  ```
- *Its use:* `setPrimaryClip` — copying a row's real data; the
  listener pair — this lesson's own real, manual lifecycle discipline,
  covered in full below.

---

## Concept Unit: A Real Copy-Row Action

### The Problem

Nothing in this project currently lets a user get an item's own name
and quantity out of the app at all — a real, small, genuinely useful
feature this app doesn't have yet.

### Project Change

- **Reference Source:** Quoted directly above, already verified in
  `android-hardware-lab`.
- **Files affected:** `ItemAdapter.java`.
- **Change type:** Add a long-press listener to each row.
- **Dependencies:** None new.

### The New Code

Inside `ItemAdapter.onBindViewHolder`:

```java
holder.binding.getRoot().setOnLongClickListener((view) -> {
    ClipboardManager clipboard = (ClipboardManager)
        view.getContext().getSystemService(Context.CLIPBOARD_SERVICE);
    String text = item.name + ": " + item.quantity;
    clipboard.setPrimaryClip(ClipData.newPlainText("Inventory item", text));
    return true;
});
```

### Mechanical Walkthrough

- `holder.binding.getRoot().setOnLongClickListener(...)` — **first
  appearance of a long-click listener specifically.** Real, distinct
  sibling of `setOnClickListener`
  (`android-ui-foundations` Lesson 16, reappearing) — fires on a
  press-and-hold instead of a tap; the real lambda must return a
  `boolean` — `true`, real, documented behavior meaning "this long
  click was fully handled, don't also treat it as a plain click."
- `(ClipboardManager) view.getContext().getSystemService(Context.CLIPBOARD_SERVICE)`
  — the identical real call `android-hardware-lab` Lesson 01 already
  proved in full — `view.getContext()` here, rather than `this`, since
  `ItemAdapter` isn't itself a `Context`
  (`android-ui-foundations` Lesson 26's own reasoning for
  `LayoutInflater.from(parent.getContext())`, reapplied).
- `ClipData.newPlainText("Inventory item", text)` /
  `clipboard.setPrimaryClip(...)` — the identical real calls
  `android-hardware-lab` Lesson 03 already proved, unchanged, applied
  here to this project's own real row data instead of a test string.

### CS Lens

This is `android-hardware-lab`'s own real Manager pattern, applied for
the first time inside this project's actual feature set rather than a
disposable example — real, direct proof that pattern transfers
unchanged from a throwaway lab into production code.

### SE Lens

**Why does this real feature belong inside `ItemAdapter` — reaching
`view.getContext()` for a `ClipboardManager` directly — rather than
routed through `InventoryViewModel`, the way every other real action in
this project's own architecture has been, since Lesson 06?** A one-shot
system-service call with no real, persisted state and no real
asynchronous result to observe has no genuine need for the
`Repository`/`ViewModel` boundary that exists specifically to manage
*data* — routing a stateless clipboard write through a `ViewModel`
would add real ceremony with nothing real to show for it, the same
"don't design for a cost this specific case doesn't have" reasoning
this series already applied choosing `ItemRepository`'s own thin,
pass-through `getAllItems()` (Lesson 06).

---

## Concept Unit: A Real, Registered Listener — the Manual Discipline `LiveData` Doesn't Cover

### The Problem

A second, real feature: while the grid is visible, the app should react
if the user copies something *else* to the clipboard from outside the
app — a real, concrete reason to register `OnPrimaryClipChangedListener`
for real, inside this project's real architecture, not a throwaway lab.

### The Real Contrast, Named Directly

This lesson's own `LiveData`-backed grid (Lesson 05) never needed a
single manual `removeObserver` call anywhere — `observe`'s own real,
documented contract handles that automatically, tied to `LifecycleOwner`.
`ClipboardManager`'s own real listener API has no equivalent: nothing
about `addPrimaryClipChangedListener` knows or cares about any
`Activity`'s lifecycle at all. The exact manual discipline
`android-hardware-lab` Lesson 03 proved necessary — register, and
*remember* to unregister, correctly, in `onDestroy` — is still, genuinely,
required here, unchanged by anything this series has built since.

### Project Change

- **Reference Source:** Quoted above, already verified in
  `android-hardware-lab` Lesson 03.
- **Files affected:** `InventoryActivity.java`.
- **Change type:** Add two real fields; register in `onCreate`,
  unregister in `onDestroy`.
- **Dependencies:** None new.

### The New Code

```java
private ClipboardManager clipboard;
private ClipboardManager.OnPrimaryClipChangedListener clipListener;

// inside onCreate:
clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
clipListener = () -> {
    Log.d("InventoryActivity", "Clipboard changed while grid visible");
};
clipboard.addPrimaryClipChangedListener(clipListener);

@Override
protected void onDestroy() {
    super.onDestroy();
    if (clipboard != null) {
        clipboard.removePrimaryClipChangedListener(clipListener);
    }
}
```

### Mechanical Walkthrough

- `private ClipboardManager clipboard;` / `private
  ClipboardManager.OnPrimaryClipChangedListener clipListener;` — the
  identical real field-promotion reasoning
  `android-hardware-lab` Lesson 03 already proved necessary: `onDestroy`
  needs to reach the *same* two objects `onCreate` created, so neither
  can stay a local variable.
- `clipboard.addPrimaryClipChangedListener(clipListener);` — the
  identical real registration call from that same lesson.
- `onDestroy()` — reappearing lifecycle method
  (`android-ui-foundations` Lesson 07); `if (clipboard != null)` —
  reappearing null-check discipline
  (`android-ui-foundations` Lesson 01).
- `clipboard.removePrimaryClipChangedListener(clipListener);` — the
  real, manual unregister call — this lesson's own entire point:
  nothing about this project's own real `ViewModel`/`LiveData`
  architecture, built across Lessons 03–10, does this step
  automatically. It has to be written, correctly, by hand, exactly the
  way `android-hardware-lab` Lesson 03 originally taught it.

### CS Lens

Two real listener shapes now coexist in the same real screen: one
(`LiveData`, observing `InventoryViewModel`) whose lifecycle is managed
automatically, and one (`ClipboardManager`'s own raw listener) whose
lifecycle must be managed by hand — real, direct, side-by-side proof
that "automatic lifecycle awareness" isn't a property of *listeners in
general*, it's a specific, deliberate feature `LiveData` itself
provides, real work absent for any API that doesn't build it in.

### SE Lens

**Given this real difference, should this project wrap
`ClipboardManager`'s own listener in something `LiveData`-like, to get
the same automatic behavior?** A real, legitimate option — a
`LiveData` subclass overriding `onActive()`/`onInactive()` to register
and unregister a raw system listener automatically exists as a real,
documented Android pattern. This lesson deliberately doesn't build it:
seeing the real, manual discipline directly, once, inside real project
code — not just a throwaway lab — is this lesson's own actual point;
automating it away immediately would remove the exact contrast this
lesson exists to make felt.

---

## Connect the Pieces

One trace: long-pressing any row calls the real, already-verified
`ClipboardManager`/`ClipData` API directly, copying that row's own real
data — a one-shot action needing no lifecycle management at all.
Separately, `InventoryActivity` registers a real
`OnPrimaryClipChangedListener` in `onCreate` and correctly unregisters
it in `onDestroy` — the identical manual discipline
`android-hardware-lab` Lesson 03 first taught, still genuinely required
here, standing in direct, felt contrast against `LiveData`'s own
automatic version of the same underlying idea, observed without a
single manual unregister call anywhere in this same file.

## What Breaks Without This

Remove `removePrimaryClipChangedListener` from `onDestroy` entirely,
leaving registration in place. Real, predicted result, grounded
directly in `android-hardware-lab` Lesson 03's own already-proven leak
demonstration (confirm it yourself on a real device or emulator):
rotating the grid screen repeatedly accumulates real, separate
`InventoryActivity` instances, each still reachable through
`clipboard`'s own internal listener list — the identical real leak
that lesson already reproduced directly, now reintroduced here by the
same real mistake, inside this project's real architecture instead of
a throwaway lab.

## Exercises

1. Log `System.identityHashCode(this)` inside `clipListener`'s own
   body, rotate the emulator several times, and change the clipboard's
   contents once — confirm, via Logcat, whether one or several real
   `InventoryActivity` identities respond, the identical proof
   technique `android-hardware-lab` Lesson 03 already established.
2. Research `LiveData`'s own `onActive()`/`onInactive()` methods in
   Android's official documentation, and describe, in your own words,
   how a `LiveData` subclass could wrap `ClipboardManager`'s listener
   automatically — tying your answer back to this lesson's own SE Lens.
3. Explain, precisely, why the copy-row action (`setPrimaryClip`) needs
   no lifecycle management at all, while the change-listener
   (`addPrimaryClipChangedListener`) genuinely does — what real,
   structural difference between "fire once" and "register to be
   called repeatedly, later" makes the difference.

## Definition of Done

- [ ] Long-pressing a row copies its real name and quantity to the
      device's real clipboard, confirmed by pasting it somewhere else.
- [ ] A real `OnPrimaryClipChangedListener` is registered in `onCreate`
      and correctly removed in `onDestroy`.
- [ ] You can state, precisely, why `LiveData`'s own automatic
      lifecycle-awareness does not extend to this raw system listener.
- [ ] Commit: `git commit -m "Add clipboard copy-row action and a
      correctly lifecycle-paired clipboard listener"` — explaining the
      real manual discipline still required, not just that a new
      feature was added.

Next: `SmsManager`, the professional way — `android-persistence-lab`'s
own real send/permission logic, rebuilt through this project's own
`ViewModel`/`LiveData` architecture.

# Lesson 1.3: `onBindViewHolder` — Filling a Row-Slot With Data, and the Click-Listener Position Trap

## What you will build

Nothing new yet — this is a full, real read of the third piece of
`InventoryAdapter`: the method that actually puts real data onto the
row-slots Lesson 1.2 builds, and registers the two click listeners a
tapped row responds to. The transferable problem: this method runs far
more often than Lesson 1.2's, on holders that get *reused* — and a
listener registered once, on a reused holder, has to keep working
correctly even after the specific row it was showing has moved, or been
deleted entirely, out from under it.

## What you need to know first

**Lesson 1.1** — `InventoryViewHolder`'s cached fields
(`nameText`/`quantityText`/`deleteButton`) and `itemView`. **Lesson
1.2** — that this method runs on holders `onCreateViewHolder` already
built, not fresh ones. **Lesson 0** — comfort with functional interfaces
and lambda expressions as stored-then-later-run callbacks, alongside
`class`/`object`, `extends`, and generics, all of which reappear below
with their own full treatment rather than a bare citation.

## Terms used in this lesson

- **functional interface** (reappearing, Lesson 0) — an interface that
  declares exactly one abstract method. It exists so that a lambda
  expression (next) has something unambiguous to *be*: with only one
  method to implement, a lambda's own body can stand in for a whole
  anonymous implementation of that interface, with no need to name which
  method it's implementing.
- **lambda expression** (reappearing, Lesson 0) — a compact, unnamed,
  inline implementation of a functional interface's single method. It
  exists to avoid writing a full named class (or an anonymous inner
  class) every time a small callback is needed; the code inside a
  lambda's body does not run at the moment it's written — only later,
  whenever whatever holds onto it actually calls that one method.
- **method overloading / overload resolution** — Java allowing more than
  one method to share the same name, distinguished only by their
  parameter types, with the compiler choosing which one a given call
  actually means based on the *compile-time type* of the arguments
  passed (Lesson 1.1's own term). It exists so a method name can express
  one idea ("display this") across several real input shapes without
  inventing a differently-named method for each — the real risk it
  creates, proven below, is that a call can silently resolve to the
  *wrong* overload, compiling perfectly cleanly, if the argument's
  compile-time type doesn't match what the caller actually intended.
- **`@Override`** (reappearing, Lesson 1.2) — an annotation telling the
  compiler this method is meant to replace one the parent class already
  declared, using the exact same signature; the compiler rejects the
  file outright if the signature doesn't actually match anything the
  parent declares.
- **`@NonNull`** (reappearing, Lesson 1.1) — an annotation asserting a
  parameter, field, or return value is guaranteed to never be `null`,
  letting tooling flag a violating caller at build time instead of the
  mistake surfacing later as a runtime crash.

## Objects and methods used

**`RecyclerView.Adapter<VH>.onBindViewHolder(VH, int)`**
- *What it is:* an abstract method declared on `RecyclerView.Adapter`
  that every real subclass is required to supply a real body for. It is
  this lesson's own subject.
- *Implementation:* its real shape is
  `public abstract void onBindViewHolder(VH holder, int position)` —
  `holder` is one of the small, fixed pool of holders Lesson 1.2's
  method built; `position` is *this specific call's* current data index,
  which — unlike `holder` itself — is not guaranteed to stay correct for
  as long as `holder` does (this is the entire subject of this lesson's
  second half, below).
- *Its use:* `InventoryAdapter` supplies the real body below — the
  method responsible for making a reused (or freshly built) holder
  actually display one specific item's real data.

**`java.util.List<E>`**
- *What it is:* the standard Java interface `InventoryAdapter`'s own
  `items` field is declared as. This lesson calls two of its related
  members, so its real shape (only those two) is shown rather than
  described in prose alone.
- *Implementation:*
  ```java
  public interface List<E> {
      E get(int index);
      E remove(int index);
  }
  ```
  Both take a plain `int` index. `List` also separately declares a
  second, *different* `remove(Object o)` — removing the first element
  that *equals* the object passed in, not the element at a given
  position. Passing a primitive `int` (as below) always resolves to the
  index-based `remove(int index)` shown here, per overload resolution
  above — the compiler picks based on the argument's compile-time type,
  and a literal `int` is never mistaken for an `Object`.
- *Its use:* `.get(position)` reads the item this call is responsible
  for; `.remove(currentPosition)`, later below, deletes the item at a
  live-checked position — never by matching an `InventoryItem` value.

**`TextView.setText(...)`**
- *What it is:* an ordinary instance method for changing the text a
  `TextView` displays. `TextView` declares more than one overload of it,
  which matters directly to this lesson's own point, so both are shown.
- *Implementation:* the two relevant real overloads are
  `void setText(CharSequence text)` and `void setText(int resid)` — the
  second does **not** display the number itself; it treats the `int` as
  a string-resource ID (an `R.string.*` constant) and looks up whatever
  text that resource ID names. Both overloads are real, legitimate,
  callable methods; nothing about calling the wrong one is a compile
  error.
- *Its use:* this lesson's code calls the first overload,
  `setText(CharSequence)` — `String` implements `CharSequence`, so a
  `String` argument satisfies it directly.

**`String.valueOf(int)`**
- *What it is:* a `static` method on `java.lang.String`.
- *Implementation:* `public static String valueOf(int i)` — converts a
  primitive `int` into a new `String` holding its digits.
- *Its use:* converts `item.getQuantity()`'s `int` into a `String`
  *before* it reaches `setText`, so the call resolves to
  `setText(CharSequence)` and not `setText(int)` — proven in isolation
  below.

**`View.setOnClickListener(View.OnClickListener)` and `View.OnClickListener`**
- *What they are:* an ordinary instance method any `View` has, and the
  real functional interface (above) it accepts.
- *Implementation:*
  ```java
  public interface OnClickListener {
      void onClick(View v);
  }
  ```
  `setOnClickListener` simply stores the object passed in; it does not
  call `onClick` itself, at any point — it only remembers what to call
  later, whenever the real touch system decides this specific `View` was
  tapped.
- *Its use:* called twice below, once on `holder.deleteButton` and once
  on `holder.itemView`, each with its own lambda implementing `onClick`.

**`RecyclerView.ViewHolder.getBindingAdapterPosition()`**
- *What it is:* an ordinary instance method any `RecyclerView.ViewHolder`
  has.
- *Implementation:* `public final int getBindingAdapterPosition()` —
  asks `RecyclerView`'s own live bookkeeping, at the exact moment it's
  called, "what position are you showing *right now*" — not whatever
  position this holder was showing when some earlier code ran.
- *Its use:* called inside both lambdas below, at click time, specifically
  instead of closing over the `position` parameter `onBindViewHolder`
  already received — the entire subject of this lesson's second half.

**`RecyclerView.NO_POSITION`**
- *What it is:* a real `public static final int` constant declared on
  `RecyclerView`.
- *Implementation:* its real value is `-1`.
- *Its use:* the answer `getBindingAdapterPosition()` gives when a
  holder is in a transitional state (mid-removal-animation, or briefly
  detached) where "which position is this" has no valid answer yet;
  checked below before acting on whatever position was returned.

**`RecyclerView.Adapter.notifyItemRemoved(int)`**
- *What it is:* a real method `InventoryAdapter` inherits from
  `RecyclerView.Adapter`, not one it defines itself.
- *Implementation:* `public final void notifyItemRemoved(int position)` —
  schedules a removal animation and shifts every later row's own
  effective position down by one; it does not itself touch `items` — it
  only tells `RecyclerView` that a mutation already happened.
- *Its use:* called immediately after `items.remove(...)`, in that
  order, since `RecyclerView` re-queries `items` when it processes this
  notification — the data must already reflect the removal by then.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`InventoryViewHolder`'s cached fields** (reappearing, Lesson 1.1)
  - *What they are:* `nameText`, `quantityText` (both `TextView`), and
    `deleteButton` (`Button`), each `final`, each found exactly once by
    `findViewById` back in Lesson 1.1's constructor.
  - *Implementation:* plain fields on the `holder` parameter this
    method receives.
  - *Its use:* written to directly below — no `findViewById` anywhere
    in this method, which is Lesson 1.1's entire payoff made concrete.
- **`itemView`** (reappearing, `RecyclerView.ViewHolder`'s own field,
  Lesson 1.1)
  - *What it is:* the row's whole root `View`, stored by the parent
    constructor every `ViewHolder` calls.
  - *Implementation:* `public final View itemView`.
  - *Its use:* the second `setOnClickListener` call below is registered
    on this field — "tap anywhere on the row," not one specific widget
    inside it.
- **`View.getContext()`** (reappearing, Lesson 1.2)
  - *What it is:* an ordinary instance method every `View` has.
  - *Implementation:* `public final Context getContext()`.
  - *Its use:* called on `view` (the tapped `View` a listener receives)
    inside the second lambda, since this method has no `Context` of its
    own to hand `showEditQuantityDialog` directly.
- **`InventoryItem.getName()` / `InventoryItem.getQuantity()`**
  - *What they are:* ordinary getters on your own project's data model
    class, not part of any Android or Java library.
  - *Implementation:* plain accessors returning the fields
    `InventoryItem` already holds.
  - *Its use:* read once each, below, to get the specific values this
    call is responsible for displaying.

---

## Concept Unit: `onBindViewHolder` — Filling a Row-Slot, and the Position Trap

### The Problem

Two separate problems live in one method here. First: Lesson 1.2's
holder now exists, with three cached-but-empty views — something has to
actually put real text into them, using the plain `TextView.setText`
call every UI framework eventually reduces to, and that call has a real
danger hiding in it (proven below). Second, and less obvious: a click
listener registered on a *reused* holder has to keep pointing at the
right piece of data even after other rows get deleted out from under it,
shifting everything below them — a listener that gets this wrong doesn't
crash; it silently acts on the wrong row.

### Project Change

- **Reference Source:** No external reference file in this repo — this
  is your own Android Studio project's real `InventoryAdapter.java`,
  already built in `android-ui-foundations`. Shown in full below exactly
  as it already stands; nothing in this unit changes it.
- **Files affected:** `InventoryAdapter.java` (already exists).
- **Change type:** N/A — reading existing code.
- **Location:** the method `onBindViewHolder`, a required override
  declared directly inside `InventoryAdapter`, alongside the
  `InventoryViewHolder` nested class and `onCreateViewHolder` already
  covered.
- **Dependencies:** none new.

### The New Code

```java
@Override
public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
    InventoryItem item = items.get(position);
    holder.nameText.setText(item.getName());
    holder.quantityText.setText(String.valueOf(item.getQuantity()));
    holder.deleteButton.setOnClickListener((view) -> {
        int currentPosition = holder.getBindingAdapterPosition();
        if (currentPosition != RecyclerView.NO_POSITION) {
            items.remove(currentPosition);
            notifyItemRemoved(currentPosition);
        }
    });
    holder.itemView.setOnClickListener((view) -> {
        int currentPosition = holder.getBindingAdapterPosition();
        if (currentPosition != RecyclerView.NO_POSITION) {
            showEditQuantityDialog(view.getContext(), currentPosition);
        }
    });
}
```

### The Updated Project

`InventoryAdapter.java`, as it stands at the end of this unit — the
field, constructor, and `onCreateViewHolder` predate this unit
(Lessons 1.1–1.2); the nested class is exactly Lesson 1.1's, shown again
in full rather than elided; the method below is this unit's own
addition:

```java
class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {

    private final List<InventoryItem> items;

    InventoryAdapter(List<InventoryItem> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View rowView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_inventory, parent, false);
        return new InventoryViewHolder(rowView);
    }

    @Override                                                                  // ← new
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) { // ← new
        InventoryItem item = items.get(position);                             // ← new
        holder.nameText.setText(item.getName());                              // ← new
        holder.quantityText.setText(String.valueOf(item.getQuantity()));      // ← new
        holder.deleteButton.setOnClickListener((view) -> {                    // ← new
            int currentPosition = holder.getBindingAdapterPosition();         // ← new
            if (currentPosition != RecyclerView.NO_POSITION) {                // ← new
                items.remove(currentPosition);                                // ← new
                notifyItemRemoved(currentPosition);                           // ← new
            }                                                                 // ← new
        });                                                                   // ← new
        holder.itemView.setOnClickListener((view) -> {                       // ← new
            int currentPosition = holder.getBindingAdapterPosition();        // ← new
            if (currentPosition != RecyclerView.NO_POSITION) {               // ← new
                showEditQuantityDialog(view.getContext(), currentPosition);  // ← new
            }                                                                 // ← new
        });                                                                   // ← new
    }                                                                         // ← new

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        final Button deleteButton;
        final TextView nameText;
        final TextView quantityText;

        InventoryViewHolder(View rowView) {
            super(rowView);
            nameText = rowView.findViewById(R.id.itemNameText);
            quantityText = rowView.findViewById(R.id.itemQuantityText);
            deleteButton = rowView.findViewById(R.id.deleteButton);
        }
    }
}
```

`InventoryAdapter` can now do three things instead of two: build a fresh
row-slot (Lesson 1.2), and — new here — actually fill any row-slot with
real data, and respond to a tap on either its delete button or the row
itself. `showEditQuantityDialog`, called at the very end, is covered in
full in the next lesson; this one only establishes that it gets called,
and with what.

### Introduce the Concept in Isolation — Overload Danger

The claim above — that skipping `String.valueOf` doesn't fail to
compile, it silently calls a *different, real* method — is provable in
pure Java, no Android involved.
`code/android-persistence-lab/OverloadResolutionDemo.java`:

```java
public class OverloadResolutionDemo {

    static void display(String text) {
        System.out.println("[String overload] showing text: " + text);
    }

    static void display(int resourceId) {
        System.out.println("[int overload]    looking up resource id: " + resourceId + " (this is almost certainly NOT what was intended)");
    }

    public static void main(String[] args) {
        int quantity = 12;

        display(String.valueOf(quantity)); // explicit conversion -- picks the String overload
        display(quantity);                  // no conversion -- compiles fine, silently picks the int overload instead
    }
}
```

Real, actually-run output, this session:

```
[String overload] showing text: 12
[int overload]    looking up resource id: 12 (this is almost certainly NOT what was intended)
```

Both calls compiled with zero errors or warnings. This is called
**overload resolution**: the compiler picked which real `display` method
each call meant based purely on the compile-time type of the argument —
a converted `String` for the first call, a bare `int` for the second —
with no runtime check anywhere weighing in. `TextView.setText` carries
the identical two-overload shape (Objects and methods, above); this demo
is that exact danger, isolated down to its one mechanical cause.

### Discard the Throwaway Example

`OverloadResolutionDemo.java` exists only to prove the overload-danger
claim in isolation. It is not part of the Android project — the real
mechanism it proves carries forward into `onBindViewHolder`'s own
`String.valueOf` call, discussed in real Android terms next.

### Mechanical Walkthrough — Filling a Row-Slot

- `@Override` — reappearing (Terms, above); confirms this signature
  really matches the abstract method `RecyclerView.Adapter` declared.
- `public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position)`
  — the required override signature (Objects and methods, above);
  unlike Lesson 1.2's method, this one runs repeatedly, on the same small
  pool of holders, every time any of them needs to show a (possibly
  different) item.
- `InventoryItem item = items.get(position);` — an **instance method
  call**, `.get(int)`, on `items` (a real `List<InventoryItem>`, Objects
  and methods above); `position` is *this call's* current index, read
  directly, with nothing between the parameter and the call.
- `holder.nameText.setText(item.getName());` — `item.getName()` is an
  **instance method call** on the project's own `InventoryItem` (Terms,
  above), returning a `String`; `setText(...)` is an **instance method
  call** on `holder.nameText` (a real `TextView`) that resolves, per
  overload resolution above, to `setText(CharSequence)` — a `String`
  satisfies `CharSequence` directly, no conversion needed here because
  `getName()` already returns text, not a number.
- `holder.quantityText.setText(String.valueOf(item.getQuantity()));` —
  `item.getQuantity()` is an **instance method call** returning a
  primitive `int`; `String.valueOf(...)` is a **static method call** on
  `java.lang.String` (Objects and methods, above) converting that `int`
  into a real `String`; the outer `setText(...)` is the identical
  **instance method call** as the line above, now resolving to
  `setText(CharSequence)` *because* of that conversion — proven, in
  isolation above, to be the difference between this line working
  correctly and it silently calling `setText(int)` instead.

### Mechanical Walkthrough — The Two Click Listeners

- `holder.deleteButton.setOnClickListener((view) -> { ... });` — an
  **instance method call**, `setOnClickListener` (Objects and methods,
  above), on `holder.deleteButton` (a real `Button`); its one argument,
  `(view) -> { ... }`, is a **lambda expression** (Terms, above)
  implementing `View.OnClickListener`'s single method, `onClick(View v)`.
  This line only *registers* the callback — nothing inside its body runs
  now, only later, whenever the real touch system decides this specific
  button was tapped.
- `int currentPosition = holder.getBindingAdapterPosition();` — an
  **instance method call** (Objects and methods, above) — the crux of
  this whole unit's second half; see "Why Not Just Use `position`?"
  below.
- `if (currentPosition != RecyclerView.NO_POSITION) { ... }` — a guard
  comparing against `RecyclerView.NO_POSITION` (Objects and methods,
  above), a real `-1` constant — explained in full below.
- `items.remove(currentPosition); notifyItemRemoved(currentPosition);` —
  an **instance method call**, `List.remove(int)` (Objects and methods,
  above — the index-based overload, not the object-matching one),
  followed by an **inherited instance method call**,
  `notifyItemRemoved(int)` (Objects and methods, above); the data is
  mutated first, the notification sent second, deliberately, since
  `RecyclerView` re-reads `items` when it processes the notification.
- `holder.itemView.setOnClickListener((view) -> { ... });` — the
  identical **instance method call** as the delete button's, now on
  `itemView` (Objects and methods, above, reappearing) — "tap anywhere on
  this row," a second, entirely independent listener registration.
- `int currentPosition = holder.getBindingAdapterPosition(); if (currentPosition != RecyclerView.NO_POSITION)`
  — the identical guard pattern, repeated for this second lambda.
- `showEditQuantityDialog(view.getContext(), currentPosition);` — calls
  the adapter's own private method, covered in full next lesson;
  `view.getContext()` is the reappearing instance method call (Objects
  and methods, above) supplying the one argument that method needs and
  has no other way to obtain here.

### Why Not Just Use `position`?

This method already receives a `position` parameter — it's reasonable to
expect both lambdas could just close over *that* directly, instead of
calling `getBindingAdapterPosition()`. They don't, and the reason is a
real, easy-to-miss bug, proven above in `StalePositionDemo.java`:

```java
import java.util.ArrayList;
import java.util.List;

public class StalePositionDemo {

    interface RowAction {
        void run();
    }

    public static void main(String[] args) {
        System.out.println("=== BUGGY: capturing a plain int at registration time ===");
        runScenario(true);

        System.out.println();
        System.out.println("=== CORRECT: querying a live position at click time ===");
        runScenario(false);
    }

    static void runScenario(boolean useCapturedInt) {
        List<String> items = new ArrayList<>(List.of("Bolts", "Washers", "Nuts", "Screws"));
        int[] livePosition = { 2 }; // stands in for holder.getBindingAdapterPosition()'s real, live answer

        int capturedAtRegistrationTime = livePosition[0]; // captured now, frozen forever

        RowAction delete = useCapturedInt
            ? () -> {
                String removed = items.remove(capturedAtRegistrationTime);
                System.out.println("delete.run() removed index " + capturedAtRegistrationTime + " -> \"" + removed + "\"");
              }
            : () -> {
                String removed = items.remove(livePosition[0]);
                System.out.println("delete.run() removed index " + livePosition[0] + " -> \"" + removed + "\"");
              };

        System.out.println("items before         = " + items);
        System.out.println("row registered while showing index " + livePosition[0] + " (\"" + items.get(livePosition[0]) + "\")");

        String removedElsewhere = items.remove(0);
        livePosition[0] = livePosition[0] - 1;
        System.out.println("removed elsewhere    = \"" + removedElsewhere + "\"");
        System.out.println("items after shift    = " + items);
        System.out.println("row's real current item is now index " + livePosition[0] + " (\"" + items.get(livePosition[0]) + "\")");

        System.out.println("user taps delete on that SAME physical row");
        delete.run();
        System.out.println("items after tap      = " + items);
    }
}
```

`livePosition` stands in for what `getBindingAdapterPosition()` would
really report at any given moment; `capturedAtRegistrationTime` stands in
for closing over the plain `position` parameter instead. Real,
actually-run output, this session:

```
=== BUGGY: capturing a plain int at registration time ===
items before         = [Bolts, Washers, Nuts, Screws]
row registered while showing index 2 ("Nuts")
removed elsewhere    = "Bolts"
items after shift    = [Washers, Nuts, Screws]
row's real current item is now index 1 ("Nuts")
user taps delete on that SAME physical row
delete.run() removed index 2 -> "Screws"
items after tap      = [Washers, Nuts]

=== CORRECT: querying a live position at click time ===
items before         = [Bolts, Washers, Nuts, Screws]
row registered while showing index 2 ("Nuts")
removed elsewhere    = "Bolts"
items after shift    = [Washers, Nuts, Screws]
row's real current item is now index 1 ("Nuts")
user taps delete on that SAME physical row
delete.run() removed index 1 -> "Nuts"
items after tap      = [Washers, Screws]
```

**Execution trace — why the buggy run removed the wrong item:**

1. `row registered while showing index 2 ("Nuts")` — both scenarios start
   identically: a lambda is created while the row shows `"Nuts"`, at
   index `2`. `capturedAtRegistrationTime` is set to `2` right here and
   never changes again — it's a plain `int`, copied once, with no link
   back to anything that could update it later.
2. `removed elsewhere = "Bolts"` — something else (a different row's own
   delete button, in the real app) removes index `0`. Every later
   element shifts one index left: `"Nuts"` moves from index `2` to index
   `1`. `livePosition[0]` is updated to match (`2 → 1`) — standing in for
   `RecyclerView`'s own real bookkeeping doing the same thing to
   whatever `getBindingAdapterPosition()` would report.
3. `items after shift = [Washers, Nuts, Screws]` — `"Nuts"` really is now
   at index `1`. `capturedAtRegistrationTime`, frozen back in step 1, is
   still `2` — which now names a completely different item, `"Screws"`.
4. **Buggy run:** `delete.run()` calls `items.remove(2)` — the frozen,
   stale value — removing `"Screws"`, an item the user never tapped.
   **Correct run:** `delete.run()` calls `items.remove(livePosition[0])`,
   which is `1` *at the moment the click actually happens*, removing
   `"Nuts"` — the item actually showing on the row that was actually
   tapped.

`RecyclerView.NO_POSITION` (Objects and methods, above) is the answer
`getBindingAdapterPosition()` gives when a holder is in a transitional
state — mid-removal-animation, or briefly detached — where "which
position is this" has no valid answer yet. The `if` guard exists purely
to make tapping during that narrow window a no-op instead of a crash
(`items.remove(-1)` would throw an `IndexOutOfBoundsException`).

### CS Lens

The failure `StalePositionDemo` reproduces is a classic instance of
**stale references / cache invalidation**: data that was correct when
captured becoming silently wrong after the world underneath it changed,
without anything that captured it being notified. Also recognized in: a
stale database index after a row is deleted elsewhere, a dangling
pointer in C after the memory it pointed to is freed and reused, a
cached DNS lookup outliving the server it once pointed to, an iterator
invalidated by modifying a collection while iterating it.

Separately, `OverloadResolutionDemo` is a real instance of **static
dispatch**: which of several same-named methods actually runs is decided
once, at compile time, from the argument's declared type — never
re-decided at runtime based on what the value "really is." Also
recognized in: C++ function overloading, operator overloading in most
statically-typed languages, and the general class of bugs where a
seemingly-harmless implicit conversion silently changes which code path
runs.

### SE Lens

Capturing `position` directly instead of calling
`getBindingAdapterPosition()` is genuinely less code, and works
correctly in the common case of a list where nothing above the tapped
row is ever inserted or removed. The cost is a bug that's specifically
*intermittent and data-dependent* — it only manifests after a delete
followed by a tap on a different row — easy to miss in casual manual
testing and easy to reintroduce later if a future edit "simplifies" this
back to capturing `position`. Reaching into the holder for the live
position at click time costs one extra method call per click, paid only
when a click actually happens, in exchange for correctness under a
mutation pattern a developer might not think to test for by hand.

Separately: skipping `String.valueOf` saves one method call and reads
almost identically at the call site (`setText(item.getQuantity())` looks
just as reasonable as `setText(String.valueOf(item.getQuantity()))` to
someone unfamiliar with `TextView`'s two overloads). The cost is a
category of bug the compiler cannot catch for you here, because both
overloads are equally valid, equally real methods — the type system's
usual safety net (a compile error on a type mismatch) simply does not
fire, which is exactly what `OverloadResolutionDemo` demonstrated.

### Commands Needed

```bash
cd code/android-persistence-lab
javac OverloadResolutionDemo.java && java OverloadResolutionDemo
javac StalePositionDemo.java && java StalePositionDemo
```

- `javac <file>.java` — the standard Java compiler; produces a matching
  `.class` file (or several, for nested classes) in the same directory.
  Success is silent.
- `java <ClassName>` — the standard Java launcher; runs the named class's
  `public static void main(String[])`.

### Run It — Real Output

Both already shown in full above, under their own "Introduce the
Concept in Isolation" / "Why Not Just Use `position`?" sections — the
actual, unedited output of the commands just listed, run this session.

### Connecting Sentence

`onBindViewHolder` is where the cheap, repeated half of Lesson 1.1's
`ViewHolder` tradeoff pays off — reusing already-found views instead of
searching again — while re-registering its two click listeners
defensively enough, via `getBindingAdapterPosition()`, to survive the
very recycling that makes reuse possible in the first place; the next
lesson covers exactly what a tap on the row goes on to build.

---

## Connect the Pieces

One trace, start to finish: `RecyclerView` calls
`onBindViewHolder(holder, 2)` for an item, "Bolts," quantity `12`.
`items.get(2)` fetches it; `nameText.setText("Bolts")` runs directly;
`quantityText.setText(String.valueOf(12))` runs the conversion proven
necessary above, avoiding `setText(int)` entirely. Two click listeners
are freshly registered on this specific `holder`. Later, the user
deletes an earlier row, shifting "Bolts" from index `2` to index `1`,
then taps this same row's delete button: the lambda calls
`holder.getBindingAdapterPosition()`, gets back the *live* `1`, not the
stale `2`, and removes the correct item — exactly the scenario
`StalePositionDemo` proved by name.

## What Breaks Without This

In a scratch copy of `StalePositionDemo.java`, this lesson already ran
both the buggy and correct scenarios side by side, this session — the
buggy run removed `"Screws"` when the user's tap clearly meant `"Nuts"`.
Separately, in a scratch copy of `OverloadResolutionDemo.java`, delete
the `String.valueOf(...)` conversion on the second `display` call and
rerun it: it still compiles, and now calls `display(int)` directly for
what was meant to be a String — the exact, silent wrong-overload failure
this lesson's `setText` call avoids. Revert both afterward.

## Exercises

1. In `StalePositionDemo.java`, change the elsewhere-removed index from
   `0` to `3` (the last item) instead, predict whether the bug still
   reproduces, and check your prediction against a real rerun.
2. In `OverloadResolutionDemo.java`, add a third overload,
   `display(Object o)`, and predict which overload `display("hello")`
   would now call — `String` or `Object` — before running it.

## Definition of Done

- [ ] You ran both demos yourself and can point to the exact line in
      each real output where the bug (stale position; wrong overload)
      actually shows up.
- [ ] You can explain, without looking back, why
      `getBindingAdapterPosition()` is called instead of closing over
      `position`, including the specific sequence of events (delete
      elsewhere, then click) that makes the difference observable.
- [ ] You can name `TextView.setText`'s two real overloads and explain
      why calling the wrong one is not a compile error.
- [ ] `git commit` with a message explaining *why* you now understand
      this method — e.g. "Understand onBindViewHolder: String.valueOf
      avoids a silent wrong-overload call, and getBindingAdapterPosition
      avoids a stale-index bug after deletes," not "read
      onBindViewHolder."

Next: Lesson 1.4 — `AlertDialog.Builder`, the dialog `showEditQuantityDialog`
actually builds when a row is tapped.

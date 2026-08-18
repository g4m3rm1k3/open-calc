# Lesson 1: Reading `InventoryAdapter` — The RecyclerView Adapter Pattern

## What you will build
Nothing new — this lesson is a full read of the `InventoryAdapter` class
you already have, line by line. The transferable problem underneath it:
Android needs to show a possibly-long, possibly-scrolling list (your
inventory) using a *fixed, small* number of actual on-screen row views,
and it needs a place to put "what happens when a row is tapped" that a
list-rendering system with no idea what your rows mean can still call
correctly. `RecyclerView.Adapter` is Android's answer to both problems
at once, and it's why this file looks the way it does.

## What you need to know first
**Lesson 0: The Java Ideas Python Doesn't Force You to Learn** — this
lesson assumes you're comfortable with: class vs. object, `extends` and
`@Override` (dynamic dispatch), interfaces/functional interfaces and
lambdas as stored-then-later-run callbacks, generics (`<T>`), and static
nested classes. None of those get re-derived here; they get *applied*.

## Terms used in this lesson
- **`View`** — Android's base class for anything drawn on screen and
  interactive (a button, a text label, a whole layout). It exists as the
  one common type every visual element shares, so code that positions,
  sizes, or clicks things can be written once against `View` instead of
  once per widget type.
- **`ViewGroup`** — a `View` that can contain other `View`s (a layout
  container). It exists because "a container of views" is itself
  something code needs to treat uniformly — sizing children, passing
  layout parameters — regardless of which specific layout (linear, grid,
  constraint) it actually is.
- **`Context`** — an Android object representing "the environment this
  code is running in" — access to resources, the current theme, ability
  to start new UI. It exists because many Android APIs (inflating a
  layout, building a dialog) need to know *which* running app/screen
  they're operating inside; a `Context` is that handle passed around
  everywhere for exactly this reason.
- **inflation / `LayoutInflater`** — the process of turning an XML layout
  file into real, live `View` objects in memory. It exists because a
  layout XML file is just a description on disk — nothing can be shown
  or interacted with until something walks it and constructs the actual
  `TextView`, `Button`, etc. objects it describes.
- **`findViewById`** — a method that searches a `View` (usually a whole
  inflated layout) for a child carrying a specific numeric ID and
  returns it, cast to the requested type. It exists as the bridge
  between the XML world (where you wrote `android:id="@+id/itemNameText"`)
  and the Java/Kotlin world (where you need an actual object reference to
  call `.setText(...)` on).
- **the `R` class** — a class Android's build tools *generate*
  automatically from your XML and resource files, giving every layout,
  ID, string, and drawable a real integer constant (`R.layout.item_inventory`,
  `R.id.itemNameText`). It exists so resources can be referenced from
  code as type-checked constants instead of fragile, unchecked string
  filenames — misspelling `R.id.itemNameText` is a compile error;
  misspelling a raw string ID would silently fail at runtime instead.
- **`RecyclerView`** — the on-screen scrolling list widget itself. It
  exists to display a dataset that may be far larger than what fits on
  screen at once, without creating one real view object per data item —
  see "view recycling," below, which is the entire reason this class is
  named what it's named.
- **view recycling** — the specific performance strategy `RecyclerView`
  is built around: instead of creating a new row `View` every time a new
  row scrolls into visibility, it keeps a small pool of already-built row
  views (roughly, enough to cover one screen plus a little buffer) and
  *reuses* them — swapping out only the data they display — as the user
  scrolls. It exists because building a `View` (inflating XML, walking
  the resulting tree) is comparatively expensive; doing it once per
  visible row-slot instead of once per data item, no matter how many
  thousand items exist, is what keeps scrolling smooth.
- **`RecyclerView.Adapter`** — an abstract base class you extend to
  bridge your actual data (a `List<InventoryItem>`) to `RecyclerView`'s
  generic recycling machinery. It exists because `RecyclerView` itself
  has zero knowledge of what an `InventoryItem` is or how it should look
  on screen — the adapter is the only piece of this system that knows
  both "here is my data" and "here is how to draw one row of it."
- **`RecyclerView.ViewHolder`** — a small wrapper object holding onto a
  row's already-found child views (a `TextView`, a `Button`, ...), so
  `findViewById` for that row only ever has to run once, at creation,
  never again on every reuse. It exists purely for that caching — the
  "why do we need this extra class at all" question this lesson answers
  fully below.
- **`AlertDialog`** — a small modal window Android draws on top of the
  current screen, used here to ask "what's the new quantity?" It exists
  as a standard, system-styled way to interrupt the user for a quick
  yes/no or small input, without you hand-building a floating window
  from scratch.
- **`InputType`** — a constant describing what *kind* of text an
  `EditText` should accept and what on-screen keyboard to show for it
  (letters, numbers, a phone pad, ...). It exists so the system keyboard
  can adapt to the expected input — `TYPE_CLASS_NUMBER` here means "show
  the numeric keypad, not a full alphabet," matching the fact that a
  quantity is a number.
- **`getBindingAdapterPosition()`** and **`RecyclerView.NO_POSITION`** —
  a method giving "which row, right now, is this ViewHolder currently
  showing" and a constant (`-1`) meaning "none, this row is in a
  transitional/detached state." They exist together because, thanks to
  recycling, a `ViewHolder`'s row position can *change* out from under a
  listener that was registered earlier — see the Concept Unit below for
  the exact failure this guards against.

## Objects and methods used

**`RecyclerView.Adapter<VH>`**
- *What it is:* An abstract generic class — one that declares some
  methods without bodies (`onCreateViewHolder`, `onBindViewHolder`,
  `getItemCount`) and forces any real subclass to supply them, per the
  same `extends`/`@Override` mechanism covered in Lesson 0.
- *Implementation:* Declared (conceptually) as
  `public abstract class Adapter<VH extends ViewHolder>`, where `VH` is
  a generic type parameter constrained to be *some* `ViewHolder`
  subclass — this is why `InventoryAdapter` fills it in with
  `InventoryAdapter.InventoryViewHolder` specifically. Its three
  abstract methods are `onCreateViewHolder(ViewGroup, int)`,
  `onBindViewHolder(VH, int)`, and `getItemCount()`.
- *Its use:* `InventoryAdapter` extends this to plug your `List<InventoryItem>`
  and your row layout into `RecyclerView`'s generic recycling engine.

**`RecyclerView.ViewHolder`**
- *What it is:* A plain wrapper class, not a `View` itself, whose entire
  purpose is holding a reference to one row's root `View` plus (by
  convention, added by you) references to that row's individual child
  views.
- *Implementation:* Its real constructor signature is
  `ViewHolder(@NonNull View itemView)`, and it exposes the passed-in view
  back out as a public field, `itemView`.
- *Its use:* `InventoryViewHolder` extends it to additionally cache
  `nameText`, `quantityText`, and `deleteButton` — see the Concept Unit
  on view recycling for exactly why caching these matters.

**`LayoutInflater.from(Context).inflate(int, ViewGroup, boolean)`**
- *What it is:* A factory method (`from`) returning a `LayoutInflater`
  tied to a given `Context`, followed by an instance method (`inflate`)
  that turns an XML layout resource into a real `View` tree.
- *Implementation:* `inflate`'s three parameters are: the layout resource
  ID (`R.layout.item_inventory`); the `ViewGroup` the result is *meant*
  to eventually live inside, used to correctly resolve that layout's own
  root-level `layout_width`/`layout_height` attributes even before it's
  actually attached; and a `boolean` for whether to attach it to that
  parent immediately (`false` here, because `RecyclerView` itself
  handles attaching the view at the right moment — attaching it early
  would fight with the recycling system).
- *Its use:* `onCreateViewHolder` calls this exactly once per *newly
  built* row-slot (never per data item — see below) to turn
  `item_inventory.xml` into real, inspectable `View` objects.

**`AlertDialog.Builder`**
- *What it is:* A separate class whose entire job is *constructing* an
  `AlertDialog` step by step, one configuration call at a time, before
  any dialog actually exists on screen. This is the **Builder pattern** —
  see its own Concept Unit below for why this shape exists instead of a
  single giant constructor.
- *Implementation:* Constructed as `new AlertDialog.Builder(Context)`.
  The methods chained onto it in this file — `.setTitle(String)`,
  `.setView(View)`, `.setPositiveButton(String, DialogInterface.OnClickListener)`,
  `.setNegativeButton(String, DialogInterface.OnClickListener)` — each
  return the *same* `Builder` object back (`this`), which is what makes
  chaining them possible; the final `.show()` call is what actually
  builds and displays the real `AlertDialog`, returning it.
- *Its use:* `showEditQuantityDialog` uses it to assemble a small "enter
  a new quantity" popup without manually creating and positioning a
  window.

**`EditText`**
- *What it is:* A `View` subclass — a single-line (by default) editable
  text field.
- *Implementation:* Constructed here as `new EditText(context)`; the
  methods called on it, `setInputType(int)` and `setText(String)` /
  `getText()` (returning an `Editable`, itself convertible via
  `.toString()`), are ordinary instance methods.
- *Its use:* Serves as the dialog's input field for the new quantity,
  pre-filled with the item's current quantity via `setText`.

**`notifyItemChanged(int)` and `notifyItemRemoved(int)`**
- *What it is:* Methods `InventoryAdapter` *inherits* from
  `RecyclerView.Adapter` — not ones it defines. Calling either doesn't
  itself change any data; it's a message *to* `RecyclerView`, telling it
  "the data you're displaying just changed at this position, go
  re-render (or remove) accordingly."
- *Implementation:* `notifyItemChanged(int position)` schedules a call
  back into your own `onBindViewHolder` for that row, so it re-reads the
  (already-updated) data. `notifyItemRemoved(int position)` additionally
  runs a removal animation and shifts every later row's effective
  position down by one.
- *Its use:* Both appear because directly mutating `items` (the `List`)
  is invisible to `RecyclerView` on its own — it doesn't watch the list
  for changes; these calls are the required, explicit "now go redraw"
  signal.

---

## Concept Unit: Why a `ViewHolder` Exists At All

### The Problem
Suppose `InventoryAdapter` skipped `ViewHolder` entirely and instead ran
`rowView.findViewById(R.id.itemNameText)` fresh, every single time a row
needed to display data — including every time the user scrolls one pixel
further and an old off-screen row gets reused for new data. `findViewById`
isn't free: for a deeply nested layout, it walks the view tree looking
for a matching ID. Doing that walk repeatedly, every scroll frame, for
every visible row, for a list the user might scroll through hundreds of
times, is wasted, repeated work computing the exact same answer.

### The real project code
This isn't throwaway — it's your actual class, so the isolate-first order
doesn't apply the same way; instead, look at the real thing first, then
the isolated proof of why it's shaped this way.

```java
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
```

### Mechanical walkthrough
- `static class InventoryViewHolder extends RecyclerView.ViewHolder` —
  a **static nested class** (Lesson 0) — it's declared inside
  `InventoryAdapter` because it has no reason to exist anywhere else —
  extending `RecyclerView.ViewHolder`, the base wrapper type covered
  above.
- `final Button deleteButton;` / `final TextView nameText;` / `final
  TextView quantityText;` — three fields, each `final` (Lesson 0: set
  once, in the constructor, never reassigned after). Being `final` here
  is a real guarantee, not just a style choice: once a row's views are
  found, they can never be silently swapped out for different ones later
  by a bug elsewhere in the file — the compiler enforces it.
- `InventoryViewHolder(View rowView)` — the constructor, taking the
  already-*inflated* root view of one row (built by `onCreateViewHolder`,
  covered next) as its only parameter.
- `super(rowView);` — calls the **parent class's** constructor
  (`RecyclerView.ViewHolder(View itemView)`) with this same view, which
  is what actually populates the inherited `itemView` field mentioned in
  the Objects/methods table above. This must be the first statement in
  the constructor — Java requires the parent to finish initializing
  before the child constructor's own body runs, which matters here
  because `RecyclerView.ViewHolder`'s own internal bookkeeping (like
  tracking this holder's current position) needs to exist before
  anything else touches it.
- `nameText = rowView.findViewById(R.id.itemNameText);` — this is
  `findViewById` (defined above), called exactly here, inside the
  constructor. `R.id.itemNameText` is a constant from the generated `R`
  class, matching an `android:id` written in `item_inventory.xml`.
- `quantityText = ...` and `deleteButton = ...` — the identical call,
  repeated for the other two children, each against its own ID.

### Isolated proof of the caching claim
The claim above — "`findViewById` runs once per row-*slot*, not once per
data item" — isn't something you can see just by reading this file; it's
a claim about *when* Android calls `onCreateViewHolder` versus
`onBindViewHolder`, which is framework behavior, not your code. Android's
own developer documentation states it directly: when a list scrolls, the
already-built view holders are reused and only re-bound — `findViewById`
was already done for them, back when they were first created — while
`onCreateViewHolder` only fires for the small number of holders needed
to initially fill (and slightly overfill) the visible screen area.
<cite index="9-1">Once the RecyclerView needs a new child widget for an element, it invokes onCreateViewHolder, which returns an unpopulated ViewHolder that then gets passed to onBindViewHolder where the data is mapped in</cite> — meaning a *fixed*, small number of `onCreateViewHolder` calls, however large your actual dataset is, with `onBindViewHolder` doing the repeated, cheap work of just swapping in new text and reusing everything that was already found.

### CS lens
This is the **Flyweight pattern** — sharing a small pool of expensive
objects across many logical "instances" instead of building one real
object per logical instance. Also recognized in: font/glyph rendering
(one glyph object shared across every occurrence of the same character
on a page), database connection pools (a fixed pool of real connections
shared across many logical requests), video game engines reusing bullet
or particle objects instead of allocating a new one per shot fired.

### SE lens
The alternative — no `ViewHolder`, fresh `findViewById` calls inside
`onBindViewHolder` every time — is strictly simpler to write and
requires one fewer class. Its real cost is a performance one that only
shows up under load: a short list feels identical either way; a long,
fast-scrolling list without view holder caching visibly stutters,
because the view tree walk for `findViewById` is happening on every
single frame instead of once, ever, per reused slot. `RecyclerView`
doesn't merely *recommend* `ViewHolder` — it structurally requires it
(the generic type parameter `VH extends ViewHolder` forces this), which
is itself an SE decision: making the fast path the only path available,
rather than trusting every adapter author to remember to optimize it
themselves.

---

## Concept Unit: `onCreateViewHolder` — Building a Row-Slot

### Project Change
- **Reference Source:** No external reference file — this is your own
  project's real method, shown in full below.
- **Files affected:** `InventoryAdapter.java` (already exists).
- **Change type:** N/A — reading existing code.
- **Location:** Overridden method, required by extending
  `RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`.

```java
@NonNull
@Override
public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
    View rowView = LayoutInflater.from(parent.getContext())
            .inflate(R.layout.item_inventory, parent, false);
    return new InventoryViewHolder(rowView);
}
```

### Mechanical walkthrough
- `@NonNull` — an annotation (not a runtime check by itself, more a
  documented contract enforced by tooling/lint) asserting this method
  never returns `null`. It exists because `RecyclerView`'s internals
  would otherwise have to defensively null-check every adapter's return
  value; the annotation lets static analysis catch a violating
  `return null;` at build time instead.
- `@Override` — as in Lesson 0: the compiler confirms this signature
  really matches an abstract method `RecyclerView.Adapter` declared,
  catching a typo'd override as a build error instead of a silent no-op.
- `public InventoryViewHolder onCreateViewHolder(ViewGroup parent, int viewType)`
  — the method signature the parent class demands. `viewType` exists for
  lists with multiple *different kinds* of rows (not used here — this
  list has one row shape, so it's accepted but ignored).
- `LayoutInflater.from(parent.getContext())` — as detailed in the
  Objects/methods table: `parent.getContext()` retrieves the `Context`
  the `RecyclerView` itself is running in, and `.from(...)` returns the
  inflater tied to it.
- `.inflate(R.layout.item_inventory, parent, false)` — the three
  arguments, in order: which XML layout to build, which `ViewGroup` it's
  destined for (for correctly resolving layout params), and `false` for
  "don't attach it yet" — `RecyclerView` attaches it itself, at the
  correct moment.
- `View rowView = ...` — the freshly inflated row, stored as type
  `View` — nothing here yet knows about `nameText`/`quantityText`/
  `deleteButton`; that only happens next.
- `return new InventoryViewHolder(rowView);` — calls the constructor
  walked through in the previous Concept Unit, which is exactly where
  the three `findViewById` calls actually happen — once, right here,
  for this specific row-slot.

### Execution trace (timing, not values)
1. `RecyclerView` decides it needs one more row-slot than it currently
   has (e.g., the very first screen fill, or a fast fling revealing more
   space than existing holders cover) and calls `onCreateViewHolder`.
2. Inside it, `inflate(...)` builds a brand-new `View` tree from
   `item_inventory.xml` — this is the "expensive" step the whole
   `ViewHolder` pattern exists to avoid repeating.
3. `new InventoryViewHolder(rowView)` runs its constructor, which itself
   calls `findViewById` three times — also only happening here, once,
   for this row-slot's entire lifetime, no matter how many different
   data items later get displayed through it.
4. The returned `InventoryViewHolder` is now one of `RecyclerView`'s
   small pool of reusable holders; `onCreateViewHolder` will not run
   again for this specific holder — from here on, only `onBindViewHolder`
   (next) touches it, potentially dozens or thousands of times as the
   user scrolls.

### One sentence connecting this unit to what came before
`onCreateViewHolder` is the *one-time*, expensive setup step that makes
the `ViewHolder` caching from the previous unit possible in the first
place — everything expensive (inflating, finding views) happens exactly
here, exactly once per row-slot.

---

## Concept Unit: `onBindViewHolder` — Filling a Row-Slot With Data, and the Click-Listener Position Trap

### Project Change
Same file, next required override.

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

### Mechanical walkthrough
- `@Override` / `public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position)`
  — the second required override; unlike `onCreateViewHolder`, this
  *does* run repeatedly, every time this holder needs to display a
  (possibly different) item, per the caching Concept Unit above.
- `InventoryItem item = items.get(position);` — `position` is *this
  call's* current data index; `items` is the adapter's own field (the
  `List<InventoryItem>` passed into the constructor). `.get(position)`
  is ordinary `List` indexing.
- `holder.nameText.setText(item.getName());` / `holder.quantityText.setText(String.valueOf(item.getQuantity()));`
  — using the fields cached back in `InventoryViewHolder`'s constructor:
  no `findViewById` here, ever — that's the entire payoff of the
  previous two Concept Units, made concrete. `String.valueOf(int)` exists
  because `setText` takes a `CharSequence`/`String`, not a raw `int` —
  Java doesn't implicitly convert numbers to text the way some scripting
  languages do.
- `holder.deleteButton.setOnClickListener((view) -> { ... })` — a
  **lambda**, satisfying `View.OnClickListener`, a **functional
  interface** (Lesson 0) with a single method, `onClick(View v)`. This
  line *registers* the callback; nothing inside it runs yet — exactly
  the `Doorbell.setOnPressListener(...)` shape from Lesson 0, applied for
  real.
- `int currentPosition = holder.getBindingAdapterPosition();` — this is
  the crux of this whole Concept Unit; see "Why not just use `position`"
  below.
- `if (currentPosition != RecyclerView.NO_POSITION) { ... }` — a guard,
  explained in full below.
- `items.remove(currentPosition); notifyItemRemoved(currentPosition);` —
  first mutate the actual data (`List.remove(int)`), *then* tell
  `RecyclerView` about it via the inherited method from the
  Objects/methods table — in that order, deliberately: `RecyclerView`
  re-queries the list when it processes the notification, so the data
  must already reflect the removal.
- `holder.itemView.setOnClickListener((view) -> { ... })` — `itemView`
  is the inherited field from `RecyclerView.ViewHolder` (Objects/methods
  table above), meaning "tap anywhere on this row, not just the delete
  button" — a second, independent listener registration, same pattern.
- `showEditQuantityDialog(view.getContext(), currentPosition);` — calls
  the adapter's own private method (covered next), passing along the
  `Context` retrieved from the tapped `View` itself.

### Why not just use `position`?
This method already receives a `position` parameter — it's reasonable to
expect the lambdas could just close over *that* directly, instead of
calling `getBindingAdapterPosition()`. The reason they don't is a real,
easy-to-miss bug class, worth tracing in full:

1. `onBindViewHolder` runs with, say, `position = 4`, binding a specific
   `holder` to item #4 and registering the two click lambdas above. The
   lambda *captures* `holder` (a reference to the `ViewHolder` object)
   and would, if written that way, also capture the plain `int` value
   `4` — a frozen snapshot, not a live link.
2. The user deletes item #2, elsewhere in the list. `items.remove(2)`
   shifts every later item — including the one this `holder` displays —
   one slot earlier. Item #4 is now item #3. `RecyclerView`, thanks to
   recycling, may reuse and rebind existing holders to reflect this
   shift rather than rebuilding everything — but it does not
   retroactively edit an already-registered lambda's captured `int`.
3. The user now taps delete on that same row. A lambda capturing a
   frozen `position = 4` would call `items.remove(4)` — removing whatever
   item currently occupies slot 4, which is *not* the row the user
   actually tapped, since everything shifted in step 2.
4. `holder.getBindingAdapterPosition()` avoids this entirely by *asking
   the holder, at the exact moment of the tap*, "what position are you
   showing right now?" — a live query against `RecyclerView`'s own
   current bookkeeping, not a value frozen at registration time.

`RecyclerView.NO_POSITION` (a constant equal to `-1`) is the answer
`getBindingAdapterPosition()` gives when a holder is in a transitional
state — mid-removal-animation, or briefly detached — where "which
position is this" has no valid answer yet. The `if` guard exists purely
to make tapping during that narrow window a no-op instead of a crash
(`items.remove(-1)` would throw an `IndexOutOfBoundsException`).

### CS lens
The failure being guarded against here is a classic instance of **stale
references / cache invalidation** — data that was correct when captured
becoming silently wrong after the world underneath it changed, without
anything that captured it being notified. Also recognized in: a stale
database index after a row is deleted elsewhere, a dangling pointer in
C after the memory it pointed to is freed and reused, a cached DNS
lookup outliving the server it once pointed to, an iterator invalidated
by modifying a collection while iterating it.

### SE lens
The alternative — capture `position` directly, skip
`getBindingAdapterPosition()` — is genuinely less code and works
correctly in the common case of a list where nothing is ever
inserted/removed above the tapped row. The cost is a bug that's
specifically *intermittent and data-dependent*: it only manifests when a
user deletes one row and then interacts with a row below it, which is
easy to miss in casual manual testing and easy to reintroduce later if a
future edit "simplifies" this back to capturing `position`. Reaching
into the holder for the live position at click time is the framework's
own documented fix for this exact trap — it costs one extra method call
per click, paid only when a click actually happens, in exchange for
correctness under a mutation pattern (delete-then-click-a-different-row)
that a developer might not think to test for by hand.

### One sentence connecting this unit to what came before
`onBindViewHolder` is where the cheap, repeated half of the `ViewHolder`
tradeoff pays off — reusing already-found views from the previous unit,
while re-registering click listeners defensively enough to survive the
very recycling that makes this efficient in the first place.

---

## Concept Unit: `AlertDialog.Builder` — The Builder Pattern

### Project Change
- **Reference Source:** No external reference — your own private method.
- **Files affected:** `InventoryAdapter.java`.
- **Change type:** N/A — reading existing code.
- **Location:** `showEditQuantityDialog`, called from the `itemView`
  click listener in the unit above.

```java
private void showEditQuantityDialog(Context context, int position) {
    InventoryItem item = items.get(position);
    EditText quantityInput = new EditText(context);
    quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);
    quantityInput.setText(String.valueOf(item.getQuantity()));

    new AlertDialog.Builder(context).setTitle("Update Quantity").setView(quantityInput).setPositiveButton("Save", (dialog, which) -> {
        int newQuantity = Integer.parseInt(quantityInput.getText().toString());
        itemRepository.updateQuantity(item.getId(), newQuantity);
        item.setQuantity(newQuantity);
        notifyItemChanged(position);
    }).setNegativeButton("Cancel", null).show();
}
```

### The Problem
An `AlertDialog` has many optional pieces — a title, a custom view, zero
to several buttons, each with its own label and behavior. A single
constructor taking every possible combination as positional parameters
(`new AlertDialog(context, "Update Quantity", quantityInput, "Save", saveHandler, "Cancel", null, ...)`)
would be unreadable and force callers who want none of the optional
pieces to still pass `null` for all of them, in the right order.

### Isolated proof of the chaining mechanism
```java
class StringBuilderDemo {
    static class Message {
        String title = "";
        String body = "";
        Message setTitle(String t) { this.title = t; return this; }
        Message setBody(String b) { this.body = b; return this; }
        String describe() { return "[" + title + "] " + body; }
    }

    public static void main(String[] args) {
        Message m = new Message().setTitle("Hi").setBody("It works");
        System.out.println(m.describe());
    }
}
```
Compiled and run:
```
[Hi] It works
```
This proves the mechanism, not just the syntax: `new Message()` returns
a `Message`, and `.setTitle("Hi")` is called on *that* returned object —
but `setTitle` itself is written to `return this`, i.e., to hand back
the very same object it was just called on, which is what makes writing
`.setBody("It works")` immediately afterward legal at all. If `setTitle`
returned `void` instead, `.setTitle("Hi").setBody(...)` would be a
compile error — there'd be nothing to call `.setBody` on.

`AlertDialog.Builder`'s real methods work identically:
`.setTitle(String)`, `.setView(View)`, and `.setPositiveButton(...)` each
return the same `Builder` instance they were called on, which is exactly
why the real code can chain five calls in a row on one line before
finally calling `.show()`.

### Mechanical walkthrough of the real code
- `InventoryItem item = items.get(position);` — same `List.get` pattern
  as `onBindViewHolder`, re-fetching the specific item this dialog is
  editing.
- `EditText quantityInput = new EditText(context);` — builds the input
  field, as detailed in the Objects/methods table, using the `Context`
  passed in from the click listener.
- `quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);` — as
  described in Terms above: switches the on-screen keyboard to numeric
  entry, matching that a quantity is a number.
- `quantityInput.setText(String.valueOf(item.getQuantity()));` —
  pre-fills the field with the item's *current* quantity, so editing
  means changing a visible number rather than typing one from scratch.
- `new AlertDialog.Builder(context)` — begins the chain, as walked
  through in the isolated proof above.
- `.setTitle("Update Quantity")` — sets the dialog's header text; returns
  the same builder.
- `.setView(quantityInput)` — places the `EditText` built above inside
  the dialog's body; returns the same builder.
- `.setPositiveButton("Save", (dialog, which) -> { ... })` — registers a
  **lambda** (Lesson 0) satisfying `DialogInterface.OnClickListener`, a
  functional interface with method `onClick(DialogInterface dialog, int which)` —
  registered now, run only if and when the user actually taps "Save."
  Inside that lambda:
  - `int newQuantity = Integer.parseInt(quantityInput.getText().toString());`
    — `.getText()` returns an `Editable` (the live, mutable text
    content); `.toString()` converts it to a plain `String`;
    `Integer.parseInt` converts that string to an `int`, and would throw
    `NumberFormatException` on non-numeric input — a real gap this
    lesson flags rather than papers over: `TYPE_CLASS_NUMBER` above
    steers the on-screen keyboard toward digits but does not itself
    forbid every non-numeric input on every device, so this call is not
    fully guarded.
  - `itemRepository.updateQuantity(item.getId(), newQuantity);` — calls
    out to the app's data layer, persisting the change beyond just this
    screen.
  - `item.setQuantity(newQuantity);` — also updates the in-memory
    `InventoryItem` object directly, so the adapter's own copy of the
    data agrees with what was just saved.
  - `notifyItemChanged(position);` — the inherited method from the
    Objects/methods table, telling `RecyclerView` to re-run
    `onBindViewHolder` for this row so the updated quantity actually
    appears on screen.
- `.setNegativeButton("Cancel", null)` — registers a "Cancel" button
  with a `null` listener — a valid, common shorthand meaning "just close
  the dialog, run no extra code."
- `.show()` — the call that actually builds and displays the real
  `AlertDialog` on screen; everything before it was configuration only,
  per the Builder pattern itself.

### CS / SE lens
This is the **Builder pattern**: separate the *step-by-step
construction* of a complex object from its final representation,
letting each construction step be optional and readably named. The
alternative — a giant multi-parameter constructor, or a series of setter
calls on an already-`show()`n dialog — either becomes unreadable at the
parameter count `AlertDialog` needs, or requires the dialog to already
exist (and potentially flicker/reflow) before it's fully configured.
The Builder's cost is indirection: reading `new AlertDialog.Builder(...)`
you're touching a *different* object (the builder) than the one that
eventually appears on screen (the dialog), which can be genuinely
confusing the first time you meet it — exactly why the isolated
`Message`/`StringBuilderDemo` proof above exists, stripped down to the
one mechanical fact (`return this`) that makes the whole pattern legal
Java at all. Also recognized in: Java's own `StringBuilder`, most HTTP
client libraries' request-building APIs, SQL query builders, Android's
own `Notification.Builder`.

### One sentence connecting this unit to what came before
This dialog only exists because `onBindViewHolder`'s `itemView` click
listener called it — and its final `notifyItemChanged` call is the same
inherited method covered in that unit's Objects/methods entry, closing
the loop back to the row actually updating on screen.

---

## Concept Unit: `getItemCount`

### Project Change
Third and final required override.

```java
@Override
public int getItemCount() {
    return items.size();
}
```

### Mechanical walkthrough
- `@Override` / `public int getItemCount()` — the last of the three
  methods `RecyclerView.Adapter<VH>` requires; unlike the other two,
  it's a single expression with no branching.
- `return items.size();` — `items` is the adapter's own `List` field;
  `.size()` is `List`'s ordinary method for its element count. This is
  the only place `RecyclerView` learns *how many* row-slots worth of
  content exist in total — everything about scrollbar sizing, how far
  the user can scroll, and when `position` values in `onBindViewHolder`
  stop being valid, traces back to this one number.

### CS lens
This is the adapter fulfilling the last third of a simple, complete
contract: create a slot, fill a slot, report how many logical items
exist. All three together are what let `RecyclerView`'s internals stay
entirely ignorant of `InventoryItem` as a concept — they only ever see
"some count of things," "a slot," and "fill this slot with item N."

### One sentence connecting this unit to what came before
Every `position` value the previous two Concept Units received from
`RecyclerView` is guaranteed to satisfy `0 <= position < getItemCount()`
— this method is what makes that guarantee possible to give at all.

---

## Closing

**Connect the pieces — one item, start to finish.** Say the inventory
has an item "Bolts," quantity 12, at index 2. The very first time it
scrolls into view, `RecyclerView` calls `onCreateViewHolder` (if no
existing holder is free to reuse), inflating `item_inventory.xml` once
and running `InventoryViewHolder`'s constructor, which finds
`nameText`/`quantityText`/`deleteButton` exactly once. `RecyclerView`
then calls `onBindViewHolder(holder, 2)`: `items.get(2)` fetches
"Bolts"/12, `nameText.setText("Bolts")` and
`quantityText.setText("12")` run using the already-cached views, and two
click listeners are freshly registered on this specific `holder`. The
user taps the row (not the delete button): `itemView`'s lambda fires,
queries `holder.getBindingAdapterPosition()` (still `2`, nothing was
deleted), and calls `showEditQuantityDialog(context, 2)`. That method
builds an `EditText` pre-filled with "12," chains an `AlertDialog.Builder`
through title/view/buttons, and shows it. The user changes it to "20" and
taps Save: the lambda parses `20`, calls `itemRepository.updateQuantity(...)`,
sets `item.setQuantity(20)` on the in-memory object, and calls
`notifyItemChanged(2)` — which triggers `RecyclerView` to call
`onBindViewHolder(holder, 2)` again, this time reading the now-updated
quantity and calling `quantityText.setText("20")`. Not one `findViewById`
call happened anywhere in that second pass.

**What breaks without this.** In a copy of the project, change
`holder.getBindingAdapterPosition()` in the delete listener back to the
plain `position` parameter from `onBindViewHolder`'s signature (this
requires making it `final` or otherwise capturable, matching the trap
described above). Add three items, delete the first one, then tap delete
on what is now the first row again (originally the second item). Watch
which item actually disappears — it will not be the one that was tapped,
reproducing the stale-position bug this lesson traced in detail. Revert
the change afterward.

**Exercises.**
1. Add a `Toast.makeText(...)` call (look up its real signature) inside
   the `NumberFormatException` gap flagged in the `AlertDialog.Builder`
   walkthrough, so a non-numeric quantity shows a message instead of
   crashing. This requires a `try`/`catch` — a language feature this
   lesson series hasn't covered yet; treat it as a deliberate small
   stretch.
2. Add a fourth field to `InventoryItem` (e.g., a category string) and
   thread it through: a new `TextView` in `item_inventory.xml`, a new
   cached field in `InventoryViewHolder`, and a new `setText` call in
   `onBindViewHolder`. This exercises every Concept Unit in this lesson
   in the order they'd actually be touched in a real change.

**Definition of done.**
- [ ] You can explain, without looking back, why `ViewHolder` exists at
      all — not just that it does.
- [ ] You can explain why `getBindingAdapterPosition()` is used instead
      of the `position` parameter, including the specific sequence of
      events (delete elsewhere, then click) that makes the difference
      observable.
- [ ] You can point to the exact line where `AlertDialog.Builder`'s
      chain actually causes the dialog to appear, versus the lines that
      only configure it.
- [ ] `git commit` with a message explaining *why* you now understand
      this file, not what it does — e.g. "Understand InventoryAdapter:
      ViewHolder caching avoids repeated findViewById, and
      getBindingAdapterPosition avoids stale-index bugs after deletes,"
      not "read InventoryAdapter.java."

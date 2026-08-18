# Lesson 1.4: `AlertDialog.Builder` — The Builder Pattern

## What you will build

Nothing new yet — this is a full, real read of the fourth piece of
`InventoryAdapter`: the private method `onBindViewHolder`'s `itemView`
listener (Lesson 1.3) calls when a row is tapped. The transferable
problem: a dialog has several optional pieces — a title, a custom input
view, one or more buttons, each with its own label and behavior — and
something has to let each piece be configured one at a time, readably,
without a single constructor call drowning in positional arguments.

## What you need to know first

**Lesson 1.3** — that this method is called as
`showEditQuantityDialog(view.getContext(), currentPosition)`, from the
`itemView` tap listener already covered. **Lesson 1.1** — `Context`,
`View`, and `InventoryItem`'s getters/setters. **Lesson 0** — functional
interfaces and lambda expressions, both reappearing below with their own
full treatment.

## Terms used in this lesson

- **`Context`** (reappearing, Lesson 1.2) — an Android object
  representing "the environment this code is running in." It exists
  because building most real UI — a dialog included — needs to know
  *which* running app/screen it belongs to; this method receives one
  directly as a parameter, rather than borrowing it from a `View` the
  way Lesson 1.2's method had to.
- **functional interface** (reappearing, Lesson 0) — an interface
  declaring exactly one abstract method, letting a lambda expression
  stand in for a full implementation of it with no need to name which
  method is being implemented.
- **lambda expression** (reappearing, Lesson 0) — a compact, unnamed,
  inline implementation of a functional interface's single method; the
  code inside it does not run when it's written, only later, whenever
  whatever holds onto it actually calls that one method.
- **`InputType`** — a constant describing what *kind* of text an
  `EditText` should accept, and which on-screen keyboard to show for it.
  It exists so the system keyboard can adapt to the expected input —
  `TYPE_CLASS_NUMBER`, used below, means "show the numeric keypad, not a
  full alphabet," matching that a quantity is a number.

## Objects and methods used

**`showEditQuantityDialog(Context, int)`**
- *What it is:* a private method `InventoryAdapter` declares on itself —
  not an override, not inherited from anywhere. It is this lesson's own
  subject.
- *Implementation:* `private void showEditQuantityDialog(Context context, int position)`
  — takes the tapped row's own `Context` and its live position, and
  returns nothing; its entire effect is building and showing a real
  dialog.
- *Its use:* called once, from Lesson 1.3's `itemView` click listener,
  each time a row is tapped.

**`EditText`**
- *What it is:* a real `View` subclass — specifically, a subclass of
  `TextView` (Lesson 1.3) — a single-line, user-editable text field.
- *Implementation:* constructed here as `new EditText(context)`; the
  method called on it to restrict input, `setInputType(int)`, is real:
  `public void setInputType(int type)`. Because `EditText extends
  TextView`, its `setText(CharSequence)` call below is the exact same
  inherited method Lesson 1.3 already gave full treatment to — not a
  new method, just a new receiver.
- *Its use:* serves as this dialog's input field for the new quantity,
  restricted to numeric entry and pre-filled with the item's current
  quantity.

**`AlertDialog.Builder`**
- *What it is:* a separate class whose entire job is *constructing* an
  `AlertDialog` step by step, one configuration call at a time, before
  any real dialog exists on screen.
- *Implementation:* constructed as `new AlertDialog.Builder(Context)`.
  The methods chained onto it below — `.setTitle(String)`,
  `.setView(View)`, `.setPositiveButton(String, DialogInterface.OnClickListener)`,
  `.setNegativeButton(String, DialogInterface.OnClickListener)` — each
  return the *same* `Builder` object (`this`) they were called on, which
  is what makes chaining them legal at all; the final `.show()` call
  builds and displays the real `AlertDialog`.
- *Its use:* assembles the "enter a new quantity" popup this lesson's
  method exists to build.

**`DialogInterface.OnClickListener`**
- *What it is:* a real functional interface (Terms, above) — a
  different one from `View.OnClickListener` (Lesson 1.3), despite the
  similar name.
- *Implementation:* `void onClick(DialogInterface dialog, int which)` —
  two parameters, not one: `dialog` is the real dialog the click
  happened on, and `which` identifies *which* button was tapped, for
  dialogs with more than one differently-behaving button.
- *Its use:* implemented twice below by two separate lambdas, one for
  `setPositiveButton`, one (trivially, as `null`) for
  `setNegativeButton` — neither lambda body actually reads `dialog` or
  `which`, since each button already knows unambiguously what it means
  for *it* specifically to be tapped.

**`EditText.getText()` and `Editable`**
- *What they are:* an ordinary instance method on `EditText` (inherited,
  really, from `TextView`), and the real interface type it returns.
- *Implementation:* `public Editable getText()` — `Editable` (a real
  Android interface, `android.text.Editable`, extending `CharSequence`)
  represents the field's *live*, mutable, currently-typed text — not a
  frozen snapshot. `Editable` declares its own `toString()`, inherited
  from `Object` and overridden to return an actual immutable `String`
  copy of whatever the field currently holds.
- *Its use:* `.getText()` gets the live content; `.toString()`,
  immediately after, freezes it into a plain `String` — required because
  `Integer.parseInt`, next, demands a `String`, not an `Editable`.

**`Integer.parseInt(String)`**
- *What it is:* a `static` method on `java.lang.Integer`.
- *Implementation:* `public static int parseInt(String s)` — parses a
  string of digits into a primitive `int`; throws a real
  `NumberFormatException` if the string contains anything that isn't a
  valid integer.
- *Its use:* converts the dialog's typed text back into a real `int`,
  the type `updateQuantity`'s own real signature (a later lesson's
  subject) will eventually require.

**`RecyclerView.Adapter.notifyItemChanged(int)`**
- *What it is:* a method `InventoryAdapter` inherits from
  `RecyclerView.Adapter` — the direct sibling of Lesson 1.3's
  `notifyItemRemoved(int)`, told "changed" instead of "removed."
- *Implementation:* `public final void notifyItemChanged(int position)` —
  schedules a call back into `onBindViewHolder` (Lesson 1.3) for that
  one position, so it re-reads the now-updated data; no removal
  animation, no position shift for any other row.
- *Its use:* called after the in-memory quantity is updated, so the row
  visibly refreshes to show the new number.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`InventoryItem.getQuantity()` / `.setQuantity(int)`** (reappearing)
  - *What they are:* ordinary accessor and mutator on the project's own
    data model class.
  - *Implementation:* plain field read and field write.
  - *Its use:* read once to pre-fill the dialog, written once after the
    user saves, so the in-memory object matches what's about to be
    shown on screen.
- **`String.valueOf(int)`** (reappearing, Lesson 1.3)
  - *What it is:* a `static` method on `java.lang.String` converting a
    primitive `int` into a `String`.
  - *Implementation:* `public static String valueOf(int i)`.
  - *Its use:* converts the item's current quantity for pre-filling the
    input field, for the identical overload-resolution reason Lesson
    1.3 proved: `setText` has no safe raw-`int` overload to fall back on
    here that means what this code wants.

---

## Concept Unit: `AlertDialog.Builder` — The Builder Pattern

### The Problem

`AlertDialog` has many optional, independently-configurable pieces — a
title, a custom input view, one or more buttons with their own labels
and behaviors. A single constructor taking every possible combination as
positional parameters
(`new AlertDialog(context, "Update Quantity", quantityInput, "Save", saveHandler, "Cancel", null, ...)`)
would be unreadable, and would force every caller who wants none of the
optional pieces to still pass `null` for all of them, in the exact right
order.

### Project Change

- **Reference Source:** No external reference file in this repo — this
  is your own Android Studio project's real `InventoryAdapter.java`,
  already built in `android-ui-foundations`. Shown in full below exactly
  as it already stands; nothing in this unit changes it. This unit's own
  code intentionally shows the state *before* `android-persistence-lab`'s
  own Lesson 07 later adds a real database write here — that line does
  not exist yet at this point in the curriculum.
- **Files affected:** `InventoryAdapter.java` (already exists).
- **Change type:** N/A — reading existing code.
- **Location:** the private method `showEditQuantityDialog`, called from
  the `itemView` click listener Lesson 1.3 already covered.
- **Dependencies:** none new.

### The New Code

```java
private void showEditQuantityDialog(Context context, int position) {
    InventoryItem item = items.get(position);
    EditText quantityInput = new EditText(context);
    quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);
    quantityInput.setText(String.valueOf(item.getQuantity()));

    new AlertDialog.Builder(context).setTitle("Update Quantity").setView(quantityInput).setPositiveButton("Save", (dialog, which) -> {
        int newQuantity = Integer.parseInt(quantityInput.getText().toString());
        item.setQuantity(newQuantity);
        notifyItemChanged(position);
    }).setNegativeButton("Cancel", null).show();
}
```

### The Updated Project

`InventoryAdapter.java`, as it stands at the end of this unit — the
field, constructor, `onCreateViewHolder`, and `onBindViewHolder` predate
this unit (Lessons 1.1–1.3); the nested class is exactly Lesson 1.1's;
the method below is this unit's own addition:

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

    private void showEditQuantityDialog(Context context, int position) {        // ← new
        InventoryItem item = items.get(position);                              // ← new
        EditText quantityInput = new EditText(context);                       // ← new
        quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);              // ← new
        quantityInput.setText(String.valueOf(item.getQuantity()));            // ← new

        new AlertDialog.Builder(context)                                       // ← new
            .setTitle("Update Quantity")                                       // ← new
            .setView(quantityInput)                                            // ← new
            .setPositiveButton("Save", (dialog, which) -> {                    // ← new
                int newQuantity = Integer.parseInt(quantityInput.getText().toString()); // ← new
                item.setQuantity(newQuantity);                                 // ← new
                notifyItemChanged(position);                                   // ← new
            })                                                                 // ← new
            .setNegativeButton("Cancel", null)                                 // ← new
            .show();                                                           // ← new
    }                                                                          // ← new

    @Override
    public int getItemCount() {
        return items.size();
    }

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

`InventoryAdapter` can now do four things: build a row-slot, fill it with
data and click listeners, and — new here — show a real, working dialog
that lets the user actually change a quantity. (`getItemCount`, shown
here for completeness since it already exists, is Lesson 1.5's own
subject.)

### Introduce the Concept in Isolation

The claim above — "each configuration call has to return the same
builder object for chaining to be legal at all" — is provable directly.
`code/android-persistence-lab/BuilderChainDemo.java`:

```java
public class BuilderChainDemo {

    static class Message {
        String title = "";
        String body = "";

        Message setTitle(String t) {
            this.title = t;
            return this;
        }

        Message setBody(String b) {
            this.body = b;
            return this;
        }

        String describe() {
            return "[" + title + "] " + body;
        }
    }

    public static void main(String[] args) {
        Message m = new Message().setTitle("Update Quantity").setBody("Enter a new value");
        System.out.println(m.describe());
    }
}
```

Real, actually-run output, this session:

```
[Update Quantity] Enter a new value
```

This proves the mechanism, not just the syntax: `new Message()` returns a
`Message`; `.setTitle(...)` is called on *that* object, and because
`setTitle` is written to `return this` — hand back the very same object
it was just called on — writing `.setBody(...)` immediately afterward is
legal at all. This is called the **Builder pattern**: separating the
step-by-step construction of a complex object from its final form,
letting each construction step be optional and readably named, one call
at a time.

**What breaks without `return this`**, proven directly.
`code/android-persistence-lab/BuilderChainBroken.java` changes only
`setTitle`'s return type, from `Message` to `void`:

```java
public class BuilderChainBroken {

    static class Message {
        String title = "";
        String body = "";

        void setTitle(String t) {
            this.title = t;
        }

        Message setBody(String b) {
            this.body = b;
            return this;
        }
    }

    public static void main(String[] args) {
        Message m = new Message().setTitle("Update Quantity").setBody("Enter a new value");
    }
}
```

Real, actually-attempted compiler output, this session:

```
BuilderChainBroken.java:18: error: void cannot be dereferenced
        Message m = new Message().setTitle("Update Quantity").setBody("Enter a new value");
                                                             ^
1 error
```

This is not a vague "it wouldn't work" — it's a real, specific compiler
error, at the exact character where `.setBody` tries to call a method on
whatever `setTitle` returned. `void` is not an object; there is nothing
to call `.setBody` on, and the compiler says exactly that.
`AlertDialog.Builder`'s real methods — `.setTitle(String)`, `.setView(View)`,
`.setPositiveButton(...)` — all return the same `Builder` instance,
exactly like the working version above, which is why the real code can
chain five calls in a row before finally calling `.show()`.

### Discard the Throwaway Example

Both `BuilderChainDemo.java` and `BuilderChainBroken.java` exist only to
prove the chaining mechanism and its failure mode, in isolation. Neither
is part of the Android project — the real mechanism they prove carries
forward into `AlertDialog.Builder`, discussed in real Android terms
next.

### Mechanical Walkthrough

- `private void showEditQuantityDialog(Context context, int position)`
  — this lesson's own subject (Objects and methods, above); `context`
  arrives as a plain parameter this time, rather than being fetched via
  `getContext()` the way Lesson 1.2's method had to.
- `InventoryItem item = items.get(position);` — the identical
  **instance method call**, `List.get(int)`, as Lesson 1.3 — re-fetching
  the specific item this dialog is about to edit.
- `EditText quantityInput = new EditText(context);` — a **constructor
  call** (Objects and methods, above), building a real, empty input
  field, using the `Context` this method received directly.
- `quantityInput.setInputType(InputType.TYPE_CLASS_NUMBER);` — an
  **instance method call** on `quantityInput`; `InputType.TYPE_CLASS_NUMBER`
  is a **static constant** (Terms, above) telling the system keyboard to
  show digits only, matching that a quantity is a number.
- `quantityInput.setText(String.valueOf(item.getQuantity()));` — the
  identical **instance method call**, `setText(CharSequence)`, as Lesson
  1.3 (reappearing — `EditText` inherits it from `TextView`, unchanged);
  `String.valueOf(...)` is the same **static method call** (Terms,
  above) converting the primitive `int` `getQuantity()` returns, for the
  identical overload-resolution reason already proven.
- `new AlertDialog.Builder(context)` — a **constructor call** (Objects
  and methods, above), beginning the chain proven in isolation above.
- `.setTitle("Update Quantity")` — an **instance method call** on the
  builder, setting the dialog's header text; returns the same builder.
- `.setView(quantityInput)` — an **instance method call**, placing the
  `EditText` built above inside the dialog's body; returns the same
  builder.
- `.setPositiveButton("Save", (dialog, which) -> { ... })` — an
  **instance method call**; its second argument is a **lambda
  expression** (Terms, above) implementing `DialogInterface.OnClickListener`
  (Objects and methods, above) — registered now, run only if and when
  the user actually taps "Save." Neither `dialog` nor `which` is read
  inside the lambda's own body, the same accepted-but-unused pattern
  Lesson 1.2's `viewType` parameter already established.
  - `int newQuantity = Integer.parseInt(quantityInput.getText().toString());`
    — `.getText()` is an **instance method call** returning a real
    `Editable` (Objects and methods, above); `.toString()` is an
    **instance method call** converting it to a plain `String`;
    `Integer.parseInt(...)` is a **static method call** (Objects and
    methods, above) converting that `String` into a real `int` — and
    would throw a real `NumberFormatException` on non-numeric input, a
    gap this lesson flags rather than papers over: `TYPE_CLASS_NUMBER`
    above steers the on-screen keyboard toward digits, but does not
    itself forbid every non-numeric input on every device, so this call
    is not fully guarded.
  - `item.setQuantity(newQuantity);` — an **instance method call**
    (Everything else, above), updating the in-memory object directly.
  - `notifyItemChanged(position);` — the **inherited instance method
    call** (Objects and methods, above), telling `RecyclerView` to
    re-run `onBindViewHolder` for this one row so the updated quantity
    actually appears on screen.
- `.setNegativeButton("Cancel", null)` — an **instance method call**
  registering a "Cancel" button whose second argument is the literal
  `null`, a valid, common shorthand for "just close the dialog, run no
  extra code" — `AlertDialog.Builder`'s own real implementation checks
  for `null` before ever attempting to call `onClick` on it.
- `.show()` — the final **instance method call** in the chain — the one
  call that actually builds and displays the real `AlertDialog`;
  everything before it was configuration only.

### CS Lens

This is the **Builder pattern**, named at the moment its proof ran,
above: separating the step-by-step construction of a complex object from
its final representation, letting each construction step be optional and
readably named. Also recognized in: Java's own `StringBuilder`, most HTTP
client libraries' request-building APIs, SQL query builders, and
Android's own `Notification.Builder`.

### SE Lens

The alternative — a giant multi-parameter constructor, or a series of
setter calls on an already-`show()`n dialog — either becomes unreadable
at the parameter count `AlertDialog` genuinely needs, or requires the
dialog to already exist (and potentially flicker or reflow) before it's
fully configured. The Builder's real cost is indirection: reading `new
AlertDialog.Builder(...)`, you're touching a *different* object (the
builder) than the one that eventually appears on screen (the dialog) —
genuinely confusing the first time, which is exactly why
`BuilderChainDemo`/`BuilderChainBroken` exist above, stripped down to the
one mechanical fact (`return this`, and what breaks without it) that
makes the whole pattern legal Java at all.

### Commands Needed

```bash
cd code/android-persistence-lab
javac BuilderChainDemo.java && java BuilderChainDemo
javac BuilderChainBroken.java
```

- `javac BuilderChainDemo.java && java BuilderChainDemo` — compiles and
  runs the working version; the `&&` runs the second command only if the
  first succeeds, which it does here, silently, before printing its
  output.
- `javac BuilderChainBroken.java` — deliberately just the compile step;
  there is nothing to run, since this file is not expected to produce a
  `.class` file at all.

### Run It — Real Output

Both already shown in full above, under "Introduce the Concept in
Isolation" — the actual, unedited output (and compiler error) of the
commands just listed, run this session.

### Connecting Sentence

This dialog only exists because Lesson 1.3's `itemView` click listener
called it, and its final `notifyItemChanged` call is the same inherited
method family Lesson 1.3 already covered (there, `notifyItemRemoved`),
closing the loop back to the row actually updating on screen.

---

## Connect the Pieces

One trace, start to finish: a tap on a row calls
`showEditQuantityDialog(context, 2)` for an item, "Bolts," quantity
`12`. A real `EditText`, restricted to digits, is built and pre-filled
with `"12"`. `AlertDialog.Builder` chains through title, view, and both
buttons, then `.show()` displays it for real. The user changes the field
to `"20"` and taps Save: `Integer.parseInt` converts it to the real `int`
`20`, `item.setQuantity(20)` updates the in-memory object, and
`notifyItemChanged(2)` — Lesson 1.3's sibling method — triggers
`onBindViewHolder(holder, 2)` to run again, this time reading the
already-updated quantity and calling `quantityText.setText("20")`.

## What Breaks Without This

Both failure modes were already caused and observed for real, this
session: `BuilderChainBroken.java` shows the actual compiler error from
removing `return this` on one setter; separately, in a scratch copy of
the real method, removing `notifyItemChanged(position);` (keeping
`item.setQuantity(...)` in place) would update the in-memory object
correctly but leave the visible row showing its old quantity until the
next unrelated scroll happened to rebind it — a real, observable
staleness with no crash and no error, just a wrong number on screen.

## Exercises

1. In `BuilderChainDemo.java`, add a third chained call,
   `.setUrgent(true)`, following the same `return this` shape, and
   confirm the four-call chain still compiles and runs.
2. In a scratch copy of `BuilderChainBroken.java`, fix it by restoring
   `Message` as `setTitle`'s return type and adding `return this;` —
   confirm it now compiles and matches `BuilderChainDemo`'s own behavior.

## Definition of Done

- [ ] You ran `BuilderChainDemo.java` and got the real, printed
      `[Update Quantity] Enter a new value` output.
- [ ] You caused the real `void cannot be dereferenced` compiler error
      yourself and can explain, in your own words, exactly what `void`
      lacks that made `.setBody(...)` illegal.
- [ ] You can name `EditText.getText()`'s real return type and why
      `Integer.parseInt` needs an extra `.toString()` call before it can
      run.
- [ ] `git commit` with a message explaining *why* you now understand
      this method — e.g. "Understand showEditQuantityDialog: return
      this is what makes AlertDialog.Builder's chain legal, proven by
      breaking it on purpose," not "read showEditQuantityDialog."

Next: Lesson 1.5 — `getItemCount`, the shortest and simplest of the five,
closing out this read of `InventoryAdapter`.

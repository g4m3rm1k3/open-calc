# Lesson 9: `EditText` and Why a Keyboard Hint Isn't a Guarantee

**What you will build:** A real Add Item form — three `EditText` fields
(name, quantity, location) and a working "Add" button above the
existing list — replacing the five hardcoded `items.add(new Item(...))`
calls from before as the *only* way new inventory ever appears. Tap
"Add" with a real name, a real number, and a real location, and the new
item shows up in the list immediately, no app restart, no editing Java
source to add a sixth item. The transferable problem underneath it:
`android:inputType="number"` looks like it should guarantee the text
you get back is a valid number — it doesn't. It only changes which
on-screen keyboard shows up. What actually reaches your code is still
just a `String`, and that `String` can be empty, or missing entirely,
regardless of which keyboard the user was shown.

**What you need to know first:** Lesson 6a (`RecyclerView`, why
looping and rebuilding views by hand doesn't scale). Lesson 6e
(`InventoryAdapter`, `onBindViewHolder`, the `List<Item> items` field
it wraps). Lesson 7 (`Item`, its `name`/`quantity`/`location` fields
and constructor). Lesson 8 (`InventoryActivity`'s current `onCreate`,
five hardcoded seed items, the click-lambda that opens
`ItemDetailActivity`).

**Terms introduced in this lesson:**
- **`EditText`** — the Android widget for accepting typed user input,
  as opposed to `TextView` (display-only) or `Button` (tap-only).
- **`android:hint`** — placeholder text shown only while a field is
  empty; never part of the field's actual returned value.
- **`android:inputType`** — hints which on-screen keyboard to show,
  covered fully in the next Concept Unit.
- **`Integer.parseInt(String)`** — a `static` method converting a
  `String` to the `int` it represents, throwing `NumberFormatException`
  if the string isn't a valid whole number.
- **`try`/`catch`** — a structured escape hatch: code inside `try` that
  fails doesn't crash the whole program; the matching `catch` block
  decides what "recovery" means instead, and everything after the
  failure point inside `try` is skipped.
- **`NumberFormatException`** — the specific exception `Integer.parseInt`
  throws when given text that isn't a valid whole number.
- **Layout partitioning** — splitting a screen into a fixed-size region
  (a form) and a fill-remaining-space region (a scrolling list), each
  sized by a rule stated once rather than a hardcoded number.
- **Boundary between presentation and validation** — a UI hint that
  shapes how input is collected (which keyboard shows) says nothing
  about whether that input is actually correct; the two are easy to
  conflate and that conflation is a common, real source of bugs.
- **`notifyItemInserted(position)`** — a `RecyclerView.Adapter` method
  telling the `RecyclerView` exactly which position just gained a new
  row.
- **`EditText.getText()`** — returns an `Editable`, Android's mutable,
  in-place-editable character sequence, not a `String` directly.
- **`String.isEmpty()`** — returns whether a string has zero
  characters.
- **`final` on a local variable / effectively final lambda capture** —
  a lambda can only read a local variable from its enclosing method if
  that variable is `final` or effectively final (never reassigned after
  its first value); otherwise it fails to compile.

---

## Concept Unit: `EditText` — Android's Text-Input Widget

### The Problem

Every inventory item so far has been typed directly into
`InventoryActivity.java`'s source code, by you, at compile time. A real
app can't ask its user to edit Java and recompile just to record a new
box of screws. The screen needs a widget the user can actually type
into, and code that can read back whatever they typed, whenever "Add"
is tapped.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `activity_inventory.xml`; `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** A new form section above the existing `RecyclerView` in
  `activity_inventory.xml`; new field lookups and a new click listener
  in `InventoryActivity.onCreate`.
- **Dependencies:** none new.

### The New Code — Making Room for the Form

`activity_inventory.xml` currently has exactly one child: the
`RecyclerView`, constrained to fill the whole screen. That has to
change — the form needs to sit above the list, not underneath it.

```xml
<LinearLayout
    android:id="@+id/addItemForm"
    android:orientation="vertical"
    android:layout_width="0dp"
    android:layout_height="wrap_content"
    android:padding="16dp"
    app:layout_constraintTop_toTopOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintEnd_toEndOf="parent">

    <EditText
        android:id="@+id/nameInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:hint="Item name"
        android:inputType="text" />

    <EditText
        android:id="@+id/quantityInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:hint="Quantity"
        android:inputType="number" />

    <EditText
        android:id="@+id/locationInput"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:hint="Location"
        android:inputType="text" />

    <Button
        android:id="@+id/addItemButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Add Item" />

</LinearLayout>
```

### The Updated Project

```xml
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <LinearLayout
        android:id="@+id/addItemForm"                                       <!-- ← new -->
        android:orientation="vertical"                                       <!-- ← new -->
        android:layout_width="0dp"                                           <!-- ← new -->
        android:layout_height="wrap_content"                                 <!-- ← new -->
        android:padding="16dp"                                               <!-- ← new -->
        app:layout_constraintTop_toTopOf="parent"                            <!-- ← new -->
        app:layout_constraintStart_toStartOf="parent"                        <!-- ← new -->
        app:layout_constraintEnd_toEndOf="parent">                          <!-- ← new -->

        <EditText
            android:id="@+id/nameInput"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:hint="Item name"
            android:inputType="text" />

        <EditText
            android:id="@+id/quantityInput"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:hint="Quantity"
            android:inputType="number" />

        <EditText
            android:id="@+id/locationInput"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:hint="Location"
            android:inputType="text" />

        <Button
            android:id="@+id/addItemButton"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="8dp"
            android:text="Add Item" />

    </LinearLayout>

    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/inventoryRecyclerView"
        android:layout_width="match_parent"
        android:layout_height="0dp"                                          <!-- ← changed (was match_parent) -->
        app:layout_constraintTop_toBottomOf="@id/addItemForm"                 <!-- ← changed (was toTopOf parent) -->
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>
```

The screen now has two regions instead of one: a fixed-height form
pinned to the top, and the list filling every pixel left over —
`0dp` height plus two vertical constraints (`toBottomOf` the form,
`toBottomOf` the parent) is what "fill the remaining space" actually
means to `ConstraintLayout`, the same shape the tap-counter `TextView`
used to sit below the title, now applied to a much larger sibling.

### Mechanical Walkthrough

- `<LinearLayout ... android:orientation="vertical">` — reappearing,
  the same stacking container used for the Add row inside a list item
  earlier, now holding the whole form instead of one row's contents.
- `android:layout_width="0dp"` paired with
  `app:layout_constraintStart_toStartOf="parent"` /
  `app:layout_constraintEnd_toEndOf="parent"` — reappearing constraint
  shape: `0dp` plus constraints on *both* opposite edges means "stretch
  to fill whatever space those two constraints leave," the same
  meaning it has every other place this project has used it.
- `<EditText ... />` — **first appearance.** The actual widget a user
  taps to bring up a keyboard and type into — until this lesson, every
  screen in this project only ever *displayed* text (`TextView`) or
  reacted to a tap (`Button`); this is the first widget whose entire
  job is accepting typed input.
- `android:hint="Item name"` — **first appearance.** Placeholder text
  shown only while the field is empty, in a dimmer color than real
  typed text, and never actually part of the field's value — reading
  an empty `EditText` back never returns its hint text, only an empty
  string.
- `android:inputType="text"` / `android:inputType="number"` — **first
  appearance**, covered fully in the next Concept Unit: which on-screen
  keyboard Android shows for this field. `text` shows a normal
  alphanumeric keyboard; `number` shows a numeric-only keypad.
- `<Button ... android:text="Add Item" />` — reappearing, identical
  shape to every other button already in this project.
- `app:layout_constraintTop_toBottomOf="@id/addItemForm"` — reappearing
  constraint shape (a sibling's bottom edge as an anchor, not
  `"parent"`), now anchoring the list below the form instead of a
  `TextView` below a title.

### CS Lens

Splitting the screen into a fixed-size region (the form) and a
fill-remaining-space region (the list) is a general **layout
partitioning** idea — the same shape a webpage's fixed header plus
scrollable body uses, a spreadsheet's frozen header row plus scrolling
data grid uses, and a desktop app's toolbar plus main content pane
uses. Also recognized in: CSS Flexbox's `flex: 0 0 auto` header
alongside a `flex: 1` body, and terminal multiplexers reserving a fixed
status-bar row while the rest of the terminal scrolls freely.

### SE Lens

**Why constrain the `RecyclerView`'s height to `0dp` instead of just
giving it a large fixed height, like `600dp`?** A fixed height is
wrong the moment the form's own height changes — add a fourth field
later, and a hardcoded `600dp` list would either overlap the form or
leave an ugly gap, and every device with a different screen height
would show a different, untested amount of wasted or cramped space.
`0dp` plus two vertical constraints computes the list's height fresh,
correctly, on every device and every form size, as a direct consequence
of "whatever space is left over" — a rule stated once, in the layout,
rather than a number someone has to remember to update by hand every
time the form above it changes.

---

## Concept Unit: `android:inputType` Restricts the Keyboard, Not the Value

### The Problem

`quantityInput` above has `android:inputType="number"`. It's tempting
to read that as "Android guarantees this field only ever contains a
valid number" — and that temptation is exactly what this unit exists
to correct, before a single line of code trusts it.

### Mechanical Walkthrough

`android:inputType="number"` changes exactly one thing: which on-screen
keyboard the system shows when this specific field is focused — a
numeric keypad instead of a full alphanumeric keyboard. That's a
*convenience* for the person typing, nothing more. It changes nothing
about what `EditText.getText()` can actually return to your code:

- The field can still be **completely empty** — nothing about
  `inputType` requires the user to type anything at all before tapping
  "Add."
- A **hardware keyboard**, a paste from the clipboard, voice-to-text
  input, or a different keyboard app entirely can still place
  non-numeric characters into a field marked `inputType="number"` —
  Android does not forcibly strip or reject them.
- Even in the ordinary on-screen-numeric-keypad case, the *value*
  Android ultimately hands back to your Java code is a plain `String`,
  the exact same type `nameInput` and `locationInput` return — nothing
  about the return type itself is "safer" for a numeric field.

The keyboard is a hint aimed at the person typing. The validation has
to be aimed at the data, in your own code, regardless of which
keyboard was shown.

### CS Lens

This is a concrete case of **the boundary between presentation and
validation** — a UI hint that shapes how input is *collected* says
nothing about whether that input is *correct*, and conflating the two
is a common, genuine source of real bugs. Also recognized in: an HTML
`<input type="number">` (a nearly identical browser-level hint that a
determined user or a script can still bypass), a phone number field
that accepts letters if pasted, and any command-line flag documented as
expecting an integer that a shell can still hand a string to.

### SE Lens

**If `inputType="number"` can't actually guarantee a valid number, why
set it at all?** Because it's still a genuinely good *default UX*
signal at near-zero cost — most users, most of the time, appreciate not
having to hunt for number keys on a full keyboard, and showing the
numeric keypad reduces how often a typo happens in the first place. The
mistake isn't setting `inputType="number"`; the mistake would be
treating it as a substitute for actually checking the value in Java —
exactly the gap the next Concept Unit closes.

---

## Concept Unit: Defensive Parsing — `Integer.parseInt` and `NumberFormatException`

### The Problem

Whatever the user typed into `quantityInput` arrives in your code as a
`String`. `Item`'s `quantity` field is an `int`. Something has to
convert one into the other, and that conversion can fail in ways
`inputType="number"` does nothing to prevent.

### Introduce the Concept in Isolation

```bash
mkdir -p ~/pkgdemo9 && cd ~/pkgdemo9
```

Create `ParseDemo.java`:

```java
public class ParseDemo {
    public static void main(String[] args) {
        String typed = "240";
        int quantity = Integer.parseInt(typed);
        System.out.println("Parsed quantity: " + quantity);

        String blank = "";
        int brokenQuantity = Integer.parseInt(blank);
        System.out.println("This line never prints: " + brokenQuantity);
    }
}
```

Compile and run:

```
javac ParseDemo.java
java ParseDemo
```

Real output, this session:

```
Parsed quantity: 240
Exception in thread "main" java.lang.NumberFormatException: For input string: ""
	at java.base/java.lang.NumberFormatException.forInputString(NumberFormatException.java:67)
	at java.base/java.lang.Integer.parseInt(Integer.java:672)
	at java.base/java.lang.Integer.parseInt(Integer.java:778)
	at ParseDemo.main(ParseDemo.java:8)
```

`Integer.parseInt("240")` — **first appearance.** A `static` method that
reads a `String` and returns the `int` it represents, *if* the string
is a valid whole number — this is the exact conversion an
`inputType="number"` field's text needs before it can become an
`Item`'s `quantity`. `Integer.parseInt("")` — same method, an input
that isn't a valid number — throws a real, uncaught
`NumberFormatException`, crashing the program immediately, exactly the
way an empty `quantityInput` would crash `AddButton_Click`'s equivalent
here if nothing guarded against it. The crash happens *inside*
`parseInt` itself, on the very first call that receives bad input — not
somewhere later, not silently.

Now the fix. In the same folder, create `ParseDemoSafe.java`:

```java
public class ParseDemoSafe {
    public static void main(String[] args) {
        String[] inputs = {"240", "", "abc", "12"};
        for (String typed : inputs) {
            try {
                int quantity = Integer.parseInt(typed);
                System.out.println("'" + typed + "' -> parsed as " + quantity);
            } catch (NumberFormatException e) {
                System.out.println("'" + typed + "' -> rejected, not a valid number");
            }
        }
    }
}
```

Compile and run:

```
javac ParseDemoSafe.java
java ParseDemoSafe
```

Real output, this session:

```
'240' -> parsed as 240
'' -> rejected, not a valid number
'abc' -> rejected, not a valid number
'12' -> parsed as 12
```

#### Execution Trace

Four inputs, one loop, two genuinely different paths through the same
`try`/`catch` depending on what each one actually is:

```
Iteration 1: typed = "240" → parseInt succeeds, quantity = 240 → prints "'240' -> parsed as 240"
Iteration 2: typed = ""    → parseInt throws NumberFormatException → catch runs → prints "'' -> rejected, not a valid number"
Iteration 3: typed = "abc" → parseInt throws NumberFormatException → catch runs → prints "'abc' -> rejected, not a valid number"
Iteration 4: typed = "12"  → parseInt succeeds, quantity = 12 → prints "'12' -> parsed as 12"
```

The loop itself never stops or skips a step because of the exception —
`try`/`catch` catches the failure *inside* one iteration, lets that
iteration finish (by printing the rejection message), and control
returns to the `for` loop exactly as if nothing unusual happened, for
whichever input is next.

### Discard the Throwaway Example

Delete `ParseDemo.java` and `ParseDemoSafe.java`, and the `pkgdemo9`
folder — the real project applies this exact `try`/`catch` shape to one
value, `quantityInput`'s text, next.

### Mechanical Walkthrough

- `Integer.parseInt(typed)` — reappearing (a `static` method call,
  already-basic), the exact conversion this unit just proved can throw.
- `try { ... } catch (NumberFormatException e) { ... }` — **first
  appearance of `try`/`catch`.** Code inside `try` runs normally unless
  it throws; if it does, control jumps immediately to the matching
  `catch` block instead of crashing the whole program, and execution
  continues normally after the `catch` block finishes.
- `for (String typed : inputs)` — reappearing (`foreach`-style loop,
  already-basic), now iterating over deliberately varied inputs to
  exercise both the success and failure path.

### CS Lens

**This is a hard concept — exception handling as control flow — and it
recurs constantly.** A `try`/`catch` block is a deliberate, structured
escape hatch: instead of letting one bad value crash an entire program,
the failure is contained to exactly the operation that produced it, and
the surrounding code decides what "recovery" means (here: reject this
one input, keep going). Also recognized in: a web server catching a
malformed request body and returning a 400 error instead of crashing
the whole process, a file-reading loop skipping one corrupt record
instead of aborting an entire batch job, and Python's own
`try`/`except` around exactly this same kind of user-input conversion
(`int(user_input)` raising `ValueError` the same way `parseInt` raises
`NumberFormatException` here).

### SE Lens

**Why catch `NumberFormatException` specifically, instead of a broader
catch that handles any possible error the same way?** Catching narrowly
states, explicitly, exactly which failure this code is prepared to
recover from — a malformed number — and lets every other, genuinely
unexpected failure keep propagating and crashing loudly, where it can
actually be noticed and fixed. A broad catch-everything block would
silently swallow real bugs (a `NullPointerException` from a typo
elsewhere, say) alongside the one failure this code actually
anticipated, turning a loud, fixable crash into a quiet, wrong result
with no clue what went wrong or where.

---

## Concept Unit: Wiring the Real Add Form

### The Problem

The form exists on screen, and defensive parsing has been proven in
isolation. Nothing yet connects them to `InventoryAdapter` — tapping
"Add" right now does nothing at all, because `addItemButton` has no
click listener.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryAdapter.java`; `InventoryActivity.java`.
- **Change type:** Add.
- **Location:** A new method on `InventoryAdapter`; a new field lookup
  block and click listener inside `InventoryActivity.onCreate`.
- **Dependencies:** `EditText`, `android:inputType`, and defensive
  parsing, all from earlier in this lesson.

### The New Code — Letting the Adapter Add Its Own Rows

```java
void addItem(Item item) {
    items.add(item);
    notifyItemInserted(items.size() - 1);
}
```

### The Updated Project

```java
public class InventoryAdapter extends RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder> {
    private final List<Item> items;
    private final OnItemClickListener listener;

    interface OnItemClickListener {
        void onItemClick(Item item);
    }

    InventoryAdapter(List<Item> items, OnItemClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    void addItem(Item item) {                                              // ← new
        items.add(item);                                                    // ← new
        notifyItemInserted(items.size() - 1);                                // ← new
    }                                                                        // ← new

    @NonNull
    @Override
    public InventoryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View itemView = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.list_item_inventory, parent, false);
        InventoryViewHolder holder = new InventoryViewHolder(itemView);
        itemView.setOnClickListener(v ->
                listener.onItemClick(items.get(holder.getAdapterPosition())));
        return holder;
    }

    @Override
    public void onBindViewHolder(@NonNull InventoryViewHolder holder, int position) {
        Item item = items.get(position);
        holder.itemNameText.setText(item.getName());
        holder.itemDetailText.setText("Qty: " + item.getQuantity() + " — " + item.getLocation());
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class InventoryViewHolder extends RecyclerView.ViewHolder {
        TextView itemNameText;
        TextView itemDetailText;

        InventoryViewHolder(View itemView) {
            super(itemView);
            itemNameText = itemView.findViewById(R.id.itemNameText);
            itemDetailText = itemView.findViewById(R.id.itemDetailText);
        }
    }
}
```

`InventoryAdapter` now owns one more responsibility than "turn data
into rows": adding a row and announcing that addition are the adapter's
own job, not something the code that happens to call it needs to know
how to do correctly by hand.

### Mechanical Walkthrough

- `void addItem(Item item)` — **first appearance.** A plain method,
  package-private (no modifier), called directly on the adapter
  instance — `InventoryActivity`, next, will hold a reference to this
  exact adapter to call it.
- `items.add(item);` — reappearing (`List.add`, already-basic), the
  same mutation `ArrayList` has supported since it was first used.
- `notifyItemInserted(items.size() - 1);` — **first appearance.** A
  method every `RecyclerView.Adapter` inherits — it tells the
  `RecyclerView` *exactly* which position just gained a new row, so it
  can animate and redraw only that one row rather than redrawing the
  entire list from scratch. `items.size() - 1` is the new item's index,
  since it was just appended to the end — one past the last valid index
  before this call, now the last valid index after it.

### CS Lens

`notifyItemInserted` is a **fine-grained change notification** — it
tells its observer (the `RecyclerView`) precisely *what* changed
(position `items.size() - 1`) and *how* (an insertion), rather than a
blunt "something changed, redraw everything" signal
(`notifyDataSetChanged()`, a real, coarser alternative this project
doesn't use). Also recognized in: a spreadsheet recalculating only the
cells that depend on the one you just edited rather than the whole
sheet, a database's row-level replication log recording exactly which
row changed rather than shipping a full table snapshot, and React's own
key-based reconciliation deciding exactly which list item to
insert/remove rather than re-rendering an entire list on every change.

### SE Lens

**Why does `addItem` live on `InventoryAdapter` instead of having
`InventoryActivity` call `items.add(...)` directly and then figure out
which `notify...` method to call itself?** Because the adapter is the
one object that actually knows the rule "every mutation to `items` must
be paired with the matching `notify...` call, or the `RecyclerView`
silently drifts out of sync with its real data" — putting `addItem`
here means that rule can only be followed correctly, by construction,
by anything holding a reference to the adapter. If `InventoryActivity`
mutated `items` directly instead, every future place that adds an item
would have to remember, independently, to also call the right
`notify...` method — exactly the kind of "correctness depends on every
caller remembering a rule" problem this course has already named and
rejected once, for parallel lists.

### The New Code — the Click Handler

```java
EditText nameInput = findViewById(R.id.nameInput);
EditText quantityInput = findViewById(R.id.quantityInput);
EditText locationInput = findViewById(R.id.locationInput);
Button addItemButton = findViewById(R.id.addItemButton);

addItemButton.setOnClickListener(v -> {
    String name = nameInput.getText().toString().trim();
    String quantityText = quantityInput.getText().toString().trim();
    String location = locationInput.getText().toString().trim();

    if (name.isEmpty() || location.isEmpty()) {
        return;
    }

    int quantity;
    try {
        quantity = Integer.parseInt(quantityText);
    } catch (NumberFormatException e) {
        return;
    }

    adapter.addItem(new Item(name, quantity, location));
    nameInput.setText("");
    quantityInput.setText("");
    locationInput.setText("");
});
```

### The Updated Project

```java
public class InventoryActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inventory);

        List<Item> items = new ArrayList<>();
        items.add(new Item("Hex Bolts, M6", 240, "Bin 4"));
        items.add(new Item("Shop Rags", 12, "Shelf B"));
        items.add(new Item("Cutting Oil", 3, "Shelf B"));
        items.add(new Item("Digital Calipers", 2, "Toolbox 1"));
        items.add(new Item("Safety Glasses", 8, "Shelf A"));

        RecyclerView recyclerView = findViewById(R.id.inventoryRecyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        final InventoryAdapter adapter = new InventoryAdapter(items, item -> {           // ← changed
            Intent intent = new Intent(InventoryActivity.this, ItemDetailActivity.class);
            intent.putExtra("EXTRA_ITEM", item);
            startActivity(intent);
        });
        recyclerView.setAdapter(adapter);                                                // ← changed

        EditText nameInput = findViewById(R.id.nameInput);                               // ← new
        EditText quantityInput = findViewById(R.id.quantityInput);                       // ← new
        EditText locationInput = findViewById(R.id.locationInput);                       // ← new
        Button addItemButton = findViewById(R.id.addItemButton);                         // ← new

        addItemButton.setOnClickListener(v -> {                                          // ← new
            String name = nameInput.getText().toString().trim();                          // ← new
            String quantityText = quantityInput.getText().toString().trim();              // ← new
            String location = locationInput.getText().toString().trim();                  // ← new

            if (name.isEmpty() || location.isEmpty()) {                                   // ← new
                return;                                                                    // ← new
            }                                                                              // ← new

            int quantity;                                                                  // ← new
            try {                                                                          // ← new
                quantity = Integer.parseInt(quantityText);                                 // ← new
            } catch (NumberFormatException e) {                                            // ← new
                return;                                                                     // ← new
            }                                                                              // ← new

            adapter.addItem(new Item(name, quantity, location));                           // ← new
            nameInput.setText("");                                                         // ← new
            quantityInput.setText("");                                                     // ← new
            locationInput.setText("");                                                     // ← new
        });                                                                                 // ← new
    }
}
```

`onCreate` now builds the same five seed items as before, but the
adapter it builds them into is held onto (`final InventoryAdapter
adapter`, not an inline anonymous expression) specifically so the new
click listener below can reach it — and that click listener is the
entire feature this lesson promised: read three fields, reject
obviously-bad input, build a real `Item`, hand it to the adapter, clear
the form.

### Mechanical Walkthrough

- `final InventoryAdapter adapter = new InventoryAdapter(...)` — **first
  appearance of `final` on a local variable, and of effectively final
  lambda capture.** Needed here for a real reason, not just habit:
  `addItemButton`'s lambda, defined later in the same method, reads
  `adapter` — a lambda can only capture a local variable that's `final`
  or **effectively final** (a variable never reassigned after its first
  value — legal to capture even without the `final` keyword written
  explicitly, as long as no code path ever assigns it a second time),
  and without holding a reference at all there'd be no way to call
  `addItem` on this specific adapter later.
- `nameInput.getText().toString().trim()` — **first appearance of
  `EditText.getText()`.** Returns an `Editable`, not a `String` directly
  — a mutable, in-place-editable character sequence Android uses
  internally for text fields, distinct from Java's own immutable
  `String`. `.toString()` converts it to a real, immutable `String` your
  own code can work with normally; `.trim()` (already-basic) removes
  leading/trailing whitespace, so a name typed as `"  Widget  "` doesn't
  get treated as different from `"Widget"`.
- `name.isEmpty() || location.isEmpty()` — **first appearance of
  `String.isEmpty()`** — this project's own version of the "reject a
  blank required field" check, the exact `android:inputType` gap named
  earlier in this lesson, now actually enforced.
- `try { quantity = Integer.parseInt(quantityText); } catch (NumberFormatException e) { return; }`
  — reappearing (this lesson's own lab), applied for real: a
  non-numeric or blank `quantityInput` value is rejected by simply
  returning from the click handler early, doing nothing further — no
  crash, no partial `Item` added.
- `adapter.addItem(new Item(name, quantity, location));` — reappearing
  (`Item`'s constructor, object-initializer-style construction) plus
  this lesson's own `addItem`, now used together for the first time:
  every value reaching this line has already survived both blank-field
  and number-parsing checks above it.
- `nameInput.setText("")` and its two siblings — reappearing
  (`EditText.setText`, symmetrical with `.getText()` above), clearing
  the form so the next item isn't pre-filled with the last one's values.

### Run It

Run the app. Type "Extension Cord" into the name field, "15" into
quantity, "Shelf C" into location, and tap "Add" — the new row appears
at the bottom of the list immediately, and all three fields clear
themselves. Tap "Add" again with the name field left empty — nothing
happens, no crash, no blank row. Type letters into the quantity field
using a physical or Bluetooth keyboard if you have one (or simply clear
it and tap Add with it blank) — again, nothing happens; the app simply
declines to add the item, exactly as this lesson's parsing logic
intends.

### Connect the Pieces

Full trace: the user types into three real `EditText` fields — inputs
`inputType` only ever shaped which keyboard appeared, never what the
text actually contains — and taps "Add." The click handler reads all
three fields back as `String`s, rejects the tap outright if the name or
location is blank, then attempts `Integer.parseInt` on the quantity
text inside a `try`/`catch` proven safe in this lesson's own throwaway
lab, rejecting the tap just as quietly if that fails too. Only once all
three checks pass does a real `Item` get built and handed to
`adapter.addItem(...)`, which appends it to the same `items` list
`onBindViewHolder` has always read from and calls
`notifyItemInserted(...)`, telling the `RecyclerView` exactly which new
row to draw — the list updates without a full rebuild, and the form
clears itself for the next entry.

## What Breaks Without This

Temporarily delete the entire `if (name.isEmpty() || location.isEmpty()) { return; }`
guard, leaving the `try`/`catch` around parsing untouched. Run the app,
leave the name field completely empty, type a valid quantity and
location, and tap "Add." Real, representative result: a genuinely
nameless row is added to the list — its name area simply blank, visibly
broken, sitting in the data right alongside real items with no error
and no crash. Restore the guard afterward. This is the concrete,
hands-on version of this lesson's opening claim: nothing about the
layout or the widgets themselves ever stopped this from happening —
only an explicit check in your own code does.

## Exercises

1. Temporarily remove just the `try`/`catch` around `Integer.parseInt`
   (leave the blank-name/location guard in place), leave the quantity
   field empty, and tap "Add." Read the real crash Android shows and
   connect its message to this lesson's own `ParseDemo` lab output —
   they're the same exception, same cause. Restore the `try`/`catch`
   afterward.
2. Add a maximum-length check: reject the tap if `name.length() > 40`.
   Confirm typing a very long name and tapping "Add" is silently
   declined, the same way a blank name already is.
3. Predict, then verify: what does `Integer.parseInt("12.5")` do — does
   it parse `12`, round to `13`, or throw? Test it in a throwaway
   `main()` method and explain the real result in your own words.

## Definition of Done

- [ ] The Add form (three `EditText` fields and a button) sits above
      the inventory list, and the list fills whatever space remains
      beneath it.
- [ ] Adding an item with valid name, quantity, and location shows it
      in the list immediately, without restarting the app.
- [ ] Tapping "Add" with a blank name or location does nothing,
      silently and safely.
- [ ] Tapping "Add" with non-numeric or blank quantity text does
      nothing, silently and safely — you triggered this on purpose and
      confirmed no crash occurs.
- [ ] You ran the `ParseDemo`/`ParseDemoSafe` labs yourself and can
      explain, in your own words, why `android:inputType="number"`
      doesn't make `Integer.parseInt` unnecessary.
- [ ] Commit: message explaining why (e.g. "Add a real Add Item form
      with EditText fields, since inputType only changes the keyboard
      shown, not what the app can actually trust the input to contain").

Lesson 10 is next: every item this project has added so far has lived
only in memory — close the app entirely and it's gone. `SharedPreferences`
and a real Settings screen, the first taste of storage that survives
the process itself, not just a screen rotation.

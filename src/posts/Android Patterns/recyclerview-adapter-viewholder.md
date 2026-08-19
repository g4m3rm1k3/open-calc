# View Recycling: RecyclerView.Adapter and ViewHolder

**What problem this solves.** A scrolling list can hold thousands of
rows of data, but a phone screen only ever shows a dozen or so at once.
If every row got its own freshly-built on-screen view — inflating a
layout, allocating widgets — a long list would allocate thousands of
views to show a dozen at a time, most of them off-screen and wasted.
The fix in the abstract: build only as many on-screen views as can
physically fit, and when one scrolls out of sight, don't destroy it —
strip its old data out, hand it new data, and put it back on screen
somewhere else. The view object is reused; only the data behind it
changes.

**Classic pattern family.** This is Android's shaped combination of two
classic ideas. First, an **Adapter**: an object that sits between a
data source (a plain `List<String>`, here) and a consumer that expects
a specific interface (the scrolling list's own internal machinery) —
translating between the two without either side needing to know the
other's real shape. Second, an **object pool**: a fixed, reused set of
expensive-to-create objects handed out and returned rather than
constantly built and thrown away, the same idea behind a database
connection pool or a thread pool, applied here to on-screen views.

**Where you'll meet it in Android.** `androidx.recyclerview.widget.RecyclerView.Adapter<VH>`
and `androidx.recyclerview.widget.RecyclerView.ViewHolder`, the pair
every scrolling list in modern Android (`RecyclerView`) is built from.

**Terms used in this pattern.**

- **Generic type parameter, bounded** — a placeholder type
  (`<VH extends RecyclerView.ViewHolder>` on `Adapter`) filled in by
  whoever subclasses it, restricted to only accept types that are
  themselves a `ViewHolder` or a subclass of one. It exists so
  `Adapter`'s own methods can return and accept your specific
  `ViewHolder` subclass by its real type, instead of the generic base
  type — without it, every caller would have to downcast.
- **Abstract class, abstract method** — a class (`Adapter`, `ViewHolder`)
  that cannot be instantiated directly, and a method it declares with no
  body, forcing any real subclass to supply one. It exists so the
  framework can write code that calls `onCreateViewHolder` and
  `onBindViewHolder` without knowing what a specific app's rows look
  like — it only needs the guarantee that *some* implementation exists.
- **`@NonNull`** — an annotation on a parameter or return type stating
  it will never be `null`. It exists so tools (the compiler's linter,
  the IDE) can flag a caller passing `null` or an override returning
  `null` as a mistake before the app ever runs, instead of the mistake
  surfacing later as a crash.
- **`@Override`** — an annotation stating this method is intentionally
  replacing a method declared in the class being extended. It exists so
  a typo in the method's name or parameter list becomes a compile error
  (the compiler can't find a matching parent method to override)
  instead of silently creating an unrelated new method that the
  framework never calls.

**Objects and methods used.**

- **`RecyclerView.Adapter<VH extends RecyclerView.ViewHolder>`**
  *What it is:* an abstract class you subclass once per kind of list you
  display.
  *Implementation:* declares three abstract methods a subclass must
  supply — `onCreateViewHolder`, `onBindViewHolder`, `getItemCount` —
  plus a generic parameter `VH` fixing which `ViewHolder` subclass this
  adapter produces.
  *Its use:* this is the translator between the plain data (`List<String>`
  of names, here) and the scrolling list's internal recycling machinery;
  it is the only object that knows both what the data looks like and
  how to turn one item of it into an on-screen row.
- **`onCreateViewHolder(@NonNull ViewGroup parent, int viewType)`**
  *What it is:* an abstract method on `Adapter`, returning `VH`.
  *Implementation:* `public abstract VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType);`
  *Its use:* the one place a brand-new row view actually gets built —
  called only when the recycling pool has nothing reusable on hand.
- **`onBindViewHolder(@NonNull VH holder, int position)`**
  *What it is:* an abstract method on `Adapter`, returning `void`.
  *Implementation:* `public abstract void onBindViewHolder(@NonNull VH holder, int position);`
  *Its use:* the one place real data gets written into an already-built
  row — called every time any row, new or reused, is about to appear.
- **`getItemCount()`**
  *What it is:* an abstract method on `Adapter`, returning `int`.
  *Implementation:* `public abstract int getItemCount();`
  *Its use:* tells the scrolling list how many total positions exist, so
  it knows when scrolling has reached the end of the data.
- **`RecyclerView.ViewHolder`**
  *What it is:* an abstract class you subclass once per row layout.
  *Implementation:* declares `public final View itemView` and a
  constructor `public ViewHolder(@NonNull View itemView)` that stores it.
  *Its use:* wraps one inflated row layout together with handles to its
  child widgets, so `onBindViewHolder` never has to re-find those
  widgets on every reuse — only re-find them once, at construction.
- **`LayoutInflater.from(Context)` and `.inflate(int resId, ViewGroup root, boolean attachToRoot)`**
  *What it is:* a static factory method returning a `LayoutInflater`,
  and an instance method on it turning an XML layout resource into a
  real `View` tree.
  *Implementation:* `public static LayoutInflater from(Context context)`;
  `public View inflate(int resource, ViewGroup root, boolean attachToRoot)`.
  *Its use:* the only way an XML row layout becomes an actual `View`
  object in memory — this is what `onCreateViewHolder` calls to build a
  brand-new row; `attachToRoot = false` because `RecyclerView` itself
  will attach the view when it's actually placed on screen, not now.
- **`View.findViewById(int id)`**
  *What it is:* an instance method on `View`, returning `View` (called
  here as if it returns the specific widget subtype via generic
  inference).
  *Implementation:* `public final <T extends View> T findViewById(int id)`.
  *Its use:* looks up one specific child widget inside the inflated row
  by its layout ID — done once per `ViewHolder`, in its constructor, not
  once per bind, which is the whole reason holding onto the result in a
  field is worth doing.
- **`TextView.setText(CharSequence text)`**
  *What it is:* an instance method on `TextView`.
  *Implementation:* `public final void setText(CharSequence text)`.
  *Its use:* the actual write of real data onto the on-screen row,
  called fresh every time `onBindViewHolder` runs, even on a reused
  view.

---

## The Shape

Three participants make this system work:

- **The data** — a plain `List<String>` here, held by the adapter. It
  has no idea a `RecyclerView` exists.
- **`ContactAdapter extends RecyclerView.Adapter<ContactViewHolder>`** —
  holds the data, and knows how to turn one item of it into a row. It
  never touches the screen directly.
- **`ContactViewHolder extends RecyclerView.ViewHolder`** — wraps one
  real, on-screen row `View` together with handles to that row's
  widgets. It has no idea what data it currently holds; it only knows
  how to display whatever it's told.
- **`RecyclerView` itself and its internal recycler/pool** — not
  subclassed or touched by this code at all, but the actual conductor:
  it decides which positions are visible, asks the adapter to either
  build a new `ViewHolder` or reuse a pooled one, and physically places
  the result on screen.

The relationship: `RecyclerView` never touches the data, and the
`Adapter` never touches the screen — `RecyclerView` only ever talks to
the `Adapter` through the three abstract methods above, and the
`Adapter` only ever talks back through the `ViewHolder` objects it
hands over. A `ViewHolder` is deliberately dumb: it is a set of widget
handles with no knowledge of the data currently sitting in them, which
is exactly what makes it safe to strip out old data and refill it with
new data without rebuilding it. The recycling pool sits inside
`RecyclerView`, invisible to the adapter's code entirely — the adapter
never asks "is there one I can reuse?"; it only ever gets told, via
which method the framework calls, whether one already exists.

```
   data (List<String>)
        |
        v
 ContactAdapter -- onCreateViewHolder --> new ContactViewHolder
        |                                        ^
        |-- onBindViewHolder(holder, position) ---|  (writes data into
        |                                             an existing one)
        v
   RecyclerView  <-- owns the recycling pool, decides which
                     positions are on screen right now
```

---

## Mechanical Walkthrough

```java
public class ContactViewHolder extends RecyclerView.ViewHolder {
    TextView nameLabel;

    public ContactViewHolder(@NonNull View itemView) {
        super(itemView);
        nameLabel = itemView.findViewById(R.id.name_label);
    }
}

public class ContactAdapter extends RecyclerView.Adapter<ContactViewHolder> {
    private final List<String> names;

    public ContactAdapter(List<String> names) {
        this.names = names;
    }

    @NonNull
    @Override
    public ContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View row = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.row_contact, parent, false);
        return new ContactViewHolder(row);
    }

    @Override
    public void onBindViewHolder(@NonNull ContactViewHolder holder, int position) {
        holder.nameLabel.setText(names.get(position));
    }

    @Override
    public int getItemCount() {
        return names.size();
    }
}
```

- **`class ContactViewHolder extends RecyclerView.ViewHolder`** — this
  is the pattern's `ViewHolder` participant made concrete. Extending
  `ViewHolder` rather than composing it is required, not stylistic:
  `RecyclerView`'s internal pool tracks items *as* `ViewHolder`
  instances, so anything it manages has to actually be one.
- **`TextView nameLabel;`** — a plain field, not a local variable,
  because it has to survive between the constructor (where it's found)
  and every later call to `onBindViewHolder` (where it's written to).
  Making it a field is what turns "found once" into "reused every
  time" — a local variable would be gone the moment the constructor
  returned.
- **`public ContactViewHolder(@NonNull View itemView)`** — the
  constructor a subclass of `ViewHolder` must provide, taking the
  already-inflated row `View`. `@NonNull` here documents (and lets
  tooling enforce) that this is never called with a not-yet-inflated or
  missing view — there is no valid `ViewHolder` with no underlying view.
- **`super(itemView)`** — calls `ViewHolder`'s own constructor, which
  stores the passed view into the inherited `public final View
  itemView` field. This is what makes `itemView` available at all;
  skipping it would leave the parent class's own bookkeeping
  uninitialized, which is why Java requires a `super(...)` call as the
  constructor's first statement whenever the parent has no no-argument
  constructor of its own.
- **`nameLabel = itemView.findViewById(R.id.name_label)`** — looks up
  the one child widget this row cares about, by the ID given to it in
  the row's XML layout, and stores the result. Doing this here, in the
  constructor, rather than inside `onBindViewHolder`, is the entire
  performance reason a `ViewHolder` class exists instead of just
  calling `findViewById` fresh every time a row is bound — that lookup
  walks the view tree, and doing it once per physical row instead of
  once per bind (which can be dozens of times per row, across a long
  scroll session) is the saving.
- **`class ContactAdapter extends RecyclerView.Adapter<ContactViewHolder>`**
  — fixes the generic parameter `VH` to this specific `ViewHolder`
  subclass, which is what lets every method below return and accept
  `ContactViewHolder` directly instead of the generic base type.
- **`private final List<String> names;`** — the adapter's only
  connection to real data; `final` because this adapter is built once
  per list instance and never reassigned to point at a different list
  object (updating the *contents* of the list and telling the adapter
  to refresh is a separate, later concern this pattern doesn't cover).
- **`public ContactAdapter(List<String> names)`** — an ordinary
  constructor, not part of the `Adapter` contract itself; the pattern
  doesn't dictate how data gets in, only what happens once it's there.
- **`@NonNull @Override public ContactViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType)`**
  — fulfills the first abstract method. `parent` is the `RecyclerView`
  itself, passed so the new row can be inflated correctly sized for it;
  `viewType` distinguishes between different kinds of rows in lists
  that mix more than one layout, unused here because every row in this
  list looks the same.
- **`LayoutInflater.from(parent.getContext())`** — obtains the system
  service responsible for turning XML into real view objects, tied to
  the same context (theme, resources) the parent `RecyclerView` itself
  is running in — using a mismatched context here is a real, separate
  source of bugs (wrong theme applied to the row) this line avoids by
  construction.
- **`.inflate(R.layout.row_contact, parent, false)`** — builds the row's
  `View` tree from the `row_contact.xml` layout resource. The `false`
  argument matters specifically: it tells the inflater *not* to attach
  the new view to `parent` immediately, because `RecyclerView` itself
  will do that attachment later, when the row actually needs to appear
  on screen — passing `true` here would attach it twice and crash.
- **`return new ContactViewHolder(row)`** — wraps the freshly inflated
  view in a new holder. This is the only line in the whole class that
  ever constructs a `ContactViewHolder` with `new` — everywhere else,
  an existing one is reused.
- **`@Override public void onBindViewHolder(@NonNull ContactViewHolder holder, int position)`**
  — fulfills the second abstract method. `holder` may be one built
  moments ago by `onCreateViewHolder`, or one built long ago and now
  being reused with entirely different data than it held before — this
  method has no way to tell which, and doesn't need to.
- **`holder.nameLabel.setText(names.get(position))`** — reads the one
  string this specific position holds and writes it into the row's
  label. `names.get(position)` is a plain `List` read, unrelated to any
  Android API; `setText` is what actually overwrites whatever text was
  left over from this holder's previous use, which is the step that
  makes reuse safe — without it, a reused row would briefly show its
  old data until this call happened to run.
- **`@Override public int getItemCount()`** — fulfills the third
  abstract method by returning the plain list's own size, giving
  `RecyclerView` the total count it needs to know where scrolling ends.

---

## Collaboration — how it actually runs

1. `RecyclerView` decides, based on the current scroll position and the
   screen's size, which item positions need an on-screen row right now.
2. For each such position, `RecyclerView`'s internal pool is checked
   first for an already-built `ViewHolder` of the right kind that's
   currently off-screen and free to reuse.
3. If the pool has nothing usable, `onCreateViewHolder` is called —
   this is the only path that ever runs, and it runs only enough times
   to cover what can be on screen at once plus a small cushion, never
   once per data item. A list of ten thousand names still only calls
   this a handful of times.
4. Whether the `ViewHolder` came from step 2 (reused) or step 3
   (freshly built), `onBindViewHolder` is called next with it — this is
   the step that runs once per row *appearance*, which, across a long
   scroll session, is far more often than `onCreateViewHolder` ever
   runs.
5. As the user keeps scrolling, a row that leaves the screen is not
   destroyed — it's scrapped back into the pool from step 2, so the
   next position that needs the same kind of row can be handed this
   same object again, sending execution back to step 2 instead of
   step 3.

The order between steps 3/4 and step 5 is the entire point: step 3 is
rare and expensive (inflating XML, allocating a view tree); step 4 is
frequent and cheap (writing a string into an already-built label). The
pattern exists specifically to push as much work as possible into step
4 and as little as possible into step 3.

---

## Why It's Shaped This Way

The design principle is **separation of concerns across three narrow
roles** instead of one object that both owns the data and manages the
screen: the plain list only holds data, `ContactAdapter` only knows how
to turn one item into a row, and `ContactViewHolder` only knows how to
hold widget references, with `RecyclerView` itself owning the actually
hard part — deciding what's visible and managing the reuse pool — so no
app code has to.

The alternative not chosen: build and destroy a real view for every row
every time it scrolls into view, with no reuse at all — simpler to
write, since there's no holder class and no distinction between
"create" and "bind." The real cost is `findViewById` and layout
inflation running on every single scroll frame instead of only when a
genuinely new row is needed, which is the difference between a smooth
scroll and a visibly stuttering one on a long list.

The cost this pattern itself carries: two methods to implement instead
of one, and a `ViewHolder` subclass to design even for a trivial single-
`TextView` row — overhead that only pays for itself once a list is long
enough, or scrolls often enough, for reuse to matter. A five-item list
would work fine either way.

---

## Recognizing It Elsewhere

Also recognized in: a database connection pool (borrow a connection,
use it, return it to the pool instead of closing and reopening);
a thread pool (`ExecutorService` reusing worker threads instead of
spawning one per task); a video game's object pool for bullets or
particles (reuse a dead bullet's object for the next shot instead of
allocating a new one); a car rental counter (the same physical car gets
reassigned to a new renter instead of being scrapped after each trip).

---

## Where This Actually Breaks

The most common real mistake: writing code in `onBindViewHolder` that
only sets a value under some condition — for example, only calling
`setText` or changing a background color when a certain flag is true,
with no corresponding `else` branch to reset it when the flag is false.
Because the same `ViewHolder` object gets reused across many different
positions, a property left unset on one bind silently keeps whatever
value the *previous* item happened to leave there. The visible symptom
is data that appears to randomly "leak" between rows while scrolling —
a checkbox that looks checked on an item that was never checked, or a
color that only shows up on the wrong row — and it's intermittent,
because it only shows up on positions unlucky enough to reuse a holder
that last held a row where the condition was true.

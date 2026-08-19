# Walking Results Without Knowing Their Storage: Cursor

**What problem this solves.** Code that needs to process a collection
of results one at a time — stepping through them, reading each one's
fields — shouldn't need to know how that collection is actually stored
underneath: a database's row-and-column format, a set of rows
synthesized on the fly, or something else entirely. If every different
kind of result set exposed a completely different way to step through
its own contents, code that just wants to "go through the results"
would need a separate, bespoke implementation for every data source it
might ever encounter. The abstract fix: give every such result set a
single, shared way to move through its contents one at a time — a
step-forward operation plus a way to read the current position's data —
so the exact same walking code works regardless of what's actually
being walked.

**Classic pattern family.** This is the Gang-of-Four **Iterator**
pattern: providing a way to access the elements of a collection
sequentially, without exposing its underlying representation.

**Where you'll meet it in Android.** `android.database.Cursor`,
returned by `ContentResolver.query(...)` (among other query methods),
exposing `moveToNext()`, `getColumnIndex(String)`, `getString(int)`,
and `close()`.

**Terms used in this pattern.**

- **`while` loop** — a control-flow statement repeating its body for as
  long as its condition remains true. It's used here specifically
  because the number of rows isn't known ahead of time — the loop keeps
  advancing until the step-forward operation itself reports there's
  nothing left.
- **Null check on a returned reference** — testing whether a method's
  result is `null` before using it. It matters here for a specific
  reason: `query(...)` can itself return `null` (a provider crash, an
  unsupported `Uri`), so the returned `Cursor` has to be checked before
  any attempt to iterate it.

**Objects and methods used.**

- **`Cursor`**
  *What it is:* an interface representing a movable pointer over a set
  of rows returned by a query.
  *Implementation:* `android.database.Cursor`, declaring `moveToNext()`,
  `getColumnIndex(String)`, `getString(int)`, `close()`, among others.
  *Its use:* the actual iterator — the single shared way to step
  through query results without exposing how those results are really
  stored.
- **`Cursor.moveToNext()`**
  *What it is:* an instance method on `Cursor`, returning `boolean`.
  *Implementation:* `public abstract boolean moveToNext()`.
  *Its use:* the step-forward operation — advances the cursor's
  internal position by one row and reports whether a row now actually
  exists there, which is what makes it usable directly as a `while`
  loop's own condition.
- **`Cursor.getColumnIndex(String columnName)`**
  *What it is:* an instance method on `Cursor`, returning `int`.
  *Implementation:* `public abstract int getColumnIndex(String
  columnName)`.
  *Its use:* translates a column's name into the numeric index actually
  used to read it — looked up once, outside the loop, since the column
  layout itself never changes row to row.
- **`Cursor.getString(int columnIndex)`**
  *What it is:* an instance method on `Cursor`, returning `String`.
  *Implementation:* `public abstract String getString(int
  columnIndex)`.
  *Its use:* reads the current row's value at the given column index —
  always relative to wherever `moveToNext()` most recently positioned
  the cursor, never to a row named directly.
- **`Cursor.close()`**
  *What it is:* an instance method on `Cursor`, returning `void`.
  *Implementation:* `public abstract void close()`.
  *Its use:* releases the real, underlying resources — a database
  cursor, an open connection — the `Cursor` was holding onto; required
  explicitly, since nothing about a loop finishing on its own releases
  anything.

---

## The Shape

Three participants:

- **The real, underlying result set** — rows sitting in a database, or
  assembled some other way entirely; the caller never finds out which.
- **`Cursor`** — the iterator object itself, standing between the
  caller and that real result set, exposing one small, uniform set of
  operations regardless of what's really behind it.
- **The caller's loop** — written once, against `Cursor`'s own
  contract, with no branch anywhere asking what kind of data source
  actually produced these results.

The relationship: `Cursor` holds an internal position — initially
before the first row — that only `moveToNext()` ever advances; the
caller never manipulates that position directly, only asks to move
forward one step and checks whether that step succeeded. Every read
always refers to whatever row the cursor is currently positioned at,
never to a row named or indexed directly by the caller — this is what
makes `Cursor` a true iterator rather than a random-access collection.

```
   caller's while loop
        |
        |  cursor.moveToNext()  -- step forward one row, report success
        v
      Cursor   (the iterator, standing in front of...)
        |
        |  getString(columnIndex)  -- read the CURRENT row only
        v
   real underlying result set (rows the caller never sees directly,
   however they're actually stored)
```

---

## Mechanical Walkthrough

```java
Cursor cursor = getContentResolver().query(contactsUri, null, null, null, null);

if (cursor != null) {
    int nameColumnIndex = cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME);

    while (cursor.moveToNext()) {
        String name = cursor.getString(nameColumnIndex);
        names.add(name);
    }

    cursor.close();
}
```

- **`Cursor cursor = getContentResolver().query(...)`** — obtains the
  iterator itself; this call may return `null` rather than an empty
  `Cursor`, which is why the very next line checks for it explicitly.
- **`if (cursor != null)`** — guards every remaining line against a
  failed query, since none of `Cursor`'s own methods can safely be
  called on a `null` reference.
- **`int nameColumnIndex = cursor.getColumnIndex(ContactsContract.Contacts.DISPLAY_NAME);`**
  — resolved once, before the loop, because the column layout is fixed
  for the whole result set — looking this up fresh inside the loop on
  every row would be redundant work repeated for no benefit.
- **`while (cursor.moveToNext())`** — both the step-forward operation
  and the loop's own continuation condition, in one call: each
  evaluation moves to the next row and, in the same call, reports
  whether that row exists.
- **`String name = cursor.getString(nameColumnIndex);`** — reads from
  whatever row `moveToNext()` just moved to; there is no way to read a
  row by number directly through this interface.
- **`names.add(name);`** — ordinary use of the value just read; not
  itself part of the Iterator pattern's own shape.
- **`cursor.close();`** — runs once, after the loop, regardless of how
  many rows there actually were.

---

## Collaboration — how it actually runs

1. `query(...)` returns a `Cursor` already positioned "before the first
   row" — not yet pointing at any real row at all.
2. `getColumnIndex(...)` runs once, before the loop starts, translating
   a column name into a fixed numeric index used for every row that
   follows.
3. `moveToNext()` runs as the loop's own condition — the first call
   moves the cursor to row zero and returns `true` if that row exists.
4. Inside the loop body, `getString(nameColumnIndex)` reads from
   whatever row `moveToNext()` just moved to.
5. Steps 3 and 4 repeat together, each iteration moving one row
   further, until `moveToNext()` eventually returns `false` — meaning
   there was no next row — at which point the loop's own condition ends
   it, with no separate "are we at the end" check written anywhere.
6. `close()` runs once, after the loop, releasing the real resources
   the `Cursor` was holding onto the whole time.

---

## Why It's Shaped This Way

The design principle is letting code that processes a sequence of
results be **written once, against one small shared contract**,
regardless of what's really producing that sequence underneath.

The alternative not chosen: exposing the real result set directly —
handing the caller, say, a raw array of rows, or direct access to
whatever the real underlying storage format happens to be. The real
cost avoided: different data sources genuinely store and represent rows
completely differently underneath — forcing every caller to understand
and branch on which one it's actually dealing with would defeat the
entire purpose of having one shared query interface in the first place.

The cost this pattern itself carries: a `Cursor` holds real, live
resources — open database connections, memory — for as long as it
exists, unlike a plain in-memory collection. Forgetting to call
`close()` leaks those resources for real, in a way a simple array or
`List` never would, specifically because an iterator standing in front
of a live resource isn't the same as one standing in front of data
already fully loaded into memory.

---

## Recognizing It Elsewhere

Also recognized in: a file's own read pointer, advanced by each read
call rather than the caller specifying a byte offset every time; a
network response consumed as a stream, one chunk at a time, without the
whole response ever needing to sit fully in memory at once; Java's own
`java.util.Iterator` interface (`hasNext()`/`next()`), the same idea in
the standard library, one further layer of abstraction beyond
`Cursor`'s own Android-specific, database-flavored version; a linked
list traversal, where each node only knows how to hand back the next
one, never the whole list at once.

---

## Where This Actually Breaks

The most common real mistake: forgetting to call `cursor.close()`,
especially on a code path where an early return or an exception skips
past it — a `Cursor` obtained inside a method that returns early on
some condition before ever reaching its own `close()` call at the
bottom. Because `Cursor` holds real, live resources open, this is a
genuine resource leak, not merely a wasted object. Over time, in an app
that runs many queries without properly closing every `Cursor`, this
can exhaust the limited number of concurrently open cursors an app is
allowed and cause completely unrelated-looking failures on later,
otherwise correct queries.

# Lesson 29: Letting Other Apps See Your Data — ContentProvider

**What you will build:** A real, working `InventoryContentProvider`
exposing a read-only view of Pocket Inventory's items to any other app
(or the command line) that asks correctly — kept in the project as a
genuine, permanently-available alternative access path, the same
"build it for real, even though the app's own UI never uses it" spirit
as Lesson 26's `Service`. The transferable problem: `FileProvider`
(Lesson 25) was one narrow, pre-built instance of this exact mechanism.
This lesson builds the general case from scratch — completing the four-
component picture Lesson 2 first named (Activity, Service,
BroadcastReceiver, and now ContentProvider) and answering a question
this project has never had to face: what if a *different* app,
compiled entirely separately, wants to read your data?

**What you need to know first:** Lesson 25 (`FileProvider`, a specific
`ContentProvider` subclass already configured once), Lesson 12
(`Cursor`, raw SQLite row access — this lesson's `query` method returns
one directly), Lesson 13 (`ItemDao`, `AppDatabase`).

---

## Concept Unit: Why Room's `ItemDao` Isn't Enough for This

### The Problem

`ItemDao` (Lesson 13) is a perfectly good way for *this app's own
code* to read `Item`s. A separate, independently-compiled app has no
way to call a Java method on a class it was never compiled against —
the exact same problem Lesson 4 established for two Activities within
one app, one level higher: two entirely separate *processes* can't
call each other's methods directly at all. Something has to broker
access across that boundary, the same OS-mediated role `Intent`
(Lesson 4) plays for navigation and `BroadcastReceiver` (Lesson 27)
plays for events — `ContentProvider` plays it for structured, queryable
data.

### CS Lens

A `ContentProvider` addressed by a `content://` URI is a small, local
instance of the same idea a REST API serves at a larger scale: a
stable, well-defined interface (here, a URI scheme and a `Cursor`-
shaped response contract) sitting in front of whatever storage
mechanism actually backs it — the caller never needs to know or care
that Room and SQLite are underneath, exactly as a web API's consumer
never needs to know whether the server behind it uses Postgres or
MySQL.

---

## Concept Unit: `UriMatcher` — Routing Requests by URI Shape

### The Problem

A `ContentProvider` can be asked for "every item" or "one specific
item by id" — two different requests, both addressed as URIs, that
need to be told apart before deciding how to answer.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `InventoryContentProvider.java`.
- **Change type:** Create.

### The New Code

```java
private static final String AUTHORITY = "com.yourname.pocketinventory.provider";
private static final int ITEMS = 1;
private static final int ITEM_ID = 2;

private static final UriMatcher uriMatcher = new UriMatcher(UriMatcher.NO_MATCH);
static {
    uriMatcher.addURI(AUTHORITY, "items", ITEMS);
    uriMatcher.addURI(AUTHORITY, "items/#", ITEM_ID);
}
```

### The Updated Project

This is the beginning of a new file, `InventoryContentProvider.java` —
fields and a static initializer block sitting above the class body
built in the next unit.

### Mechanical Walkthrough
- `private static final String AUTHORITY = "..."` — reappearing
  (Lesson 25's `FileProvider` authority string, same reversed-domain
  convention).
- `UriMatcher(UriMatcher.NO_MATCH)` — **first appearance.** A
  framework helper purpose-built for exactly this dispatch problem;
  `NO_MATCH` is the constant returned for any URI that matches nothing
  registered below.
- `static { ... }` — **first appearance of a static initializer
  block.** Code that runs exactly once, when the class is first loaded
  — not per-instance (contrast every constructor seen since Lesson 6) —
  appropriate here because `uriMatcher`'s routing rules are the same
  for every instance of this provider that will ever exist.
- `uriMatcher.addURI(AUTHORITY, "items", ITEMS)` — **first appearance.**
  Registers "requests for `content://AUTHORITY/items`" against the code
  `ITEMS`.
- `uriMatcher.addURI(AUTHORITY, "items/#", ITEM_ID)` — **first
- appearance.** The `#` wildcard matches any numeric segment — so
  `content://AUTHORITY/items/3` matches this pattern, registered
  against `ITEM_ID`.

### CS Lens

`UriMatcher`'s pattern-to-integer-code mapping is another concrete
**dispatch table**, the same recurring shape as Lesson 4's
`RequestDemo`, Lesson 21's menu-item dispatch, and Lesson 27's
`intent.getAction()` checks — a small, closed set of recognized
requests, matched and routed before any real work happens.

---

## Concept Unit: `query()` — Answering With a `Cursor`, Not an `Item`

### The Problem

The `ContentProvider` contract predates Room by years, and its `query`
method must return a `Cursor` (Lesson 12's raw row-cursor type) — not
a `List<Item>`. Room's typed objects have to be converted back down to
the older, lower-level shape the contract requires.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `InventoryContentProvider.java`.
- **Change type:** Add — the class body and its required overrides.

### The New Code

```java
public class InventoryContentProvider extends ContentProvider {
    @Override
    public boolean onCreate() {
        return true;
    }

    @Nullable
    @Override
    public Cursor query(@NonNull Uri uri, @Nullable String[] projection, @Nullable String selection,
                         @Nullable String[] selectionArgs, @Nullable String sortOrder) {
        ItemDao itemDao = AppDatabase.getInstance(getContext()).itemDao();
        List<Item> items;
        int match = uriMatcher.match(uri);
        if (match == ITEM_ID) {
            long id = ContentUris.parseId(uri);
            items = new ArrayList<>();
            for (Item item : itemDao.getAll()) {
                if (item.getId() == id) {
                    items.add(item);
                }
            }
        } else if (match == ITEMS) {
            items = itemDao.getAll();
        } else {
            throw new IllegalArgumentException("Unknown URI: " + uri);
        }

        MatrixCursor cursor = new MatrixCursor(new String[]{"id", "name", "quantity", "location"});
        for (Item item : items) {
            cursor.addRow(new Object[]{item.getId(), item.getName(), item.getQuantity(), item.getLocation()});
        }
        return cursor;
    }

    @Nullable
    @Override
    public String getType(@NonNull Uri uri) {
        int match = uriMatcher.match(uri);
        if (match == ITEMS) return "vnd.android.cursor.dir/vnd.pocketinventory.item";
        if (match == ITEM_ID) return "vnd.android.cursor.item/vnd.pocketinventory.item";
        return null;
    }

    @Nullable
    @Override
    public Uri insert(@NonNull Uri uri, @Nullable ContentValues values) {
        throw new UnsupportedOperationException("This provider is read-only");
    }

    @Override
    public int update(@NonNull Uri uri, @Nullable ContentValues values,
                       @Nullable String selection, @Nullable String[] selectionArgs) {
        throw new UnsupportedOperationException("This provider is read-only");
    }

    @Override
    public int delete(@NonNull Uri uri, @Nullable String selection, @Nullable String[] selectionArgs) {
        throw new UnsupportedOperationException("This provider is read-only");
    }
}
```

### The Updated Project

This completes `InventoryContentProvider.java` — six required overrides
(`onCreate`, `query`, `getType`, `insert`, `update`, `delete`), three of
which (`insert`/`update`/`delete`) deliberately refuse to do anything,
a legitimate, honest design choice explained fully in this unit's SE
Lens rather than left unexplained.

### Mechanical Walkthrough
- `extends ContentProvider` — **first appearance.** The fourth and
  final major component base class this curriculum set out to cover,
  first named back in Lesson 2's SE Lens.
- `onCreate()` returning `true` — **first appearance of this specific
  override**, distinct from every other `onCreate` in this project
- (Activity, Lesson 2; the throwaway `SQLiteOpenHelper`, Lesson 12) —
  called once, when the provider is first needed, `true` signaling
  successful initialization.
- `query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder)`
- — **first appearance.** The one method every `ContentProvider` must answer reads: `projection` (which columns are wanted — ignored here

  for simplicity, always returning all four), `selection`/`selectionArgs`
- (a filter, SQL-`WHERE`-shaped — also unused here), `sortOrder`
  (unused) — a real provider would honor all of these; this one
  deliberately keeps scope narrow, always returning every column,
  unfiltered.
- `uriMatcher.match(uri)` — reappearing (the previous unit's object,
  first real use).
- `ContentUris.parseId(uri)` — **first appearance.** Extracts the
- trailing numeric segment from a URI like `.../items/3` as a `long` —
  the counterpart read to `UriMatcher`'s `"items/#"` pattern.
- `AppDatabase.getInstance(getContext())` — reappearing (Lesson 13),
- `getContext()` — **first appearance on a `ContentProvider`** — a
  method every provider inherits, returning the app's `Context`,
  needed here the same way every other component has needed one.
- `MatrixCursor(new String[]{"id", "name", "quantity", "location"})` —
  **first appearance.** A real, in-memory, writable implementation of
  `Cursor` (Lesson 12's type, previously only *read* from, in that
  lesson's raw SQLite unit) — built here by hand, column names declared
  explicitly, rows added one at a time.
- `cursor.addRow(new Object[]{...})` — **first appearance.** Appends
  one row, values in the same order as the declared column names —
  the manual bridge converting typed `Item` fields (Lesson 7) back into
  the older, untyped `Cursor` row shape the `ContentProvider` contract
  requires.
- `getType(Uri uri)` — **first appearance.** Returns a MIME-type-
- style string describing what a given URI represents — `vnd.android.cursor.dir/...` for a collection, `vnd.android.cursor.item/...` for a single row — a

  contract requirement, used by callers wanting to know a URI's shape
  without querying it first.
- `throw new UnsupportedOperationException("This provider is read-only")`
- — **first appearance of `UnsupportedOperationException`** — a
  standard-library unchecked exception (a category briefly touched on
  in Lesson 14's `throws InterruptedException` contrast) specifically
  meaning "this operation is a legitimate part of the interface, but
  this particular implementation intentionally does not support it" —
  distinct from `NumberFormatException` (Lesson 9), which signals bad
  *input*, not a deliberately unsupported *capability*.

### CS Lens

Implementing three of the six required methods purely to throw is a
concrete instance of the **Interface Segregation tension**: the
`ContentProvider` base contract assumes full read/write capability, but
this specific implementation only legitimately supports one direction —
rather than silently doing nothing (a much worse failure, hiding a real
mistake as if it succeeded), throwing loudly and immediately makes an
unsupported call fail in an unmistakable, debuggable way the moment
it's attempted.

### SE Lens

**Why build a read-only provider at all, when it can't be used to add
or edit items from outside the app?** Exposing *write* access to
another, arbitrary app is a genuinely different, much higher-risk
decision than exposing read access — a malicious or buggy caller could
corrupt this app's own data through a writable provider in ways read-
only access structurally cannot permit. Building the read path
completely, and the write paths as loud, deliberate refusals rather
than silently unimplemented gaps, demonstrates the full required shape
of the contract while making an honest, defensible security decision
about what this specific app should actually allow.

---

## Concept Unit: Declaring and Testing the Provider

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `AndroidManifest.xml`.
- **Change type:** Add.

### The New Code

```xml
<provider
    android:name=".InventoryContentProvider"
    android:authorities="com.yourname.pocketinventory.provider"
    android:exported="true"
    android:readPermission="com.yourname.pocketinventory.READ_INVENTORY" />
```

```xml
<permission
    android:name="com.yourname.pocketinventory.READ_INVENTORY"
    android:protectionLevel="normal" />
```

### The Updated Project

A second `<provider>` entry, alongside `FileProvider`'s (Lesson 25) —
this one `exported="true"`, since its entire purpose is being reachable
from outside the app, gated behind a custom-declared `<permission>` any
other app would need to request in its own Manifest before this
provider will answer it.

### Mechanical Walkthrough
- `android:exported="true"` — reappearing (Lesson 27's `BootReceiver`,
  the same reasoning: genuinely meant to be reached from outside this
  app's own process).
- `android:readPermission="com.yourname.pocketinventory.READ_INVENTORY"`
  — **first appearance.** Requires any caller — including another app
- on the same device — to hold this specific permission before `query`
  is even invoked; the OS enforces this check *before* your code runs
  at all.
- `<permission android:name="..." android:protectionLevel="normal" />`
  — **first appearance.** Defines a brand-new, custom permission this
  app itself introduces (as opposed to `CAMERA`/`POST_NOTIFICATIONS`,
- Lesson 24/26, both platform-defined) — `protectionLevel="normal"`
  means it's granted automatically at install time, no runtime prompt
  (Lesson 24's dangerous-permission flow doesn't apply to a provider
  this narrow).

### Commands Needed — Querying From Outside the App

```
adb shell content query --uri content://com.yourname.pocketinventory.provider/items
```

Run this from a terminal with the app installed and running on a
connected device or emulator. `adb`'s `content` tool is itself a
genuinely separate process from Pocket Inventory — this is a real,
external caller, not a simulation.

### Run It

Confirm the command prints one row per saved item, each showing `id`,
`name`, `quantity`, and `location` — real proof that a process entirely
outside this project's own compiled code successfully queried its data
through the `ContentProvider` contract. Try
`adb shell content query --uri content://com.yourname.pocketinventory.provider/items/1`
and confirm it returns exactly one row, proving `UriMatcher`'s
`ITEM_ID` branch and `ContentUris.parseId` both work correctly.

---

## Connect the Pieces

Full trace: `adb`'s `content` command constructs a
`content://com.yourname.pocketinventory.provider/items` URI and issues
a real cross-process query → the OS checks the `READ_INVENTORY`
permission this project declared before allowing the call through at
all → `InventoryContentProvider.query` runs, `UriMatcher` (built this
lesson's first unit) determines this is a collection request → real
`Item` objects are read through `ItemDao.getAll()` (Lesson 13, the
exact same method every other feature in this project already uses) →
each one is manually flattened into a `MatrixCursor` row, bridging
Room's typed objects back down to the older `Cursor` contract → the
result crosses back out to the calling process exactly as any other
`ContentProvider`-backed data would for a real consuming app.

## What Breaks Without This

Temporarily remove the `android:readPermission` attribute from the
`<provider>` entry (leave `exported="true"`). Rerun the `adb shell content query`
command: it now succeeds with **no permission check at all** — any app
on the device could read this data unchecked. This isn't a crash to
observe, but a real, dangerous silent-success case worth confirming
with your own eyes before restoring the permission requirement
immediately afterward — never leave a provider unprotected, even
briefly, on a real device.

## Exercises

1. Temporarily flip `android:exported` to `false` and rerun the `adb`
   command — confirm it now fails with a `SecurityException`, proving
   `exported` (not just `readPermission`) genuinely gates external
   access. Restore `true` afterward.
2. Add `selection`/`selectionArgs` support to `query`, filtering to
   only low-stock items when called with a selection string like
   `"quantity <= ?"` — read the value, apply it as a real filter before
   building the `MatrixCursor`, and confirm via `adb` (which supports
   passing `--where` on the query command) that filtering works from
   outside the app too.

## Definition of Done

- [ ] `InventoryContentProvider` compiles, correctly routes both
      collection and single-item URIs, and refuses writes loudly.
- [ ] You queried it successfully from a real, separate process via
      `adb shell content query`, not just from within the app.
- [ ] You removed the read permission on purpose, confirmed the
      dangerous unchecked access, and restored it immediately.
- [ ] You can explain, in your own words, why this provider throws on
      `insert`/`update`/`delete` instead of silently doing nothing.
- [ ] Commit: message explaining why (e.g. "Add a read-only
      InventoryContentProvider exposing item data to external callers
      via UriMatcher-routed, permission-gated Cursor queries, kept as
      an alternative access path alongside the app's own Room-backed
      UI").

Lesson 30 is next: every feature in this project has only ever been
verified by running the app and looking at it — JUnit, Mockito, and
writing real, automated tests against `ItemRepository` and
`InventoryViewModel` without needing an emulator at all.

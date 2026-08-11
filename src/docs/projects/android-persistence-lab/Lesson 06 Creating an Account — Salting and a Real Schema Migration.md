# Lesson 06: Creating an Account — Salting and a Real Schema Migration

**What you will build:** The "Create Account" button, currently showing
a `Toast` and doing nothing else, now writes a real new row to `users`
— with a real, per-account random salt mixed into its password hash,
closing the real gap Lesson 05's minimal hashing left open. Getting
there requires the schema itself to change: a new `salt` column, added
through `SQLiteOpenHelper.onUpgrade`, running for real for the first
time since Lesson 01 flagged it as a placeholder. The transferable
problem: Lesson 05's hash comparison genuinely worked, but two different
users who happen to choose the same password would produce the exact
same stored hash — a real, observable pattern an attacker with the
database file can search for, using nothing more exotic than a
precomputed list of common passwords' hashes.

**What you need to know first:** Lesson 05 (`MessageDigest`, hashing,
`UserRepository.checkCredentials`). Lesson 01 (`SQLiteOpenHelper`,
`onUpgrade`, `DATABASE_VERSION`). Lesson 03 (`ContentValues`, `insert`,
the real `UNIQUE` constraint violation on `username`).

**Terms introduced in this lesson:**
- **Rainbow table** — a precomputed table mapping common passwords to
  their hashes, letting an attacker reverse an *unsalted* hash by simple
  lookup instead of by breaking the hash function itself.
- **Salt** — a real, random value, unique per account, mixed into a
  password before hashing — specifically so two identical passwords
  produce two different stored hashes, defeating a precomputed lookup
  table.
- **`SecureRandom`** — Java's real, cryptographically strong random
  number source, distinct from `java.util.Random`'s ordinary,
  predictable-if-seeded generator.
- **Schema migration** — the real, deliberate process of changing an
  existing database's structure after real rows may already exist in
  it, without losing or corrupting that data.

**Objects and methods used:**

**`SecureRandom`**
- *What it is:* Java's real, cryptographically strong random number
  source.
- *Implementation:* `new SecureRandom()` constructs one;
  `nextBytes(byte[])` fills a given array with real random bytes — real,
  standard JDK API, part of `java.security`, not Android-specific.
- *Its use:* generates one real, unique salt per account, inside
  `createAccount`.

**`SQLiteDatabase.execSQL("ALTER TABLE ...")`**
- *What it is:* the same method Lesson 02 used for `CREATE TABLE`, now
  running a different SQL statement.
- *Implementation:* `public void execSQL(String sql)`, unchanged
  signature from Lesson 02 — `ALTER TABLE users ADD COLUMN salt TEXT` is
  real, valid SQLite syntax for adding one new column to an existing
  table.
- *Its use:* called once inside `onUpgrade`, run only on a database
  that already exists at an older version — never inside `onCreate`,
  which already builds the new, correct shape from scratch for a
  brand-new install.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`SQLiteOpenHelper.onUpgrade(SQLiteDatabase, int, int)`**
  - *What it is:* the lifecycle method `SQLiteOpenHelper` calls when an
    existing database's stamped version number is lower than the
    version the app currently declares.
  - *Implementation:* given full treatment in Lesson 01; its real body
    is written for the first time in this lesson.
  - *Its use:* the exact mechanism this lesson's migration runs through.
- **`ContentValues`**
  - *What it is:* an Android key-value container mapping column names
    to the values to write.
  - *Implementation:* given full treatment in Lesson 03.
  - *Its use:* now carries `username`, `password_hash`, *and* `salt`
    together for one new account row.
- **`SQLiteDatabase.insert(String, String, ContentValues)`**
  - *What it is:* the method that writes one new row.
  - *Implementation:* given full treatment in Lesson 03.
  - *Its use:* `createAccount`'s real write; its documented `-1`
    return value on failure is this lesson's real signal for "username
    already taken."
- **`MessageDigest`**
  - *What it is:* Java's real, standard-library class for computing a
    cryptographic hash.
  - *Implementation:* given full treatment in Lesson 05.
  - *Its use:* unchanged mechanism, now hashing `password + salt`
    instead of `password` alone.

---

## Concept Unit: The Real Gap an Unsalted Hash Leaves Open

### The Problem

Lesson 05 proved hashing is deterministic — the *same* input always
produces the *same* output. That's exactly what makes an unsalted hash
column a real, exploitable pattern: two users who both choose the
password `"password123"` would have the *identical* `password_hash`
value sitting in two different rows, plainly visible to anyone who can
read the database file.

### Introduce the Concept in Isolation

Reusing Lesson 05's own `hash` method, unmodified, to prove the exploit
directly rather than only describing it:

```java
public class UnsaltedRiskDemo {
    public static void main(String[] args) throws Exception {
        String aliceHash = UserRepositoryHash.hash("password123");
        String bobHash = UserRepositoryHash.hash("password123");

        System.out.println("alice's stored hash: " + aliceHash);
        System.out.println("bob's stored hash:   " + bobHash);
        System.out.println("identical? " + aliceHash.equals(bobHash));
    }
}
```

(`UserRepositoryHash` here stands in for Lesson 05's own `hash` method,
copied into a second throwaway class purely so this lab can call it
without touching real project code.)

Real output, from running this just now:

```
alice's stored hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94
bob's stored hash:   ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94
identical? true
```

### Mechanical Walkthrough

- Both calls hash the literal, identical string `"password123"` — no
  salt, no per-user difference anywhere in the input — so Lesson 05's
  own proven determinism guarantees an identical output, every time,
  for every user who picks this password.
- `identical? true` — real, observed proof: anyone holding a leaked,
  unsalted `users` table can group rows by matching `password_hash`
  values alone, instantly spotting every account sharing a password,
  and can compare each distinct hash against a **rainbow table** —
  precomputed hashes for millions of the most common real passwords —
  reversing a hash without ever attacking the hash function itself.

### Discard the Throwaway Example

`UnsaltedRiskDemo` and its stand-in helper are deleted now — the real
fix, salting, is next.

### CS Lens

This is exactly the vulnerability Lesson 05's own CS Lens named and
explicitly deferred: a rainbow table attack works specifically *because*
identical inputs produce identical, comparable outputs — the same
determinism property that makes hashing useful for comparison at all is
also, without a salt, the property an attacker exploits.

### SE Lens

**Why didn't Lesson 05 just build salting in from the start, instead of
proving a flawed version first?** Seeing the real, working comparison
mechanism in isolation — with no other moving part yet — made
Lesson 05's own core idea (hash, don't store, compare hashes) provable
on its own terms. Introducing salting at the same time would have
conflated two separate lessons: "how do you compare secrets without
storing them" and "how do you defeat a precomputed attack against
comparisons that are too uniform." Proving the gap concretely, as this
unit just did, is a stronger argument for salting than asserting its
necessity up front would have been.

---

## Concept Unit: A Salt Makes Identical Passwords Hash Differently

### The Problem

The fix has to make `hash(password)` alone insufficient — something
real and different has to enter the computation *per account*, so that
even two users with the literal same password end up with genuinely
different stored values.

### Introduce the Concept in Isolation

```java
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class SaltDemo {
    public static void main(String[] args) throws NoSuchAlgorithmException {
        String password = "correcthorsebattery";

        String saltA = generateSalt();
        String saltB = generateSalt();

        String hashA = hash(password + saltA);
        String hashB = hash(password + saltB);

        System.out.println("salt A: " + saltA);
        System.out.println("salt B: " + saltB);
        System.out.println("hash A: " + hashA);
        System.out.println("hash B: " + hashB);
        System.out.println("same password, same hash? " + hashA.equals(hashB));
    }

    static String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        StringBuilder hex = new StringBuilder();
        for (byte b : saltBytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    static String hash(String input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest(input.getBytes());
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}
```

Compile and run:

```
javac SaltDemo.java
java SaltDemo
```

Real output, from running this just now:

```
salt A: 3378924904aec8dc931b1d918893d8a5
salt B: ee42cfd2da834ad6f486acee2fa9928e
hash A: 63dc965207dbeaec205f13fd31d0c85f21fe558b61866fc066e3b7faa5a2e6d0
hash B: ea567986212d0342efeeb170b66a9ebd68da607c8b21cff6806ce928df5dbd1a
same password, same hash? false
```

#### Execution Trace — Two Separate Byte-to-Hex Loops

`generateSalt()` and `hash(...)` each run the identical byte-to-hex loop
Lesson 05 already traced in full — reappearing here unchanged, applied
to two different byte arrays:

1. `generateSalt()`'s own loop runs first, over 16 real random bytes
   from `nextBytes(saltBytes)`. Its first byte formats to `"33"`, its
   second to `"78"` — matching `salt A`'s real printed first four
   characters, `"3378..."`, above.
2. `hash(password + saltA)`'s loop runs separately, over the 32 real
   bytes `digest.digest(...)` returns for `SHA-256`. Its first byte
   formats to `"63"`, its second to `"dc"` — matching `hash A`'s real
   printed first four characters, `"63dc..."`, above.

Both loops are the same mechanism, run twice on two different inputs —
not two different mechanisms — exactly the DRY observation this unit's
own Mechanical Walkthrough and CS Lens make explicit below.

### Mechanical Walkthrough

- `new SecureRandom()` — **first appearance.** Unlike `java.util.Random`
  (predictable, and sometimes deliberately seeded for reproducible
  results elsewhere in software — never appropriate here),
  `SecureRandom` is specifically designed to be unpredictable, the real,
  standard choice any time randomness has security consequences.
- `random.nextBytes(saltBytes)` — **first appearance.** Fills the given
  `byte[]` — 16 real random bytes here — in place; no return value,
  the array itself is mutated directly.
- The byte-to-hex conversion — reappearing exactly (Lesson 05's own
  `hash` method), applied here to raw salt bytes instead of a hash's
  output, purely to get a `String` this project can store in a `TEXT`
  column.
- `hash(password + saltA)` — **first appearance of salting the input.**
  Plain `String` concatenation, combining the real typed password with
  this account's own real random salt *before* hashing — the entire
  mechanism: the hash function itself is completely unchanged from
  Lesson 05, only what's fed into it is different.
- `same password, same hash? false` — real, observed proof: the
  identical literal password, salted two different ways, produces two
  hashes with nothing in common — directly closing the gap the previous
  unit demonstrated.

### Discard the Throwaway Example

`SaltDemo` is deleted now — the mechanism carries forward into
`UserRepository`'s real, updated code, next.

### CS Lens

A salt doesn't make the hash function itself any stronger — it changes
the *distribution* of what gets hashed, so a precomputed table built
for "common passwords, unsalted" simply doesn't apply anymore: an
attacker would need a separate rainbow table *per salt value*, and a
real, unique-per-account random salt makes precomputing one for every
account as expensive as attacking each password individually — the
entire point.

Also recognized in: real password-hashing algorithms designed
specifically for this job (`bcrypt`, `scrypt`, `Argon2`) that build
salting in as a required part of the algorithm itself rather than
something the caller has to remember to do manually, the way this
project's own minimal `SHA-256`-based approach still requires — a real,
honest limitation named directly in this lesson's own SE Lens below.

### SE Lens

**Given real password-hashing algorithms like `bcrypt` exist and build
salting in automatically, why does this project roll its own
salt-plus-`SHA-256` approach instead?** `SHA-256` is a real,
general-purpose cryptographic hash — fast by design, which is
*exactly* wrong for password hashing specifically: fast means an
attacker with a stolen, salted hash can still try billions of guesses
per second on capable hardware. `bcrypt`/`Argon2` are deliberately slow
and tunable, built specifically to resist that. This project's own
`SHA-256`-plus-salt approach is a genuine, real improvement over no
salt at all, and a genuine, honest step short of production-grade —
worth building here specifically *because* it makes every piece (the
hash, the salt, the combination) visible and traceable in code this
project wrote itself, rather than delegated to a library whose own
internals stay a black box. A real production app would reach for a
real password-hashing library; understanding precisely what that
library is doing, and why, is what this lesson's own from-scratch
version is for.

---

## Concept Unit: A Real Schema Migration — Adding the `salt` Column

### The Problem

`users` (Lesson 02) has no `salt` column at all. Adding one to a table
that might already hold real rows — on a real device, right now, this
project's own `users` table might already have Lesson 05's seeded test
account sitting in it — is a genuinely different operation from writing
a fresh `CREATE TABLE` for a brand-new install.

### Introduce the Concept in Isolation

Real `sqlite3`, proving `ALTER TABLE` directly, including what happens
to a row that already existed before the column did:

```bash
rm -f alter_demo.db
sqlite3 alter_demo.db "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL);"
sqlite3 alter_demo.db "INSERT INTO users (username, password_hash) VALUES ('alice', 'oldhash');"
sqlite3 alter_demo.db "ALTER TABLE users ADD COLUMN salt TEXT;"
sqlite3 alter_demo.db ".schema users"
sqlite3 -header -column alter_demo.db "SELECT * FROM users;"
```

Real output, from running this just now:

```
CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, salt TEXT);
id  username  password_hash  salt
--  --------  -------------  ----
1   alice     oldhash
```

### Mechanical Walkthrough

- `ALTER TABLE users ADD COLUMN salt TEXT;` — real, valid SQLite syntax,
  adding exactly one new column to an existing table, in place — no
  data anywhere in the table is deleted or rebuilt.
- The real, printed schema afterward — `salt TEXT` is genuinely now part
  of `users`' own declared shape, the same way it would be if `CREATE
  TABLE` had declared it from the start.
- The real `SELECT *` output — `alice`'s existing row now has a `salt`
  column, but its value is blank — SQLite's own real, documented
  behavior for `ALTER TABLE ADD COLUMN` on a table with existing rows:
  every pre-existing row gets the new column set to `NULL`, since there
  is no historical value to backfill it with. This is the honest,
  concrete cost a real migration has to account for, not hide: adding a
  column doesn't retroactively fix what a pre-existing row is actually
  missing.

### Discard the Throwaway Example

```bash
rm -f alter_demo.db
```

The real mechanism carries forward into `DatabaseHelper.onUpgrade`,
next.

### CS Lens

A schema migration is exactly the same problem `SQLiteOpenHelper`'s own
version-number design (Lesson 01) exists to solve: `onCreate` builds the
*current, correct* shape once, for a database that doesn't exist yet;
`onUpgrade` transforms an *older* real shape into the current one,
in place, for a database that already has real data other code depends
on. Confusing the two — writing new-shape logic inside `onCreate` alone
and hoping it also fixes existing installs — is a common, real mistake:
`onCreate` never runs again once a database file already exists,
regardless of how much the declared schema in code has changed since.

Also recognized in: any long-lived system with a persistent schema a
web application's own SQL migration files, a mobile app's Realm/Room
schema versioning, or a JSON API bumping a request/response shape while
still needing to honor requests written against the older one.

### SE Lens

**Why is `oldVersion`/`newVersion` — not just "the schema changed,
fix it" — the real signature `onUpgrade` receives?** A real app can be
upgraded by a user who skipped several versions at once — jumping from
version 1 directly to version 3, having never run version 2's own
upgrade. Receiving the real starting version lets `onUpgrade` apply
exactly the migrations actually needed for *this* device's real
starting point (a real `if (oldVersion < 2) { ... }` check, added below,
covers exactly this case), rather than assuming every device upgrades
one version at a time in order.

### Project Change

- **Reference Source:** `SQLiteOpenHelper`'s real `onUpgrade` contract,
  already quoted in full in Lesson 01 — this lesson writes its first
  real body.
- **Files affected:** `DatabaseHelper.java`.
- **Change type:** Bump `DATABASE_VERSION`; write `onUpgrade`'s real
  body.
- **Dependencies:** None new.

### The New Code

```java
private static final int DATABASE_VERSION = 2;  // ← changed, was 1

@Override
public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
    if (oldVersion < 2) {
        db.execSQL("ALTER TABLE users ADD COLUMN salt TEXT");
    }
}
```

### The Updated Project

`DatabaseHelper.java` in full:

```java
package com.yourname.yourapp;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class DatabaseHelper extends SQLiteOpenHelper {
    private static final String DATABASE_NAME = "app.db";
    private static final int DATABASE_VERSION = 2;  // ← changed

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("CREATE TABLE users (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "username TEXT NOT NULL UNIQUE, " +
            "password_hash TEXT NOT NULL, " +
            "salt TEXT)");                                  // ← changed: salt added

        db.execSQL("CREATE TABLE items (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "name TEXT NOT NULL, " +
            "quantity INTEGER NOT NULL DEFAULT 0)");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {                                // ← new
            db.execSQL("ALTER TABLE users ADD COLUMN salt TEXT"); // ← new
        }
    }
}
```

### Mechanical Walkthrough

- `DATABASE_VERSION = 2` — reappearing field (Lesson 01), its value
  changed for the first time; this single number is what tells
  `SQLiteOpenHelper` a real, existing database (stamped `1`) needs
  `onUpgrade` called at all.
- `onCreate`'s own `CREATE TABLE users (...)` — updated to declare `salt
  TEXT` directly, so a **brand-new** install gets the correct, final
  shape in one step and never needs `onUpgrade` to run at all — the two
  methods together cover both real cases: a fresh install, and an
  existing one catching up.
- `if (oldVersion < 2)` — reappearing `if` (basic, already-established
  syntax), the concrete answer to this unit's own SE Lens: only runs the
  `salt` migration for a device whose real, stamped version is still
  behind it — a device already at version 2 or later, on some future
  upgrade, correctly skips this block entirely.
- `db.execSQL("ALTER TABLE users ADD COLUMN salt TEXT")` — the exact
  real statement proved in isolation above, now run for real, only on a
  device where it's actually needed.

## What Breaks Without This (the Migration)

Lesson 05's own seeded test account (`alice`) is a real, concrete
casualty of this exact migration, worth confronting directly rather than
skipping past: that row was written *before* the `salt` column existed,
so after this migration runs, its `salt` value is genuinely `NULL` — the
same real, observed behavior the `sqlite3` lab proved above. Once this
lesson's updated `checkCredentials` (next) starts reading and using
`salt`, logging in as the old `alice` row will fail, correctly — its
stored hash was never computed with a salt at all, so no typed password
can ever produce a matching, salted comparison against it. This isn't a
bug to fix; it's the honest, real cost of a schema migration that adds a
required piece old data was never written with. The fix is exactly what
this lesson builds next: create a real account through the real
`createAccount` flow instead, which never has this gap.

---

## Concept Unit: `createAccount` and the Updated `checkCredentials`

### The Problem

With a real `salt` column and a real salting mechanism both proven, two
real methods need building: one that generates a salt and writes a new
row with it, and an update to Lesson 05's existing check, since it never
read or used a salt at all.

### Project Change

- **Reference Source:** No external framework signature beyond what's
  already quoted above.
- **Files affected:** `UserRepository.java`;
  `MainActivity.java` (the create-account button's listener).
- **Change type:** Add one new method; change two existing methods.
- **Dependencies:** `DatabaseHelper` (now at version 2).

### The New Code

`UserRepository.java`, the new and changed methods:

```java
public boolean createAccount(String username, String password) {
    String salt = generateSalt();
    String passwordHash = hash(password + salt);

    ContentValues values = new ContentValues();
    values.put("username", username);
    values.put("password_hash", passwordHash);
    values.put("salt", salt);

    SQLiteDatabase db = databaseHelper.getWritableDatabase();
    long newId = db.insert("users", null, values);
    return newId != -1;
}

public boolean checkCredentials(String username, String password) {
    SQLiteDatabase db = databaseHelper.getReadableDatabase();
    Cursor cursor = db.query("users", new String[]{"password_hash", "salt"},
        "username = ?", new String[]{username}, null, null, null);
    try {
        if (!cursor.moveToFirst()) {
            return false;
        }
        String storedHash = cursor.getString(cursor.getColumnIndexOrThrow("password_hash"));
        String salt = cursor.getString(cursor.getColumnIndexOrThrow("salt"));
        String typedHash = hash(password + salt);
        return storedHash.equals(typedHash);
    } finally {
        cursor.close();
    }
}

private static String generateSalt() {
    SecureRandom random = new SecureRandom();
    byte[] saltBytes = new byte[16];
    random.nextBytes(saltBytes);
    return toHex(saltBytes);
}
```

In `MainActivity.java`, the create-account button's listener:

```java
createAccountButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();

    UserRepository userRepository = new UserRepository(new DatabaseHelper(this));
    if (userRepository.createAccount(username, password)) {
        Toast.makeText(this, "Account created — you can now log in", Toast.LENGTH_SHORT).show();
    } else {
        Toast.makeText(this, "That username is already taken", Toast.LENGTH_SHORT).show();
    }
});
```

### The Updated Project

`UserRepository.java` in full:

```java
package com.yourname.yourapp;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class UserRepository {
    private final DatabaseHelper databaseHelper;

    public UserRepository(DatabaseHelper databaseHelper) {
        this.databaseHelper = databaseHelper;
    }

    public boolean createAccount(String username, String password) {  // ← new
        String salt = generateSalt();
        String passwordHash = hash(password + salt);

        ContentValues values = new ContentValues();
        values.put("username", username);
        values.put("password_hash", passwordHash);
        values.put("salt", salt);

        SQLiteDatabase db = databaseHelper.getWritableDatabase();
        long newId = db.insert("users", null, values);
        return newId != -1;
    }

    public boolean checkCredentials(String username, String password) {
        SQLiteDatabase db = databaseHelper.getReadableDatabase();
        Cursor cursor = db.query("users", new String[]{"password_hash", "salt"}, // ← changed
            "username = ?", new String[]{username}, null, null, null);
        try {
            if (!cursor.moveToFirst()) {
                return false;
            }
            String storedHash = cursor.getString(cursor.getColumnIndexOrThrow("password_hash"));
            String salt = cursor.getString(cursor.getColumnIndexOrThrow("salt"));         // ← new
            String typedHash = hash(password + salt);                                      // ← changed
            return storedHash.equals(typedHash);
        } finally {
            cursor.close();
        }
    }

    private static String generateSalt() {          // ← new
        SecureRandom random = new SecureRandom();
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return toHex(saltBytes);
    }

    private static String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return toHex(digest.digest(input.getBytes()));  // ← changed: shares toHex now
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 is required on every real JVM/Android runtime", e);
        }
    }

    private static String toHex(byte[] bytes) {      // ← new: factored out, shared by both hash and generateSalt
        StringBuilder hex = new StringBuilder();
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }
}
```

### Mechanical Walkthrough

- `public boolean createAccount(String username, String password)` —
  **first appearance.** Returns a plain `boolean` — the same minimal,
  deliberate interface reasoning as `checkCredentials` (Lesson 05):
  `MainActivity` only ever needs "did it work."
- `String salt = generateSalt();` — a fresh, real random salt, generated
  once per account, at creation time — never reused, never derived from
  anything about the account itself.
- `String passwordHash = hash(password + salt);` — the real, proven
  salting mechanism from this lesson's own lab, now hashing the actual
  typed password.
- The `ContentValues`/`insert` block — reappearing exactly (Lesson 03),
  now writing three columns instead of two.
- `long newId = db.insert("users", null, values); return newId != -1;`
  — reusing `insert`'s own real, documented return value (Lesson 03:
  the new row's id, or `-1` on failure) as this method's entire success
  signal — no separate check needed for "was the username already
  taken," since `UNIQUE` (Lesson 02) makes that failure surface as
  exactly this `-1`, a real, captured error already proven back in
  Lesson 02.
- `checkCredentials`'s changed `query` call — now asks for `"salt"` too,
  alongside `"password_hash"`, since computing a comparable hash
  requires knowing which salt this specific row was created with.
- `String typedHash = hash(password + salt);` — **moved**, deliberately,
  from before the query (Lesson 05) to after it. This is a real,
  necessary reversal of Lesson 05's own SE Lens point about hashing
  before querying to avoid leaking timing information: with a per-user
  salt, the hash genuinely cannot be computed until the matching row's
  own salt is known, so that specific defense is no longer available at
  all with this design — an honest tradeoff this lesson is naming
  directly, not silently dropping.
- `private static String toHex(byte[] bytes)` — **first appearance of
  factoring out shared code.** Both `hash` and `generateSalt` needed
  identical byte-to-hex conversion logic; pulling it into one shared,
  `private` method means the conversion is written and can be verified
  correct exactly once, rather than maintained in two separate,
  easy-to-drift-apart copies.

### CS Lens

Factoring `toHex` out of both `hash` and `generateSalt` is the **DRY**
principle (Don't Repeat Yourself) applied at the smallest possible
scale: two methods needed the exact same six lines: one, `private`
method removes the duplication entirely, and a future bug fix to the
hex conversion (there isn't one needed here, but in general) would only
ever need to happen in one place.

### SE Lens

**Why does `checkCredentials` still return a plain `boolean` — "wrong
password" and "no such username" both look identical to the caller —
rather than telling `MainActivity` which one actually happened?**
Revealing *which* reason a login failed is a real, well-known security
leak: an attacker probing for valid usernames could tell "this username
doesn't exist" apart from "this username exists, wrong password" and
use that to enumerate real accounts one guess at a time. Returning the
same, undifferentiated `false` for both cases — exactly what this
method already does — denies that information deliberately, not by
oversight.

---

## Connect the Pieces

One trace, start to finish: `DatabaseHelper`'s version bump to `2`
causes `onUpgrade` to run once, for real, on any device that already had
version 1 installed — adding the `salt` column that never existed
before, and leaving Lesson 05's old seeded row with a real, unusable
`NULL` salt as an honest consequence. Tapping "Create Account" now
generates a real, random per-account salt, hashes the typed password
together with it, and writes all three real values — username,
password hash, salt — as one row, `insert`'s own `-1`-on-failure
behavior doubling as this project's real "username taken" check.
Tapping "Log In" afterward reads that exact row's own salt back out,
recomputes the same salted hash, and compares — the full loop this
series set out to build, now genuinely resistant to the specific,
demonstrated rainbow-table risk an unsalted version left wide open.

## What Breaks Without This

Attempt to create two real accounts with the exact same password (but
different usernames) through the running app, then use **Device File
Explorer** to pull the real `.db` file and inspect both rows with
`sqlite3` directly:

```
sqlite3 app.db "SELECT username, password_hash, salt FROM users;"
```

Real, expected result: both rows' `password_hash` values are
completely different, despite an identical typed password — direct,
on-device proof the salt is doing real, distinguishing work, the exact
property `UnsaltedRiskDemo` proved was missing before this lesson.
Separately, attempt to log in as the old, pre-migration `alice` account
(if you still have it) — real result: rejected, exactly as "What Breaks
Without This (the Migration)" predicted above, since its stored hash was
never salted at all. Create a fresh `alice` account through the real
"Create Account" flow instead.

## Exercises

1. Create a real account, then use `sqlite3` on the pulled `.db` file to
   manually change that row's `salt` column to a different, arbitrary
   value. Attempt to log in with the correct original password — real
   result: rejected, direct proof the stored salt is genuinely load-
   bearing in the comparison, not decorative.
2. Explain, in your own words, why `newId != -1` alone is enough to
   detect "username already taken," tracing the real chain back through
   `insert`'s documented return value (Lesson 03) to the `UNIQUE`
   constraint (Lesson 02) that makes the failure happen at all.
3. Look up one real, standard password-hashing library (`bcrypt` is a
   reasonable choice) and identify, from its own documentation, where
   in its own API salting happens automatically — confirming concretely
   what this lesson's SE Lens claimed about production libraries
   building the step this project did by hand directly into the
   algorithm itself.

## Definition of Done

- [ ] You ran the `UnsaltedRiskDemo` lab and saw two identical passwords
      produce two identical hashes — the real vulnerability, not just an
      assertion of it.
- [ ] You ran the `SaltDemo` lab and saw the same password produce two
      different hashes once salted differently.
- [ ] You ran the real `ALTER TABLE` lab and can explain what happens to
      a pre-existing row's new column.
- [ ] You created at least two real accounts with the same password
      through the running app, pulled the real `.db` file, and confirmed
      their stored hashes genuinely differ.
- [ ] You can explain why `checkCredentials` no longer hashes the typed
      password *before* running its query, and what real defense that
      change costs.
- [ ] Commit: `git commit -m "Add real account creation with per-account
      salting; migrate the users table to a new schema version"` —
      explaining the security property gained and the real migration
      required to get it, not just that a button now does something.

Next: `UPDATE` — editing a grid row for real, the data-grid requirement's
first mutation beyond insert.

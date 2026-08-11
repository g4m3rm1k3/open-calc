# Lesson 05: Real Login — Checking Credentials Against the Database

**What you will build:** The login button, currently accepting any typed
input at all and navigating unconditionally, now checks a real typed
username and password against a real row in the `users` table —
rejecting a wrong username or a wrong password, only navigating to the
grid on a genuine match. The transferable problem: Lesson 02's schema
already named its password column `password_hash`, not `password` — a
real row never holds what a user actually typed, only a value derived
from it. Checking a login means computing that same derivation from
what was just typed and comparing the *results*, never comparing the
typed password against anything stored directly.

**What you need to know first:** Lesson 04 (`SELECT`, `Cursor`, the
`while (cursor.moveToNext())` row-walking loop). Lesson 02 (`users`
table schema — `username TEXT NOT NULL UNIQUE`, `password_hash TEXT NOT
NULL`). `android-ui-foundations` Lesson 16 (the login button's existing
click listener, `Toast`).

**Terms introduced in this lesson:**
- **Hash function** — a function that converts any input into a
  fixed-size output, deterministically (the exact same input always
  produces the exact same output) and — for a cryptographic hash
  function specifically — with no practical way to work backward from
  the output to recover the original input.
- **`MessageDigest`** — Java's real, standard-library API for computing
  a cryptographic hash; not Android-specific, part of the JDK itself.
- **Single-row lookup** — this lesson's own informal name for querying
  for at most one specific row and checking whether it existed at all,
  as opposed to Lesson 04's loop over every row a query returns.

**Objects and methods used:**

**`MessageDigest`**
- *What it is:* Java's real, standard-library class for computing a
  cryptographic hash.
- *Implementation:* `MessageDigest.getInstance(String algorithm)` is a
  `static` factory method returning a configured instance for a named
  algorithm (`"SHA-256"`, used here); `digest(byte[] input)` is an
  instance method computing the actual hash, returning it as a raw
  `byte[]`, both real, standard JDK API, part of `java.security`, not
  Android-specific.
- *Its use:* the mechanism this lesson's `hash(String)` helper is built
  on, turning a typed password into the same fixed-size value the
  database stores.

**`Cursor.moveToFirst()`**
- *What it is:* the method that moves a `Cursor` to its first row, if
  one exists.
- *Implementation:* `boolean moveToFirst()`, real declared signature
  confirmed this session against Android's own reference documentation
  — returns `true` if a first row exists, `false` if the result set is
  genuinely empty.
- *Its use:* this lesson's real subject — checking *whether any row
  matched at all*, a single yes/no question, as opposed to Lesson 04's
  `moveToNext()` loop, which walks every row a query returns one at a
  time.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`Cursor`**
  - *What it is:* Android's real, live position over a query's result
    set.
  - *Implementation:* given full treatment in Lesson 04.
  - *Its use:* the return value of `db.query(...)`, checked here with
    `moveToFirst()` instead of walked with `moveToNext()`.
- **`SQLiteDatabase.query(...)`**
  - *What it is:* the method that runs a real `SELECT`.
  - *Implementation:* given full treatment in Lesson 04.
  - *Its use:* called with a real `WHERE username = ?` filter this time,
    instead of Lesson 04's no-filter "every row."
- **`Toast`**
  - *What it is:* a small, temporary on-screen message.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 16.
  - *Its use:* shown on a failed login attempt, the real branch this
    lesson adds alongside the existing successful-login path.

---

## Concept Unit: A Hash Lets You Compare Without Ever Storing the Original

### The Problem

`password_hash TEXT NOT NULL` (Lesson 02) already ruled out storing what
a user actually types. Checking a login still requires comparing *some*
real value the user typed against *something* stored — the question is
what gets compared, if not the raw password itself.

### Introduce the Concept in Isolation

```java
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class HashDemo {
    public static void main(String[] args) throws NoSuchAlgorithmException {
        String password = "correcthorsebattery";
        String hash1 = hash(password);
        String hash2 = hash(password);
        String hash3 = hash("wrongpassword");

        System.out.println(hash1);
        System.out.println(hash1.equals(hash2));
        System.out.println(hash1.equals(hash3));
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
javac HashDemo.java
java HashDemo
```

Real output, from running this just now:

```
10ef1b051eb9faeb589d9c44463334db3ae84035b431b6fca397c35506b18fc4
true
false
```

#### Execution Trace — the Byte-to-Hex Loop

`digest.digest(...)` returns a `byte[]` of 32 raw bytes for SHA-256 —
not yet readable text. The `for` loop converts each one, in order,
tracing its first three real iterations against the real output above:

1. `bytes[0]` is the raw byte whose value, formatted as two hex digits
   by `String.format("%02x", b)`, produces `"10"` — the first two
   characters of the real output shown above. `hex` now holds `"10"`.
2. `bytes[1]` formats to `"ef"`, appended next. `hex` now holds
   `"10ef"`.
3. `bytes[2]` formats to `"1b"`, appended next. `hex` now holds
   `"10ef1b"` — already recognizable as the start of the real printed
   hash.

This repeats for all 32 bytes; the loop's own logic never changes
between iterations — each pass reads one more raw byte, formats it, and
appends it, until `bytes` is exhausted and `hex.toString()` returns the
complete 64-character hex string printed above.

### Mechanical Walkthrough

- `MessageDigest.getInstance("SHA-256")` — **first appearance.** A
  `static` factory method (Lesson 01's `println`-adjacent `static`
  reasoning, reappearing) returning a `MessageDigest` configured for the
  named algorithm — `"SHA-256"` here, one of several real, standard
  algorithm names the JDK guarantees every implementation supports.
- `digest.digest(input.getBytes())` — **first appearance.** Computes the
  actual hash. `input.getBytes()` converts the `String` into its raw
  byte representation first, since a hash function operates on bytes,
  not on Java's own internal `String` representation directly. The
  return value is a `byte[]` — not yet the readable hex text shown
  above.
- The `for` loop and `String.format("%02x", b)` — converts each raw byte
  into two hexadecimal characters, building the same familiar
  hex-string shape every real password hash you've ever seen online
  uses; not this lesson's own concept, ordinary byte-to-hex formatting.
- `hash1.equals(hash2)` — **`true`.** The exact same input, hashed
  twice, produces the *exact same* output both times — this is what
  **deterministic** means, and it's the entire mechanism a login check
  depends on: hash whatever was just typed, compare it against what's
  stored, and a match in the hashes proves a match in the original
  inputs, with neither original input ever needing to sit next to the
  other.
- `hash1.equals(hash3)` — **`false`.** A different input — even one
  character different — produces a completely different-looking output,
  not a similar one; real, observed proof, not just a claim about what
  a cryptographic hash function is supposed to do.

### Discard the Throwaway Example

`HashDemo` is deleted now — the mechanism it proved (deterministic,
one-way, and sensitive to any input change) carries forward into
`UserRepository`'s real `hash` method, next.

### CS Lens

A cryptographic hash function is deliberately **one-way**: computing
`hash(password)` is cheap and fast, but there is no practical way to
start from the hash and recover the original password — this is the
entire reason `password_hash` can be stored on disk at all without
storing the password itself. Comparing two hashes for equality is a
sound proxy for comparing the two original inputs specifically because
of determinism (same input, same output, every time) — not because the
hash "looks like" the password in any way.

Also recognized in: Git's own commit hashes (a `SHA-1`/`SHA-256` digest
of a commit's real content, used to detect whether *anything* changed),
file-integrity checksums verifying a download wasn't corrupted or
tampered with, and — the specific real-world failure this lesson's own
minimal version doesn't yet fully defend against, honestly named here
rather than glossed over — a **rainbow table** attack, where an attacker
precomputes hashes for millions of common passwords in advance; the full
defense against that (a per-user random **salt**, mixed into the input
before hashing) is real, standard practice this project doesn't yet
implement, covered directly next lesson alongside account creation
itself.

### SE Lens

**Why hash at all, instead of just comparing the typed password directly
against a stored plain-text one — simpler code, same result for a
legitimate login attempt?** The two are only equivalent for the *correct*
login case. The moment the database file itself is ever read by anyone
who shouldn't have it — a stolen backup, a misconfigured cloud sync, a
compromised server — a plain-text password column hands over every
user's actual, real password directly, readable by anyone with the file.
A hashed column hands over only values a one-way function produced,
useless for logging in anywhere else without first reversing a
function specifically designed to resist that. The cost of hashing —
one extra computation on every login attempt — is negligible; the
asymmetry in what a leak actually exposes is not.

---

## Concept Unit: A Single-Row Lookup — Does *Any* Row Match?

### The Problem

Lesson 04's `getAllItems()` asked "give me every row" and walked all of
them with `moveToNext()`. A login check asks a genuinely different
question: "does exactly one row exist with this username, and if so,
does its stored hash match?" — a yes/no question about *whether a first
row exists at all*, not a loop over an unknown number of rows.

### The Contract You're Reading From (from `android.database.Cursor`, not your code)

```java
boolean moveToFirst();
```

Real, documented behavior, confirmed this session against Android's own
reference documentation: moves the `Cursor` to the first row and returns
`true` — or returns `false`, moving nowhere, if the result set is
genuinely empty. This is the same `Cursor` from Lesson 04, one different
method on it: `moveToNext()` answers "is there a *next* row from here,"
useful inside a loop; `moveToFirst()` answers "is there a first row at
all," useful exactly once, for exactly this kind of check.

### Mechanical Walkthrough

- `if (!cursor.moveToFirst())` — reads as "if there is no first row at
  all" — the real, immediate rejection for a username that doesn't exist
  in the table, before any password comparison is even attempted.
- The `WHERE username = ?` filter (below, in the real code) is what
  makes `moveToFirst()` the *correct* check here specifically: `username`
  is declared `UNIQUE` (Lesson 02), so this exact query can only ever
  match zero rows or exactly one — never two — which is precisely the
  case `moveToFirst()` alone is enough to answer, with no loop needed.

### CS Lens

This is the same **single-row lookup** shape as Lesson 04's
`getAllItems()`, narrowed by a real `WHERE` clause enforcing, at the
schema level (`UNIQUE`), that the narrowing can only ever produce zero
or one result — the query's own guarantee is what makes a loop
unnecessary here, not an assumption this code happens to make on its
own.

### SE Lens

**Why rely on the database's own `UNIQUE` constraint to guarantee at
most one match, instead of just calling `moveToNext()` in a loop here
too and taking whichever row comes first?** Looping and silently
ignoring extra rows would hide a real, serious bug — two accounts
somehow sharing one username — behind login attempts that happen to
"work anyway" by picking one arbitrarily. Relying on the schema's own
enforced guarantee means that bug is structurally impossible instead of
merely unlikely: `UNIQUE` was proven, with a real captured error, back
in Lesson 02.

---

## Concept Unit: `UserRepository.checkCredentials` — The Real Check

### The Problem

With both pieces proven — hashing and a single-row lookup — a real
method can combine them: hash what was just typed, look up the row by
username, and compare the stored hash against the freshly computed one.

### Project Change

- **Reference Source:** No external framework signature beyond what's
  already quoted above — `UserRepository` is a new application class
  this project authors, the same shape as Lesson 03/04's
  `ItemRepository`.
- **Files affected:** New file
  `app/src/main/java/com/yourname/yourapp/UserRepository.java`;
  `MainActivity.java` (the login button's click listener).
- **Change type:** Create one new file; replace the body of an existing
  click listener.
- **Dependencies:** `DatabaseHelper` (Lesson 01).

### The New Code

`UserRepository.java`:

```java
package com.yourname.yourapp;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class UserRepository {
    private final DatabaseHelper databaseHelper;

    public UserRepository(DatabaseHelper databaseHelper) {
        this.databaseHelper = databaseHelper;
    }

    public boolean checkCredentials(String username, String password) {
        String typedHash = hash(password);

        SQLiteDatabase db = databaseHelper.getReadableDatabase();
        Cursor cursor = db.query("users", new String[]{"password_hash"},
            "username = ?", new String[]{username}, null, null, null);
        try {
            if (!cursor.moveToFirst()) {
                return false;
            }
            String storedHash = cursor.getString(cursor.getColumnIndexOrThrow("password_hash"));
            return storedHash.equals(typedHash);
        } finally {
            cursor.close();
        }
    }

    private static String hash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 is required on every real JVM/Android runtime", e);
        }
    }
}
```

In `MainActivity.java`, the login button's listener, changed:

```java
loginButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();

    UserRepository userRepository = new UserRepository(new DatabaseHelper(this));
    if (userRepository.checkCredentials(username, password)) {
        Intent intent = new Intent(this, InventoryActivity.class);
        startActivity(intent);
    } else {
        Toast.makeText(this, "Incorrect username or password", Toast.LENGTH_SHORT).show();
    }
});
```

### The Updated Project

`MainActivity`'s login listener in full:

```java
loginButton.setOnClickListener((view) -> {
    String username = usernameField.getText().toString();
    String password = passwordField.getText().toString();

    UserRepository userRepository = new UserRepository(new DatabaseHelper(this));  // ← new
    if (userRepository.checkCredentials(username, password)) {                     // ← new
        Intent intent = new Intent(this, InventoryActivity.class);
        startActivity(intent);
    } else {                                                                        // ← new
        Toast.makeText(this, "Incorrect username or password", Toast.LENGTH_SHORT).show(); // ← new
    }
});
```

### Mechanical Walkthrough

- `public boolean checkCredentials(String username, String password)` —
  **first appearance.** Returns a plain `boolean` — the entire real
  answer a login attempt needs: did it match, yes or no.
- `String typedHash = hash(password);` — computed once, up front, before
  any database access — the exact same `hash` mechanism proved in
  isolation above, now real project code.
- `db.query("users", new String[]{"password_hash"}, "username = ?", new String[]{username}, null, null, null)`
  — reappearing (Lesson 04's `query` shape), with two real differences:
  `columns` now names exactly one column (`"password_hash"` — this
  check never needs to read `id` or `username` back, since it already
  knows both), and `selection`/`selectionArgs` now filter to exactly one
  username, using the same `?`-placeholder parameter binding already
  proven safe against SQL injection in Lesson 03.
- `if (!cursor.moveToFirst())` — this lesson's own subject, applied:
  no matching username means an immediate, real rejection.
- `cursor.getColumnIndexOrThrow("password_hash")` / `cursor.getString(...)`
  — reappearing (Lesson 04), reading the one column this query asked
  for.
- `storedHash.equals(typedHash)` — the actual comparison: `String`'s own
  real `equals` method (inherited from `Object`, already met via
  `android-ui-foundations` Lesson 03's `getClass()` discussion),
  checking the two hash strings character-for-character. This is the
  entire login check — nowhere in this method does a raw, typed password
  ever get compared against, or sit next to, anything read from the
  database.
- `private static String hash(String input)` — the same real mechanism
  from the throwaway lab, now a private helper only `UserRepository`
  itself calls — `private` (`android-ui-foundations` Lesson 13) since no
  other class has any legitimate reason to compute a hash directly.
- `catch (NoSuchAlgorithmException e)` — `MessageDigest.getInstance`
  declares this checked exception because, in principle, a JVM could
  lack a requested algorithm; `"SHA-256"` specifically is guaranteed
  present on every real Java and Android runtime by the platform's own
  specification, so this catch block exists only to satisfy the
  compiler's checked-exception requirement, wrapping an error that is
  real to the compiler but not realistically triggerable here.
- `UserRepository userRepository = new UserRepository(new DatabaseHelper(this));`
  — reappearing construction pattern (Lessons 03–04's own
  `ItemRepository` wiring), now for a second, real repository class.
- `Toast.makeText(this, "Incorrect username or password", Toast.LENGTH_SHORT).show();`
  — reappearing (`android-ui-foundations` Lesson 16), the real failure
  path this lesson adds; the login screen's own fields keep whatever was
  typed, since nothing here clears them.

### CS Lens

`checkCredentials` returning a plain `boolean` — never the row, never
the hash, never anything about *why* it failed — is a deliberate,
minimal interface: the caller (`MainActivity`) only ever needed a
yes/no answer, and handing back anything more (the stored hash, for
instance) would be real, unnecessary exposure of a value that has no
legitimate reason to leave `UserRepository` at all.

### SE Lens

**Why compute `typedHash` before running the database query at all,
rather than after confirming a matching username exists?** The order
here is deliberate, not incidental: hashing is a fixed, small,
predictable cost regardless of whether the username turns out to exist,
which means an attacker probing for valid usernames can't distinguish
"username doesn't exist" from "username exists, wrong password" by
measuring how long the check took — both paths do genuinely comparable
work. This is a real, if minor, defense this lesson's structure already
provides almost for free, worth noticing even though timing-attack
defense in full is well beyond this project's own scope.

---

## Connect the Pieces

One trace: tapping "Log In" reads both fields, computes a real SHA-256
hash of the typed password, and asks `UserRepository` whether any row in
`users` has that exact username *and* that exact stored hash. A
non-existent username fails at `moveToFirst()`, before any hash
comparison even matters. An existing username with a wrong password
fails at `storedHash.equals(typedHash)` — the freshly computed hash
simply doesn't match what's stored, per this lesson's own
proof that different inputs produce different hashes. Only a genuine
username-and-password match reaches `startActivity`, exactly as
`android-ui-foundations` originally built it, unconditionally — now
conditional on something real.

## What Breaks Without This

Temporarily seed a real test account so there's something real to check
against — add this once, inside `MainActivity.onCreate`, run the app
once, then delete it (account creation for real is next lesson's own
subject, not built yet):

```java
ContentValues values = new ContentValues();
values.put("username", "alice");
values.put("password_hash", "10ef1b051eb9faeb589d9c44463334db3ae84035b431b6fca397c35506b18fc4"); // "correcthorsebattery"
new DatabaseHelper(this).getWritableDatabase().insert("users", null, values);
```

Run the app once with this in place, then remove it. Log in as `alice`
with the password `correcthorsebattery` — real result: navigates to the
grid, exactly as before this lesson existed. Now try `alice` with any
other password — real result: the new `"Incorrect username or
password"` `Toast` appears, and the screen stays put. Now try a
username that was never seeded at all — same real result, rejected at
`moveToFirst()`, before a single hash comparison ever runs. All three
outcomes are real, observed behavior, not merely what the code is
supposed to do.

## Exercises

1. Seed a second test account with a different username and password
   (compute its real hash the same way `HashDemo` did, substituting your
   own chosen password), confirm it logs in correctly, and confirm
   `alice`'s password does *not* also work for it — direct proof
   `checkCredentials` is genuinely checking a specific username's own
   stored hash, not just "does any hash in the table match."
2. Temporarily change `checkCredentials` to compare `typedHash` against
   a hardcoded, wrong literal hash string, and confirm every login
   attempt is rejected, including the correct one — direct proof this
   method's entire real behavior lives in that one comparison, not
   somewhere else.
3. Explain, in your own words, why `storedHash.equals(typedHash)` — not
   `typedHash.equals(storedHash)` — would still behave identically here,
   tying your answer back to what `String.equals` actually compares.

## Definition of Done

- [ ] You ran the `HashDemo` lab yourself and saw the same input produce
      the same hash twice, and a different input produce a visibly
      different one.
- [ ] You can explain, precisely, why a hash comparison is different
      from comparing two passwords directly, and what a leaked
      `password_hash` column does and doesn't expose.
- [ ] You seeded a real test account, logged in correctly, and confirmed
      both a wrong password and a nonexistent username are rejected —
      three real, distinct outcomes, not just the happy path.
- [ ] You can state which of the three outcomes above is rejected at
      `moveToFirst()` versus at the hash comparison, and why that order
      is deliberate.
- [ ] Commit: `git commit -m "Check login credentials against a real
      hashed password in the users table"` — explaining what's now
      actually verified, not just that a method was added.

Next: creating a new account for real — building the row `checkCredentials`
has been reading all along, and the full picture on why passwords are
never stored plain, including the real defense this lesson's minimal
hash doesn't yet provide.

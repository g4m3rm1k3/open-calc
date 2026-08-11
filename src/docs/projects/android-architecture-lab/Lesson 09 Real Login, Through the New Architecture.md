# Lesson 09: Real Login, Through the New Architecture

**What you will build:** `UserEntity`, `UserDao`, `UserRepository`, and
a real, working `LoginViewModel.attemptLogin(...)` — replacing Lesson
02's own placeholder `password.equals("correct-password")` with the
identical real hashing and salting logic `android-persistence-lab`
Lessons 05–06 already built, now running through Room, a background
thread `UserRepository` owns, and a real `LiveData<Boolean>`
`LoginActivity` observes instead of branching on synchronously. The
transferable problem: a real login check is a real database read *and*
a real, deliberately slow cryptographic hash computation — exactly the
kind of work Lesson 04 already proved must never run on the main
thread, and this project's own `LoginViewModel` currently has no real
way to run it anywhere else at all.

**What you need to know first:** `android-persistence-lab` Lessons
05–06 (`MessageDigest`, salting, the real `users` schema — this lesson
reuses that series' own already-verified hashing logic directly, not
re-deriving it). Lessons 03–07 of this series (`ViewModel`, Room,
`LiveData`, `Repository`, `ViewBinding`).

**Terms introduced in this lesson:**
- **`MutableLiveData<T>`** — the real, mutable subclass of `LiveData<T>`
  a class can actually write new values into; plain `LiveData<T>` is
  read-only from the outside, by design.

**Objects and methods used:**

**`MutableLiveData<T>.postValue(T)`**
- *What it is:* the real method that sets a `LiveData`'s value from a
  background thread.
- *Implementation:* real, documented behavior, confirmed this session:
  `setValue(T)` must be called from the main thread; `postValue(T)` is
  the real, safe alternative for a background thread, posting the
  update to run on the main thread shortly after — and, real,
  documented behavior worth knowing directly: calling `postValue`
  several times in quick succession before the main thread actually
  processes the first one dispatches only the *last* value, not every
  intermediate one.
- *Its use:* called once, inside `UserRepository`'s own background
  thread, the moment a real login check finishes.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`MessageDigest` / salting**
  - *What they are:* Java's real cryptographic hashing API, and the
    real per-account random value mixed into a password before hashing.
  - *Implementation:* given full treatment in `android-persistence-lab`
    Lessons 05–06.
  - *Their use:* the exact same real logic, moved into `UserRepository`
    unchanged — this lesson's own real subject is *where* that logic
    now lives and *how* its result reaches the screen, not the hashing
    mechanism itself.

---

## Concept Unit: `UserEntity` and `UserDao`

### The Problem

`android-persistence-lab`'s own `users` table — `id`, `username`,
`password_hash`, `salt` — has no Room-managed equivalent yet in this
project.

### Project Change

- **Reference Source:** Room's own real `@Entity`/`@Dao` contract,
  already quoted in full in Lesson 04.
- **Files affected:** New files `login/UserEntity.java`,
  `login/UserDao.java`; `core/AppDatabase.java` (register the new
  entity and DAO).
- **Change type:** Two new files; one existing file extended.
- **Dependencies:** None new.

### The New Code

`UserEntity.java`:

```java
package com.yourname.inventoryapp.login;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "users")
public class UserEntity {
    @PrimaryKey(autoGenerate = true)
    public long id;

    public String username;
    public String passwordHash;
    public String salt;
}
```

`UserDao.java`:

```java
package com.yourname.inventoryapp.login;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.Query;

@Dao
public interface UserDao {
    @Insert
    long insert(UserEntity user);

    @Query("SELECT * FROM users WHERE username = :username LIMIT 1")
    UserEntity findByUsername(String username);
}
```

`AppDatabase.java`, the real change:

```java
@Database(entities = {ItemEntity.class, UserEntity.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract ItemDao itemDao();
    public abstract UserDao userDao();
    // getInstance(...) unchanged from Lesson 04
}
```

### Mechanical Walkthrough

- `UserEntity` — the identical real shape reasoning as `ItemEntity`
  (Lesson 04): `@PrimaryKey(autoGenerate = true)`, plain `public`
  fields — `passwordHash` and `salt` here specifically named to match
  `android-persistence-lab`'s own real, deliberate column choices
  (never a plain `password` field).
- `@Query("SELECT * FROM users WHERE username = :username LIMIT 1") UserEntity findByUsername(String username);`
  — **first appearance of Room's own named-parameter syntax.** `:username`
  binds directly to the real method parameter of the same name — Room's
  own real, compiler-checked equivalent of
  `android-persistence-lab`'s own hand-written `"username = ?"` plus a
  separate `selectionArgs` array; the same real parameter-binding safety
  against SQL injection, expressed with less ceremony.
- The return type `UserEntity`, not `List<UserEntity>` or
  `LiveData<UserEntity>` — a real, deliberate choice: `LIMIT 1` plus
  `username`'s own real `UNIQUE`-equivalent intent means at most one row
  can ever match; Room hands back that one real row directly, or `null`
  if none exists — this method genuinely blocks until it completes, the
  same real main-thread danger Lesson 04 already proved, addressed
  directly next.
- `entities = {ItemEntity.class, UserEntity.class}` — real, growing list
  (Lesson 04's own `@Database` contract, reappearing) — one real
  `AppDatabase`, two real tables, exactly matching
  `android-persistence-lab`'s own schema shape.

### CS Lens

`findByUsername` returning a single, nullable `UserEntity` rather than
a `List` is a real, deliberate signature choice communicating intent
directly through the type system: a caller reading this method's own
signature already knows, without reading its body, that at most one
result is possible — the same "let the types say what the schema
already guarantees" reasoning `android-persistence-lab` Lesson 05
applied to its own `moveToFirst()`-based single-row check.

### SE Lens

**Why does `UserDao` get its own, separate interface, rather than
adding `findByUsername` onto `ItemDao` alongside the item-related
methods it already has?** `UserDao` and `ItemDao` operate on two
genuinely unrelated real tables, with no method either one needs that
the other would ever call — the exact same package-by-feature reasoning
Lesson 01 already applied to this project's own folder structure,
applied here one level deeper: a `Dao` interface's own real boundary
should match one real table's own real concerns, not be organized by
"every database operation this app happens to need," the same way this
project's own packages are organized by feature, not by technical
layer.

---

## Concept Unit: `UserRepository` — Hashing, Off the Main Thread, Reported Through `LiveData`

### The Problem

The real login check needs three things combined correctly: a real
database read (`findByUsername`, genuinely blocking), a real,
deliberately-not-fast hash computation
(`android-persistence-lab`'s own `MessageDigest`-based logic), and a
real way to report the result back to a `ViewModel` that's currently
sitting on the main thread, waiting.

### Project Change

- **Reference Source:** `MutableLiveData`'s real
  `postValue`/`setValue` contract, already quoted above.
- **Files affected:** New file `login/UserRepository.java`;
  `login/LoginViewModel.java`.
- **Change type:** New file; real change to an existing method.
- **Dependencies:** `UserDao` (above).

### The New Code

`UserRepository.java`:

```java
package com.yourname.inventoryapp.login;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.yourname.inventoryapp.core.AppDatabase;
import java.security.MessageDigest;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class UserRepository {
    private final UserDao userDao;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public UserRepository(Context context) {
        this.userDao = AppDatabase.getInstance(context).userDao();
    }

    public LiveData<Boolean> checkCredentials(String username, String password) {
        MutableLiveData<Boolean> result = new MutableLiveData<>();
        executor.execute(() -> {
            UserEntity user = userDao.findByUsername(username);
            if (user == null) {
                result.postValue(false);
                return;
            }
            String typedHash = hash(password + user.salt);
            result.postValue(typedHash.equals(user.passwordHash));
        });
        return result;
    }

    private static String hash(String input) {
        // identical real logic to android-persistence-lab Lesson 05's own hash(...)
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(input.getBytes());
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 is required on every real JVM/Android runtime", e);
        }
    }
}
```

`LoginViewModel.java`, the real change:

```java
public LiveData<Boolean> attemptLogin(String username, String password) {
    return userRepository.checkCredentials(username, password);
}
```

### Mechanical Walkthrough

- `public LiveData<Boolean> checkCredentials(...)` — **first appearance
  of a `LiveData`-returning Repository method for a one-shot check,
  not a continuous query.** Unlike `ItemRepository.getAllItems()`
  (Lesson 06), which returns a `LiveData` Room itself manages and keeps
  live indefinitely, this `LiveData` is built fresh, by hand, for
  exactly one real answer — real, deliberate: a login attempt has one
  real result, not a continuously-changing stream.
- `MutableLiveData<Boolean> result = new MutableLiveData<>();` — **first
  appearance.** The real, writable subclass this lesson's own Terms
  Introduced named — constructed with no initial value, deliberately:
  nothing should observe a real answer before the real check has
  actually run.
- `executor.execute(() -> {...})` — reappearing (Lesson 06's own
  `ItemRepository`), the real background thread this entire check
  genuinely requires.
- `UserEntity user = userDao.findByUsername(username);` — the real,
  blocking Room call, safe here specifically *because* it's already
  running inside `executor.execute`, not on the main thread.
- `if (user == null) { result.postValue(false); return; }` — reappearing
  real logic (`android-persistence-lab` Lesson 05's own
  `moveToFirst()`-based rejection, expressed here through Room's own
  `null` return instead of a `Cursor` check) — a nonexistent username is
  rejected before any hash is even computed.
- `String typedHash = hash(password + user.salt);` — the identical real
  salting logic `android-persistence-lab` Lesson 06 already proved,
  moved here unchanged.
- `result.postValue(typedHash.equals(user.passwordHash));` — the real,
  final answer, posted from the background thread — `LiveData`'s own
  real, documented main-thread dispatch (this lesson's own quoted
  contract) is what safely delivers it back to whatever's observing.
- `return result;` — the *same* `MutableLiveData` object returned
  immediately, before the background work has necessarily finished —
  real, deliberate Inversion of Control
  (`android-ui-foundations`' own repeatedly-traced principle): the
  caller gets a real, observable placeholder immediately, and the real
  answer arrives later, through the exact same object.
- `LoginViewModel.attemptLogin(...)` — a thin, direct pass-through,
  the identical real boundary reasoning Lesson 06 already established
  for `InventoryViewModel`: `LoginViewModel` still has no idea Room, a
  background thread, or `MessageDigest` are involved at all.

### CS Lens

Returning a `MutableLiveData` immediately and filling in its real value
later, from a background thread, is the same **Future**/**Promise**
shape found across virtually every modern language with real
asynchronous work — a real, concrete placeholder for a value that
doesn't exist *yet*, that can be observed, or awaited, without the
caller blocking to wait for it directly.

### SE Lens

**Why does `UserRepository` build and return its own, fresh
`MutableLiveData` for this specific method, rather than exposing a
real, Room-managed `LiveData` the way `ItemRepository.getAllItems()`
does?** A login attempt is not a continuous stream of changing data —
it's one real question with one real answer, requested once per tap of
"Log In." Room's own `LiveData` support exists specifically for
data that stays *live* — genuinely updating as the underlying table
changes; forcing a one-shot action through that same shape would either
require a query with no real, natural "current state" to track, or
would fire repeatedly for reasons that have nothing to do with a new
login attempt. A hand-built, single-use `MutableLiveData` is the
honest, correctly-scoped tool for a genuinely one-shot, asynchronous
result.

---

## Connect the Pieces

One trace: `LoginActivity`'s login button (next, wiring it) will call
`viewModel.attemptLogin(username, password)`, receiving a real
`LiveData<Boolean>` immediately — before any real work has actually
happened. `LoginViewModel` passes the call straight through to
`UserRepository`, which builds a fresh `MutableLiveData`, dispatches
the real database read and the real, deliberately-slow hash computation
onto a background thread, and posts the real, final answer back once
both finish — the identical real hashing and salting logic
`android-persistence-lab` proved correct, now running safely off the
main thread and reported back through the exact same observable
mechanism this entire series has used since Lesson 05.

## What Breaks Without This

Temporarily call `userDao.findByUsername(username)` directly inside
`LoginViewModel`, on the main thread, with no `executor.execute(...)`
wrapper at all. Real, predicted result, grounded directly in Lesson
04's own already-verified `IllegalStateException` contract (confirm it
yourself on a real device or emulator): the identical real "Cannot
access database on the main thread" crash that lesson already proved,
now triggered by a login attempt instead of a grid load — direct,
concrete evidence that a real login check has exactly the same real
threading obligation as any other database read, with no special
exemption for being "just a check." Restore the `executor.execute(...)`
wrapper before moving on.

## Exercises

1. Add a temporary `Thread.sleep(1000)` inside `UserRepository`'s
   background block, before the hash computation, to make the real,
   asynchronous gap between tapping "Log In" and the real result
   arriving genuinely visible. Confirm the app's own UI stays fully
   responsive during that real delay — direct, observed proof the main
   thread was never blocked, unlike what Lesson 04's own real crash
   would have caused otherwise.
2. Explain, in your own words, why `postValue` — not `setValue` — is
   the only real, safe choice inside `UserRepository`'s own background
   block, tying your answer back to this lesson's own quoted, real
   `MutableLiveData` contract.
3. Seed a real test account (`android-persistence-lab` Lesson 05's own
   established method, adapted to insert through `UserDao.insert`
   instead of raw `ContentValues`) and confirm a real, correct login
   attempt against it produces `true`, end to end, through every layer
   this lesson built.

## Definition of Done

- [ ] `UserEntity`, `UserDao`, and `UserRepository` all exist and
      compile, reusing `android-persistence-lab`'s own real hashing
      and salting logic unchanged.
- [ ] `LoginViewModel.attemptLogin(...)` returns a real
      `LiveData<Boolean>` instead of branching on a hardcoded string.
- [ ] You can explain, precisely, why `checkCredentials` builds its own
      fresh `MutableLiveData` rather than exposing a Room-managed one
      the way `ItemRepository` does.
- [ ] You triggered the real main-thread crash from a deliberately
      unwrapped `findByUsername` call, and restored the correct,
      threaded version.
- [ ] Commit: `git commit -m "Wire real login through UserEntity, Room,
      and a background-threaded UserRepository"` — explaining what's
      now real and safely threaded, not just that a fake check was
      replaced.

Next: `Context` done right — `AndroidViewModel`, and why
`UserRepository`/`ItemRepository` accepting a plain `Context` in their
constructors, as built so far, is a real, deliberate simplification
this series named honestly and now fixes for real.

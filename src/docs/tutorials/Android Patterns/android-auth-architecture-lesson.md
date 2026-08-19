# Filling the Gaps — Context, Session State, Repository, Single-Activity Auth

This picks up exactly where the framework mental-model document stopped. That
document covered *components* (Activity, Service, etc.), the three
interaction *shapes*, and the lifecycle. Everything here is one level up:
architectural choices you make *on top of* that framework — none of it is
Android-mandated, all of it is either extremely common convention or genuinely
your own decision. The goal, same as before: read someone else's `Repository`
or single-Activity auth screen cold, and know what you're looking at.

## Context — the object you've been passing around without a name for it

Every `findViewById`, every `new DBHelper(this)`, every `Toast.makeText(this,
...)` — that `this` is a `Context`. Worth actually naming what it is, because
it shows up constantly and gets misused constantly.

**What it actually is:** an abstract class representing "the environment this
piece of code is running in" — access to resources (`R.string.foo`), the
ability to start an Activity, access to system services (`getSystemService`),
access to app-wide info like the package name. Almost nothing in Android works
without one somewhere in the call chain.

**There is not one Context — there are many, and which one you hold matters:**

- **Activity context** — one exists per Activity instance, destroyed when the
  Activity is (see Situation 2 in the first doc: rotation destroys it).
  Carries extra capability an Application context doesn't have — it can
  correctly host a `Dialog` or inflate a themed layout, because it knows
  which specific screen it belongs to.
- **Application context** — exactly one per process, lives as long as the
  process does (see the `Application` section of the first doc). Retrieved
  with `getApplicationContext()`.

**Why the distinction is a real bug source, not pedantry:** if a long-lived
object (a singleton, a `Repository` that outlives any one screen) holds onto
an *Activity* context, that Context — and everything the Activity references,
its whole View tree — can't be garbage-collected even after the Activity is
destroyed, because something still holds a reference to it. This is called a
**memory leak**, and it's the single most common reason Android tutorials say
"pass the Application context here, not `this`" without explaining why. The
rule that falls out of it: **short-lived object (an Activity, a Dialog) →
Activity context is fine. Long-lived object (anything that might survive past
one screen) → Application context, always.**

Your `DBHelper(this)` from inside an Activity is fine — a `DBHelper` you
construct fresh each time and don't hold onto beyond the Activity's life. If
you ever make `UsersRepository` itself hold a `Context` as a field
(constructed once, reused across screens), that field should be an
Application context, not whichever Activity happened to construct it first.

## SharedPreferences — the small-flat-data sibling of SQLite

Your first document covers `SQLiteOpenHelper` for structured, multi-row data
— a table of users, a table of notes. But "is someone currently logged in,
and who" isn't a table of rows — it's a handful of flat, small values:
`isLoggedIn: true`, `currentUsername: "alex"`. Modeling that as a
one-row-table works but is the wrong tool. Android's actual answer for this
shape of data is a different class entirely:

```java
SharedPreferences prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE);

// Writing — note the .edit() / .apply() shape. This is Shape 3 (Builder)
// from the first doc: nothing is actually written to disk until you call
// a terminal method.
prefs.edit()
     .putBoolean("isLoggedIn", true)
     .putString("currentUsername", username)
     .apply(); // writes asynchronously; commit() is the synchronous version

// Reading — no builder needed, just ask directly. Second argument is the
// default returned if the key was never set.
boolean loggedIn = prefs.getBoolean("isLoggedIn", false);
String username = prefs.getString("currentUsername", null);
```

**Why this matters for your project specifically:** this is almost certainly
how you'll implement "stay logged in" / "check on app open whether to show
login screen or go straight to the main screen." `SQLiteOpenHelper` answers
*"does this username/password combination exist"* — a one-time check.
`SharedPreferences` answers *"is a session currently active, and for whom"* —
a fact that needs to persist and be checked every time the app opens, before
any database query even happens.

The trace: app opens → `MainActivity.onCreate` (or a dedicated splash/launcher
Activity) reads `prefs.getBoolean("isLoggedIn", false)` → if true, skip
straight past login, go to the main screen; if false, show login. Logging out
is just `prefs.edit().putBoolean("isLoggedIn", false).apply()`.

## The Repository pattern — a plain object with a job description, not a framework class

Nowhere in the first document, deliberately — it isn't part of the Android
SDK at all. It's a *convention*, popularized by Google's own architecture
guidance, for organizing your own "always yours" code, not a class Android
constructs or calls back into.

**The job it does:** sit between your Activity (which should only care about
*displaying* things and reacting to taps) and your actual data source (a
`SQLiteOpenHelper`, or later, a network API), so the Activity never touches
`SQLiteDatabase`, `Cursor`, or raw SQL directly.

```java
public class UsersRepository {
    private final DBHelper dbHelper;

    public UsersRepository(Context context) {
        // Application context here — see the Context section above.
        // A Repository is exactly the "long-lived object" case.
        this.dbHelper = new DBHelper(context.getApplicationContext());
    }

    public boolean registerUser(String username, String password) {
        return dbHelper.registerUser(username, password); // delegates down
    }

    public boolean login(String username, String password) {
        return dbHelper.checkLogin(username, password);
    }
}
```

**Why bother, if it just delegates?** Two real reasons, not ceremony:

1. **Your Activity's job stops being "know how SQL works."** If you ever swap
   local SQLite for a network call (or add one alongside it — check local
   cache, fall back to network), the Activity's code doesn't change at all —
   only what's inside `UsersRepository`'s methods changes. The Activity
   already only knows "ask the repository," not "ask the database."
2. **One object, one source of truth for "how do I get/change user data."**
   Without it, it's easy to end up with three different Activities each
   constructing their own `DBHelper` and duplicating query logic. With it,
   there's exactly one place that logic lives.

This is the same **mechanism vs. policy** split from the first document, one
layer up: `DBHelper`/SQLite is Android's mechanism for storage. Your
`UsersRepository` is *your app's* policy for what "a user" even means and how
to check one — genuinely yours, no framework involvement at all, which is
exactly why it was never going to show up in a document about the Android
framework itself.

## Single Activity, toggled modes — a different, equally real navigation pattern

The first document's whole worked trace is two Activities and an `Intent`.
Your login/signup screen — one Activity, buttons hidden/shown, fields
swapped — is a different, deliberate pattern with its own real mechanics.
Naming it removes the "feels hacky" sensation.

**The core idea: the Activity holds a piece of state describing which mode
it's in, and one method reads that state and updates what's visible.**

```java
public class AuthActivity extends AppCompatActivity {

    private boolean isLoginMode = true; // the state — lives as a field,
                                         // same object, same instance,
                                         // the whole time the user is
                                         // toggling back and forth

    private EditText usernameField, passwordField, confirmPasswordField;
    private Button primaryButton;
    private TextView toggleModeText, screenTitle;
    private UsersRepository usersRepository;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        usersRepository = new UsersRepository(this);

        usernameField = findViewById(R.id.usernameField);
        passwordField = findViewById(R.id.passwordField);
        confirmPasswordField = findViewById(R.id.confirmPasswordField);
        primaryButton = findViewById(R.id.primaryButton);
        toggleModeText = findViewById(R.id.toggleModeText);
        screenTitle = findViewById(R.id.screenTitle);

        primaryButton.setOnClickListener(v -> handlePrimaryAction());
        toggleModeText.setOnClickListener(v -> {
            isLoginMode = !isLoginMode; // flip the state
            updateUI();                 // then repaint based on it
        });

        updateUI(); // paint the correct initial state on first load too —
                    // easy to forget, and then your screen opens in the
                    // wrong mode until the user taps toggle once
    }

    /** The one method responsible for what's visible. Called any time
     *  isLoginMode changes — never scattered inline in click handlers. */
    private void updateUI() {
        if (isLoginMode) {
            screenTitle.setText("Log In");
            confirmPasswordField.setVisibility(View.GONE);
            primaryButton.setText("Log In");
            toggleModeText.setText("Need an account? Sign up");
        } else {
            screenTitle.setText("Sign Up");
            confirmPasswordField.setVisibility(View.VISIBLE);
            primaryButton.setText("Sign Up");
            toggleModeText.setText("Already have an account? Log in");
        }
    }

    private void handlePrimaryAction() {
        String username = usernameField.getText().toString().trim();
        String password = passwordField.getText().toString();

        if (isLoginMode) {
            if (usersRepository.login(username, password)) {
                onAuthSuccess(username);
            } else {
                Toast.makeText(this, "Invalid credentials", Toast.LENGTH_SHORT).show();
            }
        } else {
            String confirm = confirmPasswordField.getText().toString();
            if (!password.equals(confirm)) {
                Toast.makeText(this, "Passwords don't match", Toast.LENGTH_SHORT).show();
                return;
            }
            if (usersRepository.registerUser(username, password)) {
                onAuthSuccess(username);
            } else {
                Toast.makeText(this, "Username taken", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void onAuthSuccess(String username) {
        getSharedPreferences("app_prefs", MODE_PRIVATE)
            .edit()
            .putBoolean("isLoggedIn", true)
            .putString("currentUsername", username)
            .apply();

        startActivity(new Intent(this, MainActivity.class));
        finish();
    }
}
```

**Why this is a legitimate pattern, not a shortcut:** the first document's
Situation 2 trace showed rotation *destroying and rebuilding* the Activity —
that's the framework doing something to your object. This pattern is the
opposite kind of thing entirely: nothing here is Android calling back into
you on its own schedule. `isLoginMode` is a plain field, `updateUI()` is a
plain method you call yourself, on your own schedule, same as any Java
object's internal state. **The one real risk, and the reason it can feel
fragile:** if you ever set a view's visibility or text directly inside a
click listener instead of going through `updateUI()`, you now have two places
that decide what's on screen, and they will eventually disagree. Funneling
every visual change through one method that reads the one state field is what
prevents that — not a style preference, the actual mechanism that keeps it
correct.

**Contrast with the first document's `savedInstanceState` handling:** if the
user rotates the phone while on the signup half of this screen, `isLoginMode`
is a plain field — it resets to `true` on rebuild exactly like `currentNote`
did in the original trace's Situation 2, unless you explicitly save and
restore it:

```java
@Override
protected void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putBoolean("isLoginMode", isLoginMode);
}

// in onCreate, after the fields above are assigned:
if (savedInstanceState != null) {
    isLoginMode = savedInstanceState.getBoolean("isLoginMode", true);
}
updateUI();
```

Same exact mechanism as the original document's `currentNote` — this isn't a
new concept, it's the old one applied to a new field.

## Runtime permissions for SMS, walked in full

The first document names the ask/granted/denied shape but doesn't walk it.
Here's the real, complete version, using the modern `ActivityResultLauncher`
API (the same family `editLauncher` used in the first document's trace —
same Shape 2 registration, different contract type):

```java
private final ActivityResultLauncher<String> smsPermissionLauncher =
    registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
        if (granted) {
            sendVerificationText();
        } else {
            Toast.makeText(this, "SMS permission is required for this feature", Toast.LENGTH_SHORT).show();
        }
    });

private void requestSmsPermissionAndSend() {
    if (ContextCompat.checkSelfPermission(this, Manifest.permission.SEND_SMS)
            == PackageManager.PERMISSION_GRANTED) {
        sendVerificationText(); // already granted from a previous run — ask again and Android just re-confirms instantly
    } else {
        smsPermissionLauncher.launch(Manifest.permission.SEND_SMS);
    }
}

private void sendVerificationText() {
    SmsManager.getDefault().sendTextMessage(phoneNumber, null, "Your code is 1234", null, null);
}
```

Same registration-now/invocation-later shape as every other Shape 2 callback:
`smsPermissionLauncher.launch(...)` doesn't return the answer — it hands
control to the system's permission dialog, and the lambda registered above
fires later, whenever the user taps Allow or Deny. Also needs the manifest
declaration: `<uses-permission android:name="android.permission.SEND_SMS" />`
— a *build-time* declaration of intent, separate from the *runtime* check
above, which is why both are required and neither alone is enough.

## Putting it together — the full trace, cold open

1. App launches → some Activity's `onCreate` reads
   `getSharedPreferences(...).getBoolean("isLoggedIn", false)`.
2. **False** → `AuthActivity` opens, `isLoginMode` defaults `true`,
   `updateUI()` paints the login fields.
3. User taps "Need an account? Sign up" → `isLoginMode` flips, `updateUI()`
   repaints the same Activity instance to show the confirm-password field —
   no new Activity, no Intent, nothing destroyed.
4. User fills the form, taps the (now "Sign Up"-labeled) button →
   `handlePrimaryAction()` reads `isLoginMode`, calls
   `usersRepository.registerUser(...)` — which delegates to `DBHelper`,
   which runs the actual `INSERT`.
5. Success → `onAuthSuccess` writes `isLoggedIn = true` to
   `SharedPreferences` and starts `MainActivity` via Intent, `finish()`s
   `AuthActivity`.
6. App closed and reopened later → step 1 now reads **true** — straight to
   `MainActivity`, `AuthActivity` never even constructed.

Every piece in that trace is now named: `Context` (step 4's `this` passed
into the repository), `SharedPreferences` (steps 1 and 5), `Repository`
(step 4), single-Activity state toggling (step 3), and the original
document's Intent/finish navigation (step 5) — all working together, nothing
left as an unexplained black box.

---

## Addendum — closing five specific gaps from the no-code course

Everything below was flagged as missing across your other two documents. Same
tracing style, same rule: tied to your actual project, not generic Android
trivia.

### `onCreate` vs `onUpgrade` — this is your actual "still need to do updates" question

Your `DBHelper.onCreate` — the one with the `CREATE TABLE` SQL — runs
**exactly once per device**: the very first time your app is installed and
opens the database for the first time. Here's the part that's easy to miss:
**it does not run again just because you changed your Java code.**

```
Fresh install (no database file exists yet)
        │
        ▼
   onCreate(db) runs — builds the table from your CREATE TABLE SQL
        │
        ▼
   The file is stamped, internally, with DB_VERSION (you set this to 1)

──────────────────────────────────────────────────────────────

You edit DBHelper.java later — add an "email" column, say —
and bump DB_VERSION from 1 to 2 in your code
        │
        ▼
   A device that ALREADY has the database file from before
   does NOT re-run onCreate. Ever. That table, with the old
   columns, is just sitting there on disk, untouched.
        │
        ▼
   Instead, onUpgrade(db, oldVersion, newVersion) is the ONLY
   method that runs — and only because SQLiteOpenHelper itself
   compares your new DB_VERSION against the number physically
   stamped in that device's existing file, and notices they differ
```

So the concrete fix for your project: if you need to add a column (say,
`email`) to your `users` table, you don't touch `onCreate`'s SQL and hope —
you write it in `onUpgrade`, guarded so it only runs for devices that
actually need it:

```java
@Override
public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
    if (oldVersion < 2) {
        db.execSQL("ALTER TABLE users ADD COLUMN email TEXT");
    }
    // if oldVersion < 3, another block here later, etc. — each guarded
    // independently, because a user might jump straight from 1 to 3
}
```

And you have to bump `DB_VERSION` from `1` to `2` in the constructor call —
that's literally the signal that tells `SQLiteOpenHelper` "something changed,
go check whether this device needs `onUpgrade`." Forget to bump it, and
`onUpgrade` never fires at all, on any device, ever — the version numbers
still match as far as the framework can tell.

**During development, before you have real users:** the honest shortcut is
uninstalling the app from your emulator/device (which deletes the database
file entirely) so the next run is a fresh install and `onCreate` handles it.
That's fine for a school project where nobody's real data is at stake yet —
just know it's a shortcut, not what `onUpgrade` exists for.

### Password salting — the actual threat your SHA-256 hash doesn't stop

Your `DBHelper.hash()` method uses plain `MessageDigest.getInstance("SHA-256")`
— no salt. That's a real, meaningful gap, and here's precisely what it opens
up, not just "you should salt because best practice":

**The problem:** SHA-256 is deterministic — the same password always produces
the exact same hash. If two of your users both pick `"password123"`, their
`password_hash` column values in your `users` table are **byte-for-byte
identical**. Anyone who gets a copy of your database file (or just looks at
it while debugging) can see that instantly, no cracking involved.

**The actual attack:** attackers keep pre-built tables (called **rainbow
tables**) mapping the most common real passwords to their already-computed
SHA-256 hashes. If your stored hash matches an entry in that table, the
original password is recovered by a simple lookup — not by "breaking"
SHA-256 at all.

**The fix, minimal version for your project:**

```java
private String hash(String input, String salt) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] bytes = digest.digest((salt + input).getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) sb.append(String.format("%02x", b));
        return sb.toString();
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}

private String generateSalt() {
    byte[] saltBytes = new byte[16];
    new java.security.SecureRandom().nextBytes(saltBytes);
    StringBuilder sb = new StringBuilder();
    for (byte b : saltBytes) sb.append(String.format("%02x", b));
    return sb.toString();
}
```

The salt is random **per user**, generated once at signup, stored in its own
column right alongside the hash (it doesn't need to be secret — its whole job
is just being *different per account*). At login, you re-read that user's
stored salt, hash `salt + typedPassword` the same way, and compare. Now even
two identical passwords produce completely different stored hashes, and a
precomputed rainbow table has nothing to match against — it was only ever
built for plain, unsalted passwords.

Your `users` table needs one more column: `salt TEXT NOT NULL`. Worth doing
before you have real classmates' passwords sitting in your project's
database, even for a school assignment.

### The `registerForActivityResult` timing rule — you will hit this the moment you wire up SMS

This is a real, specific crash you haven't hit yet only because you haven't
gotten to SMS permissions. The rule: your permission launcher **must** be a
field, initialized at the top of your Activity class — not inside `onCreate`,
and never inside a click listener.

```java
public class AuthActivity extends AppCompatActivity {

    // CORRECT — a field, runs during construction, before onCreate exists
    private final ActivityResultLauncher<String> smsPermissionLauncher =
        registerForActivityResult(new ActivityResultContracts.RequestPermission(), granted -> {
            if (granted) {
                sendVerificationText();
            } else {
                Toast.makeText(this, "SMS permission needed", Toast.LENGTH_SHORT).show();
            }
        });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // WRONG — if you put registerForActivityResult() here instead of
        // as a field, or worse, inside primaryButton.setOnClickListener(),
        // you get: IllegalStateException: LifecycleOwners must call
        // register before they are STARTED
        ...
    }
}
```

**Why it's this strict:** Android's delivery machinery for "launch something,
get an answer back later" has to know about every possible registration
*before* your Activity becomes interactive — it can't retroactively wire up
a pairing that only gets created the moment a button happens to be tapped,
because that moment might be seconds from now or might never happen at all.
So the rule is unconditional: register it as a field, every time, whether or
not the user ever actually triggers it. This is the same "registered now,
fires later" shape as `editButton.setOnClickListener(...)` from your first
document — just with a hard timing requirement a plain click listener doesn't
have.

### `ViewModel` + `Factory` — do you actually need this for your project?

Short, honest answer: **probably not required for a school assignment using
plain `SQLiteOpenHelper` and a single-Activity toggle**, but worth knowing
what it's for, because you'll see it in nearly every real-world codebase and
tutorial from here on.

The problem it solves: your `AuthActivity`'s `isLoginMode` field — and
anything else you load into a plain field — genuinely resets on rotation
unless you manually save/restore it through `onSaveInstanceState`/`Bundle`,
which you already know how to do. `ViewModel` is a *different* mechanism for
the same underlying problem: instead of destroying the data and rebuilding it
from a small saved snapshot, the `ViewModel` object itself **isn't destroyed
at all** — it's held by something above the Activity, and the same object is
handed to whichever Activity instance currently exists.

Where this would matter for you: if `MainActivity` loads a big list of data
from `UsersRepository` and you don't want that list re-fetched from the
database every single time the phone rotates, a `ViewModel` holding that list
survives the rotation intact — no Bundle, no re-query. For a `Bundle`-sized
value like `isLoginMode` (a single boolean), what you already have is the
right-sized tool; reach for `ViewModel` when what you're preserving is
something a `Bundle` was never meant to carry (a loaded list, an open
connection) rather than by default on every screen.

If your course requires it explicitly, say so and I'll wire your
`UsersRepository` into a real `ViewModel` + `Factory` pair against your
actual code — it's a bigger architectural change than the other four items
here, worth doing deliberately rather than bolted on.

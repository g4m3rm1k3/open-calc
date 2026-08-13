# Lesson 05: Asking a Second Time, Out Loud

**What you will build:** a real runtime permission request — Bluetooth
this time, not the accelerometer's quieter, declare-only kind — using
`python-for-android`'s own permissions module. This is the first
lesson in this series where declaring a capability in `buildozer.spec`
is not enough by itself; a real person has to say yes, while the app
is running, through a real system dialog.

**What you need to know first:** Lesson 03 (declaring a permission in
`buildozer.spec` — this lesson's starting point, since one already
exists there for `BODY_SENSORS`). Nothing about Bluetooth itself yet.

**Terms introduced in this lesson:**
- **Dangerous (runtime) permission** — a permission Android requires
  the user to approve at the moment the app actually needs it, with a
  real system dialog the user can deny, as opposed to a normal
  permission (like the accelerometer's) granted automatically at
  install time from the `buildozer.spec` declaration alone.
- **Grant result** — the real, per-permission yes/no answer a runtime
  permission request produces, delivered back to a callback, never
  known at the moment the request is made.

**Objects and methods this lesson uses:**
- **`android.permissions.request_permissions(permissions, callback)`**
  - *What it is:* asks the user, through a real system dialog, to
    grant one or more dangerous permissions at once.
  - *Implementation:* `permissions` is a list of permission-name
    strings; `callback`, if given, is called later — not during this
    call — with two arguments: the list of permissions that were
    asked about, and a matching list of booleans, one per permission,
    in the same order.
  - *Its use:* this lesson's actual request, for Bluetooth's two
    dangerous permissions, below.
- **`android.permissions.check_permission(permission)`**
  - *What it is:* a synchronous, immediate yes/no check of whether a
    permission is already granted, no dialog involved.
  - *Implementation:* takes one permission-name string, returns
    `bool`.
  - *Its use:* checked first, before requesting, so an already-granted
    permission never triggers an unnecessary second dialog.
- **`android.permissions.Permission`**
  - *What it is:* a class holding every real Android permission name
    as a plain string constant.
  - *Implementation:* `Permission.BLUETOOTH_SCAN` and
    `Permission.BLUETOOTH_CONNECT`, both used below, are real strings
    (`"android.permission.BLUETOOTH_SCAN"`, etc.) — the constant exists
    so a typo becomes an import error or an `AttributeError`, not a
    silently wrong string.

---

## Concept Unit: A Request Whose Answer Arrives Later, Not Now

### The Problem

Lesson 03's `BODY_SENSORS` line in `buildozer.spec` was the entire
story — declare it, and it's simply available, granted automatically
at install. Bluetooth's two dangerous permissions,
`BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`, need a second, separate step:
a real, live request while the app is running, whose real answer — yes
or no — doesn't exist yet at the exact moment the request is made. Any
code that assumed an immediate answer would be wrong by construction,
not by bad luck.

### Introduce the Concept in Isolation — Step 1: An Answer That Doesn't Exist Yet

**`android.permissions` only exists inside a real, packaged Android
app** — it isn't installable on a desktop the way `kivy` or `plyer`
are, so this isolation uses a plain, fake stand-in instead, proving
only the *shape* of a request whose answer arrives later:

```python
import threading
import time

def fake_request_permissions(permissions, callback):
    def answer_later():
        time.sleep(1)  # standing in for real, unpredictable user response time
        results = [True for _ in permissions]  # standing in for a real "Allow" tap
        callback(permissions, results)
    threading.Thread(target=answer_later).start()

def on_result(permissions, results):
    print("Answer arrived:", dict(zip(permissions, results)))

print("Requesting...")
fake_request_permissions(["SCAN", "CONNECT"], on_result)
print("This line runs before any answer exists — the request does not wait.")
```

Run it. Expected output, in this exact order — the second line prints
*before* the answer, not after:

```
Requesting...
This line runs before any answer exists — the request does not wait.
Answer arrived: {'SCAN': True, 'CONNECT': True}
```

`fake_request_permissions` returned immediately; the real answer
showed up roughly a second later, through the callback, on its own
schedule — never as this function's own return value. This is the
exact shape `request_permissions`'s real callback has, minus the real
system dialog behind it.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — `python-for-android`'s
`android.permissions` module is confirmed by reading its actual source
(`pythonforandroid/recipes/android/src/android/permissions.py`) this
session.

**Files affected:** `buildozer.spec` (two new permission lines);
`main.py` (a new method, called from `build()`).

**Change type:** add.

**Location:** the Manifest-equivalent permission lines join
`BODY_SENSORS` in `buildozer.spec`; the call to
`request_bluetooth_permissions()` sits in `build()`, before this
lesson's Bluetooth work (Lesson 06 onward) can safely run.

**Dependencies:** none beyond a real Android build — this lesson's
real code cannot run at all on the desktop, unlike every lesson before
it.

```ini
android.permissions = android.permission.BODY_SENSORS,android.permission.BLUETOOTH_SCAN,android.permission.BLUETOOTH_CONNECT
```

```python
from android.permissions import request_permissions, check_permission, Permission  # <- new
from kivy.logger import Logger

# (inside MyApp, called from build(), before any Bluetooth work)

def request_bluetooth_permissions(self):                                  # <- new
    needed = [Permission.BLUETOOTH_SCAN, Permission.BLUETOOTH_CONNECT]     # <- new
    already_granted = all(check_permission(p) for p in needed)             # <- new
    if already_granted:                                                    # <- new
        Logger.info("MyApp: Bluetooth permissions already granted")       # <- new
        self.on_bluetooth_ready()                                          # <- new
    else:                                                                  # <- new
        request_permissions(needed, self.on_permission_result)             # <- new

def on_permission_result(self, permissions, results):                      # <- new
    Logger.info(f"MyApp: permission results {dict(zip(permissions, results))}") # <- new
    if all(results):                                                       # <- new
        self.on_bluetooth_ready()                                          # <- new
    else:                                                                  # <- new
        Logger.info("MyApp: Bluetooth permissions denied")                # <- new

def on_bluetooth_ready(self):                                              # <- new
    Logger.info("MyApp: ready for Bluetooth work")                        # <- new
    # Lesson 06 onward fills this in
```

### Mechanical Walkthrough

- `android.permissions = android.permission.BODY_SENSORS,android.permission.BLUETOOTH_SCAN,android.permission.BLUETOOTH_CONNECT` —
  **reappearing field, two new values.** All three are declared
  together — this line alone is still not enough for the two Bluetooth
  ones, per this lesson's whole point; `BODY_SENSORS` remains the one
  exception that needed nothing further.
- `from android.permissions import request_permissions, check_permission, Permission` —
  **first appearance**, full treatment above.
- `check_permission(p) for p in needed` / `all(...)` — **first
  appearance of `check_permission`**, full treatment above;
  `all(...)` is ordinary Python, already assumed knowledge.
- `Permission.BLUETOOTH_SCAN`, `Permission.BLUETOOTH_CONNECT` — **first
  appearance**, full treatment above.
- `request_permissions(needed, self.on_permission_result)` — **first
  appearance**, full treatment above. `self.on_permission_result` is
  passed as a reference — a bound method, not called here; the same
  "hand over a function, it runs later" shape `Clock.schedule_interval`
  already established in Lesson 02, applied here to a one-time,
  not-repeating callback instead of a repeating one.
- `def on_permission_result(self, permissions, results):` — **first
  appearance of the exact callback shape `request_permissions`
  requires**, full treatment above (Objects and methods, under
  `request_permissions`). Two parameters, in this exact order, always.
- `dict(zip(permissions, results))` — **ordinary Python, already
  assumed knowledge** — used here only to make the logged output
  readable as pairs, not a new concept.
- `all(results)` — **reappearing `all(...)`, applied to a different
  list.** `True` only if every requested permission was granted — one
  denial anywhere in the list makes this `False`.

### Execution Trace

**Same honesty note as this whole project, doubled here:** this
lesson's real code cannot run on the desktop at all — `android.permissions`
does not exist outside a packaged Android app — so every prediction
below rests entirely on `python-for-android`'s own real source and
documented behavior, with no desktop fallback available to sanity-check
first.

1. `build()` calls `request_bluetooth_permissions()`. On a fresh
   install, predict `check_permission` returns `False` for both, so
   `already_granted` is `False`, and `request_permissions` fires the
   real system dialog.
2. This method returns immediately afterward — predict `build()`
   itself finishes and the app's UI is fully responsive well before
   the user has answered anything, the same non-blocking shape every
   scheduled callback in this series has already had.
3. The user taps "Allow" for both. Predict `on_permission_result` runs
   with `results = [True, True]`, `all(results)` is `True`, and
   `on_bluetooth_ready` runs.
4. Reopening the app afterward: predict `check_permission` now returns
   `True` for both on the very first check, so `request_permissions`
   is never called a second time, and `on_bluetooth_ready` runs
   directly from the `already_granted` branch instead.

### CS Lens

**A request whose result is delivered through a callback, not a
return value, is the same asynchronous-completion shape this project
has already built twice** — Lesson 02's scheduled ticks and, more
directly, Step 1's own `fake_request_permissions`. What's different
here isn't the shape, it's that this particular asynchronous
operation can only ever complete *once*, carrying a real, binary,
user-decided outcome — closer in kind to a single network request's
response than to a repeating timer.

### SE Lens

**Why check `check_permission` first, rather than always calling
`request_permissions` unconditionally and letting Android decide
whether a dialog is actually necessary?** Real Android behavior often
still shows a dialog on a redundant request — the check isn't required
for correctness so much as for respecting the user: asking again for
something already granted is a real, avoidable interruption, and the
cost of checking first is one cheap, synchronous, no-dialog call.

---

## Connect the Pieces

`check_permission`, cheap and synchronous, is asked first — only when
it says no does `request_permissions` fire the real, asynchronous
request Step 1 already proved the shape of with nothing but a
`threading.Thread` and a one-second sleep. `on_permission_result`,
never called directly by this project's own code, is where the real,
user-decided answer finally arrives, deciding whether
`on_bluetooth_ready` — Lesson 06's own starting point — ever runs at
all.

## What Breaks Without This

Skip `check_permission` and call `request_permissions` unconditionally
on every single `build()`:

```python
def request_bluetooth_permissions(self):
    request_permissions(                                    # <- no check_permission guard first
        [Permission.BLUETOOTH_SCAN, Permission.BLUETOOTH_CONNECT],
        self.on_permission_result)
```

Grant both permissions once, then close and reopen the app. Predicted
result: the real system dialog appears again, every time the app
starts, even though the user already said yes — not a crash, a real,
repeated interruption a person would reasonably find annoying.
Restore the `check_permission` guard, and confirm for yourself, across
two real app launches, that the dialog only ever appears on the first
one.

## Exercises

1. Deny one of the two permissions on purpose and grant the other.
   Predict, then confirm from real logged output, exactly what
   `results` contains, and confirm `all(results)` correctly comes out
   `False`.
2. Add a real fallback inside the "denied" branch of
   `on_permission_result` — a label or log message explaining, in
   plain language, that Bluetooth features won't work without this
   permission, rather than leaving the app silently unable to proceed.
3. Revoke Bluetooth permissions from Android's own system Settings
   app while this app is closed, then reopen it. Confirm
   `check_permission` catches the revocation on its very next check,
   with no code change of your own.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw a real answer arrive after
      the requesting code had already moved on, through a callback,
      never as a return value.
- [ ] You ran the real Step 2 code on a real Android build and saw the
      actual system permission dialog for Bluetooth appear.
- [ ] You can explain, without looking, why `BODY_SENSORS` needed only
      a `buildozer.spec` line while `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`
      need a real runtime request too.
- [ ] You granted the permissions, relaunched the app, and confirmed
      `check_permission` alone was enough the second time — no dialog
      shown twice.
- [ ] You denied at least one permission on purpose at least once, and
      confirmed the real `results` list reflected exactly which one.
- [ ] Commit: the updated `buildozer.spec` and `main.py`.

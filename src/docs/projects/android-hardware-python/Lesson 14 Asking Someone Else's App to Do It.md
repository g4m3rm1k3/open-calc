# Lesson 14: Asking Someone Else's App to Do It

**What you will build:** a real button that hands control of the
screen entirely over to Android's own Camera app, waits for a real
photo to be taken, and gets notified — through a real callback, not a
blocking call — the moment control returns. The transferable problem:
every hardware access so far has stayed inside this app's own process
— reading a sensor, opening a socket. A camera photo, through Plyer,
works completely differently: this app doesn't touch the camera
hardware directly at all; it launches a *separate* app to do it, and
waits, asynchronously, to be told when that other app is done.

**What you need to know first:** Lesson 05's runtime-permission
pattern, reused here for a different permission. Lesson 11's
`Button`/`.bind(on_press=...)`.

**Terms introduced in this lesson:**
- **Delegating to another app** — instead of accessing hardware
  directly, an app can hand off a whole task to a separate, already
  -installed app better suited to it (here, Android's own Camera app),
  then resume once that other app finishes and hands control back —
  fundamentally different from every hardware access earlier in this
  series, none of which left this app's own process at all.

**Objects and methods this lesson uses:**
- **`plyer.camera`**
  - *What it is:* Plyer's real, actually-implemented camera facade —
    worth naming directly: unlike Plyer's `bluetooth` facade, which
    this series found to be an unfinished stub, `camera` is real and
    complete enough to use as-is, with no need to drop down to Pyjnius
    directly.
  - *Implementation:* built on the exact same `Intent`/Pyjnius
    machinery this series already used directly in Lessons 06–10, but
    fully wrapped this time — this lesson's own code never touches
    `autoclass` or `Intent` itself.
  - *Its use:* `.take_picture(...)`, below, is the one method this
    lesson calls on it.
- **`camera.take_picture(filename, on_complete)`**
  - *What it is:* asks Android's own Camera app to capture a photo and
    save it to a given path.
  - *Implementation:* `filename` is a full file path this app already
    has permission to write to; `on_complete` is called later, once
    the Camera app finishes, with that same filename as its one
    argument. If `on_complete` returns `True`, the file is deleted
    immediately after; any other return value keeps it.
  - *Its use:* this lesson's actual real photo capture.

---

## Concept Unit: A Call That Leaves This App Entirely

### The Problem

Every asynchronous operation in this series so far — a permission
request, a Bluetooth connection — still ran entirely inside this app's
own process, on either the main thread or a background one this
project's own code started. `take_picture` is different in kind: it
launches a real, separate, already-installed app, and this app's own
window disappears from the screen while the user interacts with that
other app instead — a real photo gets taken by code this project
never wrote and doesn't control, and this lesson's own code only finds
out what happened once that other app is finished and Android hands
control back.

### Introduce the Concept in Isolation — Step 1: Proving a Callback Really Arrives After a Real Delay, With a Real File

**No Android build needed** — this proves only the shape of the real
mechanism, standing in for the Camera app itself with a plain
background thread, the same technique Lesson 05's own isolation
already used for a different not-yet-answered request:

```python
import threading
import time
import os


def fake_take_picture(filename, on_complete):
    def finish_later():
        time.sleep(1)  # standing in for the real time a user spends in the Camera app
        with open(filename, "w") as f:
            f.write("pretend photo bytes")
        keep_or_delete = on_complete(filename)
        if keep_or_delete:
            os.remove(filename)
    threading.Thread(target=finish_later).start()


def my_callback(path):
    print("Got file:", path, "exists:", os.path.exists(path))
    return False  # False (or anything but True) means: keep the file


fake_take_picture("/tmp/fake_photo.txt", my_callback)
print("take_picture returned immediately — no photo exists yet")
```

Run it. Expected output, in this exact order:

```
take_picture returned immediately — no photo exists yet
Got file: /tmp/fake_photo.txt exists: True
```

`fake_take_picture` itself returned before the print statement right
after it even ran — proving the real call doesn't block, the same
property every scheduled callback in this series has already shown —
and the real file only exists once the callback actually fires, a
real second later. Returning `False` from the callback, as shown here,
is what keeps the file — proven directly, not merely stated.

**Discard this scratch file.**

### The Real Thing

**Reference Source:** no reference counterpart — Plyer's `camera`
facade is confirmed complete and working by reading its actual source
(`plyer/platforms/android/camera.py` and `plyer/facades/camera.py`)
this session, contrasted directly against `bluetooth`'s stub found
earlier in this series.

**Files affected:** `buildozer.spec` (one new permission); `main.py`
(a new permission-request method, a new button, two new methods).

**Change type:** add.

**Location:** the new button joins the others already added to
`layout` in `build()`; the new methods sit alongside `MyApp`'s
existing permission and Bluetooth methods.

**Dependencies:** Lesson 05's `request_permissions`/`check_permission`/
`Permission` imports, reused for a new permission name; Lesson 11's
`Button`/`.bind`; `App.user_data_dir`, already established in Lesson
13.

```ini
android.permissions = android.permission.BODY_SENSORS,android.permission.BLUETOOTH_SCAN,android.permission.BLUETOOTH_CONNECT,android.permission.CAMERA
```

```python
from plyer import camera                                                   # <- new

# (inside build(), alongside the other buttons already added to layout)

photo_button = Button(text="Take Photo", size_hint_y=None, height=80)      # <- new
photo_button.bind(on_press=self.take_photo)                                # <- new
layout.add_widget(photo_button)                                            # <- new
self.request_camera_permission()                                           # <- new

# (rest of MyApp)

def request_camera_permission(self):                                       # <- new
    if check_permission(Permission.CAMERA):                                # <- new
        Logger.info("MyApp: camera permission already granted")           # <- new
    else:                                                                  # <- new
        request_permissions([Permission.CAMERA], self.on_camera_permission_result) # <- new

def on_camera_permission_result(self, permissions, results):               # <- new
    if all(results):                                                       # <- new
        Logger.info("MyApp: camera permission granted")                   # <- new
    else:                                                                  # <- new
        Logger.info("MyApp: camera permission denied")                    # <- new

def take_photo(self, instance):                                            # <- new
    photo_path = os.path.join(self.user_data_dir, "photo.jpg")            # <- new
    camera.take_picture(filename=photo_path, on_complete=self.on_photo_taken) # <- new

def on_photo_taken(self, filename):                                        # <- new
    exists = os.path.exists(filename)                                     # <- new
    Logger.info(f"MyApp: photo callback — {filename}, exists={exists}")   # <- new
    return False                                                          # <- new
```

### Mechanical Walkthrough

- `android.permission.CAMERA` (added to `buildozer.spec`) —
  **reappearing field, one new value.** `CAMERA` is a dangerous,
  runtime permission on Android, the same category as
  `BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT` — a declaration alone is not
  enough, exactly as Lesson 05 already established.
- `from plyer import camera` — **first appearance**, full treatment
  above (Objects and methods). Note the direct contrast with `from
  plyer import bluetooth`, never used anywhere in this series, because
  that facade turned out not to be real.
- `photo_button = Button(...)` / `.bind(on_press=self.take_photo)` /
  `layout.add_widget(...)` — **entirely reappearing mechanism from
  Lessons 11 and 12**, no new Kivy concept needed to add this fourth
  button.
- `self.request_camera_permission()` (called once, inside `build()`) —
  independent of `self.request_bluetooth_permissions()`, already
  called there — both run, unrelated to each other, the moment the app
  starts.
- `def request_camera_permission(self):` / `on_camera_permission_result` —
  **reappearing exact shape from Lesson 05**, applied to a new
  permission name; nothing about the pattern itself changed.
- `def take_photo(self, instance):` — **reappearing exact callback
  shape from every `.bind(on_press=...)` method so far.**
- `photo_path = os.path.join(self.user_data_dir, "photo.jpg")` —
  **reappearing exact mechanism from Lesson 13**, the same app-private
  storage location, needing no separate storage permission.
- `camera.take_picture(filename=photo_path, on_complete=self.on_photo_taken)`
  — **first appearance**, full treatment above (Objects and methods).
  `self.on_photo_taken` passed as a reference, not called — the same
  "hand the framework a function, it runs later" shape established
  repeatedly since Lesson 02.
- `def on_photo_taken(self, filename):` — **first appearance of the
  exact callback shape `take_picture` requires**, full treatment above.
- `return False` — **first appearance of this specific return value's
  real meaning**, full treatment above (Objects and methods) — keeps
  the real photo file in place, deliberately, since Lesson 15 needs it
  to still exist to display it.

### Execution Trace

**Same honesty note as this whole project:** predicted output,
verified against Plyer's own real, current source, not a captured
run.

1. `build()` runs. Predict `request_camera_permission` fires a real
   system permission dialog on first launch, independently of whatever
   `request_bluetooth_permissions` is doing at the same time.
2. The user taps "Take Photo." Predict this app's own window
   disappears immediately, replaced by Android's real Camera app — the
   same real, felt hand-off this lesson's own Concept Unit named.
3. The user takes a real photo and confirms it. Predict control
   returns to this app, and `on_photo_taken` runs shortly after, with
   the real path to a real, saved `.jpg` file — `exists` logged as
   `True`.
4. The user instead backs out of the Camera app without taking a
   photo. Predict `on_photo_taken` may not run at all in this case, or
   may run with a file that was never actually written — a real,
   honest edge case this lesson's own code does not yet distinguish
   from a successful capture (left as Exercise 2, below).

### CS Lens

**Handing off an entire task to a separate, independently running
program, then resuming once it signals completion, is a real, general
pattern recognized well beyond mobile apps** — a shell script calling
out to another program and waiting for its exit code, a build tool
invoking a separate linter process and continuing once it reports
back, an OS's own "open with" dialog handing a file to whichever
application the user picks. The shared shape every time: the calling
program doesn't need to know *how* the other program does its job,
only that it will eventually signal back, and what shape that signal
takes.

### SE Lens

**Why does this lesson need no `threading.Thread` at all, unlike
Lessons 09 and 10's Bluetooth sockets?** `socket.connect()` and
`.accept()` are genuinely blocking calls — the *waiting itself*
happens inside this project's own process, which is exactly why it had
to be moved off the main thread. `take_picture` is different: the real
waiting happens inside Android's own Camera app, an entirely separate
process — this app's own code returns immediately either way, with
nothing of its own left blocking. The lesson worth carrying forward:
"asynchronous" and "needs a background thread" are related but not the
same thing — a callback-based API can be fully asynchronous while
still returning instantly, with no thread of this project's own
involved at all.

---

## Connect the Pieces

Step 1's own fake, threaded stand-in proved the exact shape
`take_picture`'s real callback follows — return immediately, deliver
the real result later, through a function handed over rather than
returned. Lesson 05's permission-request pattern needed no new ideas
at all to cover a second, unrelated dangerous permission. Lesson 13's
`user_data_dir` is, once again, where the real result actually lives —
this lesson's own photo, sitting right where Lesson 15 will next go
looking for it.

## What Breaks Without This

Try to read the photo file immediately after calling `take_picture`,
with no callback at all:

```python
def take_photo(self, instance):
    photo_path = os.path.join(self.user_data_dir, "photo.jpg")
    camera.take_picture(filename=photo_path, on_complete=self.on_photo_taken)
    Logger.info(f"MyApp: exists right after calling take_picture — {os.path.exists(photo_path)}") # <- wrong: checked too early
```

Predicted result: this log line runs immediately, before the user has
even seen the Camera app open — predict it logs `False`, every single
time, since the real photo doesn't exist yet at that exact moment, no
matter how fast the phone or how quickly the user acts. Remove this
extra line, and trust `on_photo_taken` — the real callback, arriving
whenever the real photo actually exists — as this lesson's own
Concept Unit already established is the only correct place to check.

## Exercises

1. Log `photo_button.disabled` state changes — disable the button
   inside `take_photo` and re-enable it inside `on_photo_taken` — so a
   user can't accidentally launch the Camera app a second time while
   one capture is still in progress.
2. Distinguish a real cancelled capture from a successful one: check
   `os.path.exists(filename)` inside `on_photo_taken` itself, and log a
   different, honest message for the case where the user backed out of
   the Camera app without taking a photo at all.
3. Change `on_photo_taken`'s return value to `True` instead of
   `False`, take a real photo, and confirm — by checking
   `user_data_dir` directly afterward — that the file really was
   deleted immediately after the callback ran.

## Definition of Done

- [ ] You ran Step 1's scratch file and saw the real "returned
      immediately" line print before the real, delayed callback line.
- [ ] You ran the real Step 2 code on a real Android build, tapped
      "Take Photo," and watched this app's own window hand off to
      Android's real Camera app.
- [ ] You confirmed, via real `logcat` output, that `on_photo_taken`
      ran with a real, existing file path once you returned to this
      app.
- [ ] You can explain, without looking, why this lesson needed no
      background thread even though it's genuinely asynchronous.
- [ ] You tried Exercise 3 and confirmed, firsthand, that returning
      `True` really does delete the real file.
- [ ] Commit: the updated `buildozer.spec` and `main.py`.

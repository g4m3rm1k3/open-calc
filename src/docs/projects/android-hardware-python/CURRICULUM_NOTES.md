# Curriculum Notes — Android Hardware Python

Working notes for whoever writes the next lesson next (human or AI).
Not part of the lesson sequence itself.

## What this series is

The Python/Kivy counterpart to `../android-hardware-lab/` (Java) —
sensors, Bluetooth, camera — using **Plyer** for hardware access where
its facade is actually implemented, and **Pyjnius** (which Plyer
itself is built on) directly, wherever Plyer's own facade falls short.

**One series, not two.** Kivy fundamentals (the `App` class, widgets,
`Clock.schedule_interval`, the app lifecycle, the build/deploy
toolchain, threading) are taught **just in time, inline, in the same
numbered sequence** as the hardware content — never deferred to a
separate "finish this first" prerequisite course. Confirmed directly
by the user after an initial wrong split into two folders
(`android-python` + `android-hardware-python`): "nothing is later,
it's in order of need, and just in time as needed." Each Kivy concept
earns its place in the sequence by being required for whatever
hardware lesson comes right after it.

**Self-contained relative to the Java lab** — no prerequisite on
`android-hardware-lab`, no cross-references to it, re-teaches
hardware-access concepts from scratch in Python/Kivy idiom, per the
already-established language-track rules. **This has been violated and
fixed twice already** — see "Recurring failure mode" below. Grep the
series directory for `sibling|java series|java lab|equivalent Java`
before considering any batch of lessons finished.

## Status

- **Lessons 01–04 (done):** Kivy foundations. 01: minimal app,
  `build()`/`Label`, desktop-first then Buildozer. 02:
  `Clock.schedule_interval`/`schedule_once`, a self-updating label with
  fake data. 03: real accelerometer via Plyer (pull-based —
  `enable()`/`.acceleration`, polled by `Clock`, same mechanism as 02).
  04: `on_pause`/`on_resume` lifecycle, turning the accelerometer off
  when not visible.
- **Lesson 05 (done):** real runtime permissions
  (`BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`) via
  `android.permissions.request_permissions`/`check_permission`. Ends at
  a placeholder `on_bluetooth_ready()`, deliberately left for Lesson 06
  to fill in.
- **Critical finding, this session: Plyer's own `bluetooth` facade is
  an unfinished stub** (`plyer/platforms/android/bluetooth.py` —
  literally only `info`/`get_info()`, source comment: `# todo: will be
  extended to allow bluetooth connections etc.`). **Every Bluetooth
  lesson from 06 onward bypasses Plyer entirely and uses Pyjnius
  directly** against Android's real `android.bluetooth.*` classes. This
  is the single most consequential fact for anyone continuing this
  series — don't reach for Plyer's `bluetooth` import, it does nothing
  useful.
- **Lessons 06–13 (done): the full Bluetooth arc, Pyjnius-based.**
  - 06: `BluetoothAdapter.getDefaultAdapter()`, `isEnabled()`,
    `ACTION_REQUEST_ENABLE` via `startActivity` (fire-and-forget —
    Pyjnius can't easily capture a real `onActivityResult`, named
    honestly as a gap).
  - 07: closes that gap with a `Clock`-based poll of `isEnabled()`,
    then `getBondedDevices().toArray()` (paired devices, cheap, no
    scan).
  - 08: live discovery via `startDiscovery()` +
    `python-for-android`'s own `android.broadcast.BroadcastReceiver`
    wrapper (real source read directly from the p4a repo this
    session), listening for `BluetoothDevice.ACTION_FOUND` passed as
    its full dotted string (the wrapper's short-name expansion only
    checks `android.content.Intent`'s own constants, which doesn't
    include `ACTION_FOUND`).
  - 09: client `BluetoothSocket` via
    `createRfcommSocketToServiceRecord` + the standard SPP UUID
    (`00001101-0000-1000-8000-00805F9B34FB`), on a `threading.Thread`
    (first real thread in this series — `connect()` blocks).
  - 10: server side — `listenUsingRfcommWithServiceRecord` +
    `.accept()`, also threaded; `on_pause` calls
    `server_socket.close()`, which is the real, documented way to
    unblock a thread stuck in `accept()`.
  - 11: first multi-widget screen (`BoxLayout`/`TextInput`/`Button`/
    `.bind(on_press=...)`); `BluetoothAdapter.setName`/`getName` (real
    device rename, requires `BLUETOOTH_CONNECT`, already granted).
  - 12: a real device-picker list (`ScrollView` + dynamically-built
    buttons) — replaces the hardcoded `devices[0]` from Lesson 09.
    Core teaching point is the classic Python late-binding closure bug
    in a loop building callbacks (`lambda instance, device=device:
    ...`), proven first in pure Python with no Kivy at all.
  - 13: real file transfer over the same socket. Deliberately
    base64-encodes the file's real bytes rather than doing a raw
    `InputStream.read(byte[])` loop — that path has known, real
    partial-read subtleties and some reported pyjnius rough edges with
    binary data that weren't fully verifiable this session; base64
    reuses the already-proven `readLine()` text path instead, named
    honestly as a real size-cost trade in the lesson's own SE Lens.
- **Lessons 14–16 (done): the camera arc.** Unlike `bluetooth`,
  Plyer's `camera` facade turned out to be **real and complete**
  (confirmed by reading both `plyer/facades/camera.py` and
  `plyer/platforms/android/camera.py` in full) — it delegates to
  Android's own Camera app via `Intent`/`startActivityForResult`,
  wrapped entirely inside Plyer, so these lessons never touch
  `autoclass`/`Intent` directly the way the Bluetooth arc had to.
  - 14: `camera.take_picture(filename, on_complete)` — real runtime
    `CAMERA` permission (reusing Lesson 05's exact pattern), photo
    saved to `user_data_dir` (no storage permission needed). Core
    teaching point: this is asynchronous but needs no
    `threading.Thread` at all, unlike Lessons 09/10's sockets — the
    real waiting happens inside a *separate app* (Android's Camera
    app), not inside this process.
  - 15: displaying the photo with `kivy.uix.image.Image`, and a real,
    verified Kivy gotcha — `Image.source` reassigned to the *same*
    path (every photo saves to `photo.jpg`) doesn't trigger a redraw,
    because Kivy properties only fire on genuine value changes;
    `.reload()` is the real, documented fix. Proven in isolation with
    a bare `StringProperty`/`EventDispatcher`, no `Image` or real
    image file needed.
  - 16: `camera.take_video`, deliberately taught as "recognize this
    reuses Lesson 14's shape almost entirely" rather than re-proving
    the async pattern; `kivy.uix.video.Video`'s `state` property
    (`"play"`/`"pause"`/`"stop"`) is the one genuinely new piece.
    **Left explicitly unresolved:** whether `Video` needs the same
    kind of forced-refresh Lesson 15 found for `Image` when a second
    video overwrites the same path — no confirmed evidence either way
    this session; named as an open question with an exercise pointing
    the user at a real, physical test, rather than guessing.
- **Camera arc intentionally stops here**, matching the real current
  depth of `android-hardware-lab`'s own camera coverage (basic
  capture, not live `CameraX` preview/zoom/flash/front-back switching)
  — not an arbitrary cutoff, a scope match.
- **Known possible future refinement, not done, not urgent:** Lesson
  06's Bluetooth "enable" flow uses a fire-and-forget `startActivity`
  because capturing a real `onActivityResult` via Pyjnius seemed to
  need a custom `PythonActivity` subclass. Reading Plyer's own camera
  source this session showed `python-for-android` actually exposes
  `android.activity.bind(on_activity_result=callback)` as a real,
  working hook (Plyer's own camera facade uses exactly this). Lesson
  06 could in principle be revisited to capture the real enable/deny
  result directly instead of polling `isEnabled()` the way Lesson 07
  does now. Not done this session — the polling approach is verified
  and works, and per this project's own lesson-freeze rule, an
  already-written, already-covered lesson shouldn't be retroactively
  rewritten without being asked.
- **Camera arc's own next open step, if picked up later:** the same
  live-preview/`CameraX`-equivalent depth `android-hardware-lab` has
  also not yet reached. Plyer offers nothing for a live preview
  feed — that would require Pyjnius against `android.hardware.camera2`
  directly, a real, substantial jump in difficulty from anything in
  this arc so far.

## Verified facts, this session (don't re-derive from memory)

- Plyer's sensor APIs are **pull/poll-based** (`enable()`, then read a
  property like `.acceleration` on demand) — confirmed by reading
  Plyer's actual `accelerometer.py` facade source.
- Plyer's `bluetooth` facade is a **stub**, confirmed by reading its
  actual source — see Status above. Don't assume any other
  not-yet-used Plyer facade is complete without the same check.
- `buildozer.spec` needs `requirements = python3,kivy,plyer` at
  minimum once Plyer is used; `android.permissions` is a
  comma-separated list of full `android.permission.*` strings.
- Pyjnius basics, all confirmed against real docs/source this session:
  `autoclass(name)` loads a real Java class; `cast(name, instance)`
  re-types a reference when the bridge's own inference isn't enough
  (needed for `PythonActivity.mActivity` → `Activity`, and for
  `Intent.getParcelableExtra(...)`'s generic return); `OutputStream.write(bytes)`
  accepts a plain Python `bytes` object directly (auto-converted to
  `byte[]` — confirmed via pyjnius' own `jnius_conversion.pxi`).
  `PythonActivity` is `org.kivy.android.PythonActivity` (the modern
  SDL2 bootstrap) — not the older `org.renpy.android.PythonActivity`.
- `python-for-android`'s `android.broadcast.BroadcastReceiver` wrapper
  (real source read directly): constructor is
  `BroadcastReceiver(callback, actions=None, categories=None)`,
  callback signature is `(context, intent)`; short action names only
  expand against `android.content.Intent`'s own `ACTION_*` constants —
  anything defined elsewhere (like `BluetoothDevice.ACTION_FOUND`)
  must be passed as its full dotted string.
- `python-for-android`/Buildozer: Linux/macOS native, Windows needs
  WSL — matches what was already confirmed for the user's own Mac
  build environment.

## The same verification-limitation note as android-hardware-lab

No real desktop Python/Kivy environment, phone, or working Buildozer
toolchain is available in-session. Execution traces are explicitly
labeled predictions, verified against real, current official
documentation (and, for Pyjnius/p4a specifics, real source code) fetched
that session, with a Definition-of-Done item asking the user to
actually run each step and correct the file if reality differs.

## Reminders carried over from android-hardware-lab

- Don't reintroduce "Raspberry Pi" as a target — the goal is the
  phone itself, and (for any PC-bridge work later) Windows is the
  user's actual daily-driver machine.
- Check new files against every already-established structural rule
  for this project (language separation, no cross-series references,
  no unverified claims, no deferred-to-later prerequisite structure)
  before adding them — not just against whatever specific request
  motivated writing them.

## Recurring failure mode: cross-series references slipping into prose

Caught and fixed **three separate times** now:
1. A Python bridge script briefly got numbered as a lesson inside the
   Java-only `android-hardware-lab` sequence.
2. This series briefly got split into two folders with a "finish one
   first" gate.
3. Lessons 01, 03, 05, and 06 of *this* series each had prose like
   "the same way this project's Java sibling series had to handle it"
   — written despite the self-contained rule already being active for
   this exact series. Self-caught this session by grepping the whole
   directory, not caught while writing each lesson individually.

**Mitigation for next time:** after writing a batch of lessons in one
sitting, grep the series directory for `sibling|java series|java lab|
equivalent Java` before calling the batch done. Don't trust that
writing each lesson "carefully" in the moment is sufficient — it
wasn't, three times.

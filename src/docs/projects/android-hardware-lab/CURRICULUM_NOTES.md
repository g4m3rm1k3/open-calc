# Curriculum Notes — Android Hardware Lab

Working notes for whoever writes the next lesson next (human or AI).
Not part of the lesson sequence itself.

## The actual goal, clarified (2026-08-13)

Early on this was misread as "connect the phone to an actual Raspberry
Pi." Corrected directly by the user: **the phone itself is meant to be
used *like* a Raspberry Pi** — a general-purpose computer with
sensors/connectivity already built in and already set up, which a
literal Pi is not. There is no physical Raspberry Pi in this plan.
The user's actual daily-driver machine is **Windows**; a Mac is used
only as the development machine for building the Python/Kivy APK
later (Buildozer's build-environment requirement, not a target
device). Don't reintroduce "Raspberry Pi" as a real target anywhere in
this series.

## Language tracks

Java is the primary track (this folder), teaching hardware access —
system services, `Context`, listeners, sensors, Bluetooth, camera —
starting from zero.

**Python is its own separate series** (working name
`android-hardware-lab-python`), not mixed into this folder — the
toolchains don't overlap at all (Kivy/Buildozer/`buildozer.spec`/
`main.py` vs. Android Studio/Gradle/`MainActivity.java`/
`AndroidManifest.xml`). Self-contained, not a sequel — no hard
prerequisite on this Java series, no "this answers Lesson N of the
Java track" cross-references, even though it covers the same topics
in roughly the same order. Confirmed stack: **Kivy + Buildozer**
builds the APK; **Plyer** is the hardware-access library (confirmed
facades for accelerometer, bluetooth, camera, gps, gyroscope, light,
proximity, and more); **Pyjnius** (which Plyer is built on) is the
fallback for anything Plyer's facade doesn't expose deeply enough.
Build machine is the Mac (Buildozer supports Linux/macOS natively;
Windows needs WSL) — not yet started.

**Kotlin was considered, then dropped** (2026-08-13) — just Java and
Python. Don't resurrect Kotlin work unless asked again.

## Bluetooth arc — Lessons 7–14, done, genuinely usable

Not a demo — this actually works end to end:

- 07 permission (`BLUETOOTH_SCAN`/`BLUETOOTH_CONNECT`, the Android
  12+ runtime model), 08 adapter + enable, 09 discovery
  (`BroadcastReceiver`, the `RECEIVER_EXPORTED` requirement), 10
  client socket connect (first use of `Thread`, since `connect()`
  blocks), 11 server socket/`accept()` (closes the "who calls whom"
  gap partially), 12 device naming + this series' first interactive UI
  (`EditText`/`Button`), 13 a real tappable device-picker list
  (programmatic `Button`s, `for`-each lambda-capture correctness
  proven) — replaces the auto-connect guesswork with a real user
  choice.
- **14 — real file transfer**, replacing the hardcoded
  `"Hello from Android"` text with length-prefixed (`DataOutputStream.writeLong`/
  `DataInputStream.readLong`) chunked file I/O. This is what makes
  "send files" real instead of "send a sentence." **This is the last
  numbered lesson of the Java Bluetooth arc.**
- Still-open, honestly-stated gap: the device-picker list (13) only
  shows *paired* devices, not discovered-but-unpaired ones.
- User's named use cases to keep in mind: a low-data multiplayer game
  over this same socket, and file transfer to a PC — both explicit
  asks, both should stay demonstrably working, not just described.

**PC bridge is a companion file, not a numbered Java lesson** —
`Bridge — A Python Server on Windows (Companion, Not a Numbered
Lesson).md`. A standalone Python script (`bridge_server.py`,
**PyBluez2**, `pip install PyBluez2`) that runs on a **Windows PC**
and receives Lesson 14's framed file. **This was originally written
and numbered as "Lesson 15" directly inside this Java sequence — a
real mistake, caught when the user asked "how did python get in the
java lab?"** Corrected by renaming the file, removing the lesson
number, and adding an explicit note inside it explaining it's a
companion piece. The lesson: check every new file against
already-established structural rules (like "Python is its own series,
not mixed in") before adding it, not just against the immediate ask
that motivated it.

Confirmed technically for the bridge: Python's *built-in* `socket`
module's Bluetooth support does not reliably cover Windows
(mixed/unclear signals from research — did not trust it), so PyBluez2
(explicitly, consistently documented as Windows-supported via native
sockets) was used instead. The one real cross-language gotcha it had
to solve: Java's `DataOutputStream.writeLong` is big-endian; Python's
`struct.pack` needs `">q"` explicitly to match — verified carefully
rather than guessed, since sources disagreed. Confirmed technically
real but not yet built: the PC could equally be the *client*
connecting to the phone's Lesson 11 server socket instead of the
reverse — a natural exercise/extension, not a gap.

## Camera arc — started 2026-08-13, in progress

User wants camera covered comprehensively ("all of them" — preview,
photo capture, front/back switching, flash, zoom, video). Using
**CameraX** (Google's current recommended library), not the older
Camera2 or deprecated Camera APIs.

- **15 (done — originally drafted as "14," briefly renumbered to "16,"
  now settled at 15 once the PC bridge was pulled out of the numbered
  sequence entirely; renumbered twice, not rewritten):** camera
  permission + `PackageManager.hasSystemFeature(FEATURE_CAMERA_ANY)`,
  extending Lesson 07's two-gate pattern to three (hardware existence
  is its own independent gate here, unlike Bluetooth).
- Next: live preview — `ProcessCameraProvider` (async,
  `ListenableFuture` — new async pattern), `PreviewView`,
  `bindToLifecycle()`. Worth a big callback to Lesson 05:
  `bindToLifecycle()` does *automatically* what Lesson 05 taught by
  hand via `onResume`/`onPause`.
- Then: taking a photo (`ImageCapture`, `takePicture()`, a real saved
  file), front/back switching (`CameraSelector`), then flash/zoom/video.
- **New for this arc:** first lesson in this project that needs a real
  Gradle dependency added (`build.gradle`, CameraX artifacts) — a new
  "file touched for the first time" moment, same significance as the
  Manifest in Lesson 07.

Any further sensors beyond Lessons 1–6 (only light + accelerometer so
far) are still open too, whenever the Java track gets back to them.

## A real limitation to keep flagging

No Android device, emulator, or Windows/Mac machine is available
in-session to actually run any of this code. Every execution trace in
this series is written as an explicitly labeled *prediction* (verified
against real, current documentation fetched that session — never
trusted from training memory alone, and re-checked when sources
disagreed, per the PC-bridge byte-order research), with a
Definition-of-Done item asking the user to run it for real and correct
the file if the actual values differ. Never claim "real output from
doing this just now" without having actually run it.

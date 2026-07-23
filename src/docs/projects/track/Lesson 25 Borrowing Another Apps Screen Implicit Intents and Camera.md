# Lesson 25: Borrowing Another App's Screen — Implicit Intents and the Camera

**What you will build:** A working "Take Photo" button on
`ItemDetailFragment` — gated behind Lesson 24's permission handling —
that launches the device's real Camera app, saves the photo, and
attaches it to the item. The transferable problem: every `Intent` this
project has built since Lesson 4 has named an exact target class
(`InventoryActivity.class`, `ItemDetailActivity.class`). Writing an
actual camera interface — a live preview, a shutter button, focus and
exposure controls — is a huge amount of work this app has no business
duplicating when a perfectly good Camera app is already on the device.
An **implicit Intent** asks the OS to find *any* app that can satisfy a
described action, without naming one — letting this project borrow an
entire, professionally-built screen it never had to write.

**What you need to know first:** Lesson 4 (`Intent`, `startActivity` —
this lesson's implicit form is a direct variation), Lesson 10
(`ActivityResultLauncher`, another built-in contract), Lesson 24
(camera permission granted, checked, and handled).

---

## Concept Unit: Implicit Intents — Describing an Action, Not a Class

### The Problem

Every `Intent` built so far used the two-argument constructor
`new Intent(this, SomeActivity.class)` — an **explicit** Intent,
naming a specific class this app itself compiled against. That
approach cannot possibly work for "open the camera": this project has
no camera Activity of its own, and has no compile-time knowledge of
which camera app, if any, a given device even has installed.

### Introduce the Concept in Isolation

A different, single-argument `Intent` constructor, paired with a
standard **action string**, describes *what should happen* without
naming who does it:

```java
Intent dialIntent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:5555555555"));
if (dialIntent.resolveActivity(requireContext().getPackageManager()) != null) {
    startActivity(dialIntent);
}
```

Temporarily wire this to any existing button (for instance,
`ItemDetailFragment`'s title `TextView`'s click listener, reused
briefly from Lesson 22's throwaway dialog test). Run it, tap the title:
the device's real Dialer app opens, pre-filled with the number —
`ACTION_DIAL` specifically opens the dialer without placing a call, safe
to try. No app on this project's device had to be named — the OS found
one capable of handling `ACTION_DIAL` and launched it.

### Discard the Throwaway Example

Remove the temporary click listener and this block — the real feature,
using `ACTION_IMAGE_CAPTURE` through a purpose-built contract, is built
next.

### Mechanical Walkthrough

- `new Intent(Intent.ACTION_DIAL, Uri.parse("tel:5555555555"))` —
  **first appearance of the single-action-plus-data constructor.**
  `Intent.ACTION_DIAL` is a `String` constant the whole Android
  platform agrees on — any app can declare, in its own Manifest, that
  it can handle this action, and any app can *request* it without
  knowing which one will respond. `Uri.parse("tel:5555555555")` —
  **first appearance of `Uri`** — a structured way to represent "what
  data this action concerns," here a phone-number URI.
- `dialIntent.resolveActivity(requireContext().getPackageManager())` —
  **first appearance.** Asks the OS, *before* actually launching,
  whether **any** installed app can handle this Intent — returns
  `null` if none can. Checking this first avoids Lesson 4's
  `ActivityNotFoundException` crash for implicit Intents specifically,
  where — unlike an explicit Intent targeting your own app's Manifest-
  declared Activity — there's a real, ordinary chance nothing on a
  given device can respond at all (no dialer app installed, on some
  device categories).
- `startActivity(dialIntent)` — reappearing, Lesson 4, same call, a
  fundamentally different kind of `Intent` underneath.

### CS Lens

This is the same **message passing to a dispatcher, not a named
receiver** idea from Lesson 4's CS Lens, generalized one step further:
Lesson 4's explicit `Intent` named a specific receiver within a known
set (this app's own Activities); an implicit `Intent` doesn't even
know the set of possible receivers in advance — the OS performs true
**dynamic dispatch across process/app boundaries**, resolved at
request time based on every installed app's own declared capabilities.

### SE Lens

**Why would any app's own screens (Lesson 4's explicit Intents) ever
need this at all, if implicit Intents can reach anything?** Implicit
resolution costs real specificity: you cannot know at compile time (or
sometimes even guarantee at runtime) *which* app will respond, or
exactly what its UI or behavior will be — completely wrong for
navigating within your own well-defined app, where you need a specific,
predictable screen. It's the right tool specifically at the boundary
where your app deliberately wants "whatever the user has chosen to
handle this," trading control for reuse — exactly the tradeoff this
lesson's camera feature makes on purpose.

---

## Concept Unit: `FileProvider` — Sharing a File Location Safely

### The Problem

The Camera app needs somewhere to actually write the captured photo.
Handing it a raw file path directly is specifically blocked by modern
Android as a security measure (a bare `file://` URI shared across app
boundaries can expose your app's private storage to another app in
ways the OS can't control) — a **content URI**, brokered through a
`FileProvider`, is the sanctioned replacement.

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }` (if not already present
— recent AppCompat versions often already transitively include it):

```gradle
implementation 'androidx.core:core:1.12.0'
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `res/xml/file_paths.xml`;
  `AndroidManifest.xml`.
- **Change type:** Create, configure.

### The New Code

```xml
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-files-path name="photos" path="Pictures" />
</paths>
```

```xml
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="com.yourname.pocketinventory.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>
```

### The Updated Project

`file_paths.xml` is a new resource file, a new type
(`res/xml/`) alongside `res/layout/`, `res/menu/`, and
`res/navigation/`. The `<provider>` block is added inside
`AndroidManifest.xml`'s `<application>` tag, as a sibling to the
`<activity>` entry from Lesson 19.

### Mechanical Walkthrough

- `<paths>` / `<external-files-path name="photos" path="Pictures" />`
  — **first appearance.** Declares which specific folder(s) this
  `FileProvider` is willing to expose, and under what public alias
  (`name="photos"`) — a deliberate allowlist, not blanket access to
  this app's entire storage.
- `<provider android:name="androidx.core.content.FileProvider" ...>` —
  **first appearance of a `<provider>` Manifest entry** — a fourth kind
  of app component, alongside `<activity>` (Lesson 2), and two more
  (`<service>`, `<receiver>`) arriving in Lessons 26–27. A
  `ContentProvider` (Lesson 29 covers the general concept in full;
  `FileProvider` is a ready-made, specific one) exposes structured
  access to data across app boundaries under OS-mediated permission
  control.
- `android:authorities="com.yourname.pocketinventory.fileprovider"` —
  **first appearance.** A globally-unique identifier (same reversed-
  domain convention as the package name itself, Lesson 1) other apps
  use to address this specific provider.
- `android:exported="false"` — reappearing (Lesson 4/8's Manifest
  entries), same meaning: not directly reachable by other apps'
  arbitrary requests.
- `android:grantUriPermissions="true"` — **first appearance.** Allows
  this app to grant *temporary*, request-scoped access to a specific
  URI to another app (the Camera app, momentarily, to write the photo)
  without exporting the whole provider permanently — the actual
  mechanism this lesson's photo capture relies on.
- `<meta-data android:name="android.support.FILE_PROVIDER_PATHS" android:resource="@xml/file_paths" />`
  — **first appearance.** Points the provider at the allowlist file
  built above.

### CS Lens

Brokering access through a narrow, explicitly-scoped intermediary
instead of exposing a raw resource directly is the **Proxy/Gateway
pattern** — the same shape as an API gateway sitting in front of
internal services, only forwarding specifically allowed requests rather
than exposing the internal service directly to the outside world.

---

## Concept Unit: `TakePicture` — the Camera Capture Contract

### The Problem

With permission handled (Lesson 24) and a safe place to write the
photo (the `FileProvider` above), the actual capture flow can be built.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `ItemDetailFragment.java`.
- **Change type:** Add.
- **Dependencies:** `cameraPermissionLauncher` (Lesson 24), the
  `FileProvider` above.

### The New Code

```java
private Uri pendingPhotoUri;

private final ActivityResultLauncher<Uri> takePictureLauncher =
        registerForActivityResult(new ActivityResultContracts.TakePicture(), success -> {
    if (success) {
        item.setPhotoUri(pendingPhotoUri.toString());
        viewModel.updateItem(item);
        photoImageView.setImageURI(pendingPhotoUri);
    }
});
```

```java
private void launchCamera() {
    java.io.File photoFile = new java.io.File(
            requireContext().getExternalFilesDir("Pictures"),
            "item_" + item.getId() + "_" + System.currentTimeMillis() + ".jpg");
    pendingPhotoUri = FileProvider.getUriForFile(
            requireContext(), "com.yourname.pocketinventory.fileprovider", photoFile);
    takePictureLauncher.launch(pendingPhotoUri);
}
```

And, gating the whole thing behind Lesson 24's permission check inside
`takePhotoButton`'s existing click listener:

```java
takePhotoButton.setOnClickListener(v -> {
    boolean hasCameraPermission = ContextCompat.checkSelfPermission(
            requireContext(), Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED;
    if (hasCameraPermission) {
        launchCamera();
    } else if (shouldShowRequestPermissionRationale(Manifest.permission.CAMERA)) {
        showRationaleDialog();
    } else {
        cameraPermissionLauncher.launch(Manifest.permission.CAMERA);
    }
});
```

### The Updated Project

`ItemDetailFragment`'s existing "Take Photo" click listener from
Lesson 24 gains its one previously-stubbed branch:
`Toast.makeText(..., "Already have camera permission", ...)` is
replaced with a real call to `launchCamera()` — every other branch
(rationale, fresh request) is unchanged from Lesson 24.

### Mechanical Walkthrough

- `private Uri pendingPhotoUri;` — reappearing (field, `Uri` type from
  this lesson's first unit), holding the destination the Camera app
  will write into, needed by the launcher's own callback later.
- `ActivityResultLauncher<Uri>` / `new ActivityResultContracts.TakePicture()`
  — reappearing shape (Lesson 10/24), a third contract from the same
  family: this one takes a `Uri` (where to save) as input and returns a
  `boolean` (whether the user actually completed the capture, as
  opposed to cancelling).
- `success -> { if (success) { ... } }` — reappearing callback pattern;
  a cancelled capture (the user backs out of the Camera app) correctly
  does nothing.
- `item.setPhotoUri(pendingPhotoUri.toString())` — calls a new setter,
  added to `Item` next, storing the URI as a plain `String` (Room
  cannot store a `Uri` object directly without a custom type
  converter, out of scope here — a `String` round-trips cleanly through
  `Uri.parse(...)` whenever needed).
- `viewModel.updateItem(item)` — reappearing shape (Lesson 13's
  exercise, Lesson 17's delegation pattern), persisting the change.
- `photoImageView.setImageURI(pendingPhotoUri)` — **first appearance.**
  Loads and displays an image directly from a `Uri` into an `ImageView`
  — a new view type and method, the actual visible payoff.
- `new java.io.File(requireContext().getExternalFilesDir("Pictures"), "item_" + item.getId() + "_" + System.currentTimeMillis() + ".jpg")`
  — **first appearance of `java.io.File`** in this project, and
  `getExternalFilesDir("Pictures")` — **first appearance** — an
  app-specific, no-extra-permission-required storage area, matching
  the `<external-files-path>` alias declared in `file_paths.xml`
  above. `System.currentTimeMillis()` — **first appearance** — a
  simple way to keep every generated filename unique.
- `FileProvider.getUriForFile(requireContext(), "com.yourname.pocketinventory.fileprovider", photoFile)`
  — **first appearance.** Converts the raw `File` path into the safe,
  brokered `content://` URI the Camera app is actually allowed to
  write into — the direct payoff of the `FileProvider` Manifest
  configuration from the previous unit.
- `takePictureLauncher.launch(pendingPhotoUri)` — reappearing
  (`.launch(...)`, Lesson 10/24), this contract's specific input type.

### Project Change — `Item` Gains a Photo Field

- **Reference Source:** No reference counterpart.
- **Files affected:** `Item.java`, `AppDatabase.java`.
- **Change type:** Add.

### The New Code

```java
@Nullable
private String photoUri;

public String getPhotoUri() {
    return photoUri;
}

public void setPhotoUri(String photoUri) {
    this.photoUri = photoUri;
}
```

In `AppDatabase`, bump the schema version and accept destructive
migration for this development-stage change:

```java
@Database(entities = {Item.class}, version = 2)
```

```java
instance = Room.databaseBuilder(context.getApplicationContext(),
        AppDatabase.class, "pocket_inventory.db")
        .fallbackToDestructiveMigration()
        .build();
```

### The Updated Project

`Item` gains a fourth, nullable field (every existing item created
before this lesson simply has `photoUri == null` after this migration,
correctly read as "no photo yet"). `AppDatabase`'s version increments
from `1` (Lesson 13) to `2`, and `.fallbackToDestructiveMigration()` is
added to the builder chain — worth being direct about what this means.

### Mechanical Walkthrough

- `@Nullable private String photoUri;` — reappearing (`@Nullable`,
  Lesson 6; field declaration), new detail: the *first* genuinely
  optional field on `Item` — every prior field was required at
  construction.
- `getPhotoUri()` / `setPhotoUri(String photoUri)` — reappearing
  (getter/setter pattern, Lesson 7).
- `version = 2` — reappearing (Lesson 13's `@Database` annotation),
  incremented — Room requires this whenever the entity's shape changes,
  the same version-bump idea `SQLiteOpenHelper`'s `onUpgrade` (Lesson
  12) responded to.
- `.fallbackToDestructiveMigration()` — **first appearance.** Tells
  Room "if you can't find a proper migration path for this version
  bump, just drop and recreate every table" — every existing row is
  **lost**. Acceptable, explicitly, only because this project's
  development database has no real user data to protect yet; a
  shipped app with real users would need a genuine `Migration` object
  (out of scope here) preserving existing rows while adding the new
  column — the exact same honest tradeoff Lesson 12's throwaway
  `onUpgrade` already flagged for raw SQLite, now met again at the
  Room layer.

### Run It

Run the app, open an item, tap "Take Photo" (grant permission if not
already granted from Lesson 24's testing). The real device/emulator
Camera app opens. Take a photo, confirm it: control returns to Pocket
Inventory, and the captured image appears in `photoImageView`. Close
and reopen the app — the photo persists, loaded from the saved
`photoUri` string, proving it survived process death exactly like every
other `Item` field since Lesson 13.

### CS Lens

Handing control to another app's Activity, then receiving control (and
a result) back, is the same **inversion of control across a process
boundary** already met in narrower form with `startActivityForResult`/
the Activity Result API (Lesson 10) — this lesson is the first time
that "other Activity" isn't even part of this project's own compiled
code.

### SE Lens

**Why launch the device's own Camera app instead of building a custom
in-app camera UI using Android's `Camera2`/`CameraX` APIs directly?**
A custom camera screen would give this project full control over UI and
capture behavior, at a real cost: camera hardware APIs are notoriously
complex, vary meaningfully across manufacturers, and represent a
significant, ongoing maintenance surface entirely unrelated to
inventory management. Borrowing the system Camera app via an implicit
Intent trades that control away for an enormous amount of free,
already-polished, already-tested functionality — the correct choice
for a feature that's genuinely secondary to this app's actual purpose,
and the same "not every capability belongs inside your own app" lesson
Lesson 29's `ContentProvider` unit revisits from the data side.

---

## Connect the Pieces

Full trace: tapping "Take Photo" runs Lesson 24's full permission
gauntlet unchanged → once granted, `launchCamera()` builds a real
`File` inside this app's own external-files directory, converts it to
a safe `content://` `Uri` via the `FileProvider` this lesson configured
in the Manifest → `takePictureLauncher.launch(pendingPhotoUri)` hands
that `Uri`, wrapped in an implicit `ACTION_IMAGE_CAPTURE` Intent
`TakePicture`'s contract builds internally, to whatever Camera app the
OS resolves — this project never named one → the Camera app writes the
photo directly into the granted `Uri`, using exactly the same
"describe an action, don't call directly" indirection this lesson's
`ACTION_DIAL` lab demonstrated → control returns via the Activity
Result callback (Lesson 10's mechanism, a third contract type now) →
`item.setPhotoUri(...)` and `viewModel.updateItem(item)` persist the
result through the same Room/Repository/ViewModel chain every other
field has used since Lesson 13/17.

## What Breaks Without This

Temporarily remove the `<provider>` block from the Manifest entirely,
leaving the Java code intact. Tap "Take Photo": the Camera app either
fails to open or crashes when attempting to write to the now-
unauthorized URI (the exact failure mode `FileProvider`'s
`grantUriPermissions` exists to prevent), often surfacing as a
`SecurityException` in Logcat naming the `content://` URI Android
refused to grant access to. Restore the `<provider>` block afterward.

## Exercises

1. Add a small thumbnail `ImageView` to each row in
   `list_item_inventory.xml`, and in `onBindViewHolder`, call
   `holder.thumbnailImageView.setImageURI(Uri.parse(item.getPhotoUri()))`
   only when `item.getPhotoUri() != null`, otherwise show a placeholder
   drawable — your first real conditional view-content decision inside
   `onBindViewHolder`.
2. Investigate (documentation, not required to implement) a real Room
   `Migration` object that would add the `photoUri` column without
   destroying existing rows, and write down, in your own words, why
   `fallbackToDestructiveMigration()` is an acceptable choice during
   this project's development but would be a serious, user-data-
   destroying bug in a real shipped update.

## Definition of Done

- [ ] Tapping "Take Photo," after granting permission, opens the real
      device Camera app and successfully attaches a photo to the item.
- [ ] The saved photo survives closing and reopening the app.
- [ ] You ran the `ACTION_DIAL` lab and can explain, in your own words,
      the difference between an explicit and an implicit `Intent`.
- [ ] You removed the `FileProvider` Manifest entry on purpose, saw
      the real security failure, and restored it.
- [ ] Commit: message explaining why (e.g. "Add photo capture via an
      implicit ACTION_IMAGE_CAPTURE Intent and a FileProvider-brokered
      Uri, borrowing the system Camera app instead of building one").

Lesson 26 is next: this project has never done meaningful work while
the app is closed or backgrounded — `Service` versus `WorkManager`, and
a real periodic low-stock check that runs even when nobody has Pocket
Inventory open.

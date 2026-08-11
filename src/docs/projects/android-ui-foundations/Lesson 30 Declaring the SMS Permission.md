# Lesson 30: Declaring the SMS Permission

**What you will build:** The Manifest additions SMS messaging requires —
declaring the telephony hardware feature and the `SEND_SMS` permission —
plus a genuine understanding of *why* Android splits permission handling
into two separate layers (a static declaration here, a runtime request
next lesson) instead of one. The transferable problem: not every
capability an app wants is equally risky, and Android's permission model
draws a real, load-bearing line between capabilities the OS grants
automatically at install time and ones sensitive enough to require asking
the user directly, at the moment they're needed.

**What you need to know first:** Lesson 07 (the Manifest, `<activity>`
declarations — the same file, a different kind of entry).

**Terms introduced in this lesson:**
- **`<uses-permission>`** — a Manifest declaration listing a capability
  the app wants; for **normal** permissions, this alone is sufficient;
  for **dangerous** permissions, it's necessary but not sufficient.
- **`<uses-feature>`** — a Manifest declaration describing hardware or
  software the app uses, separate from permissions, affecting which
  devices can even install the app.
- **Normal vs. dangerous permission** — Android's own two-tier
  classification: normal permissions (low risk — network access, for
  instance) are granted automatically at install time; dangerous
  permissions (real risk to privacy or the user's account/money — SMS,
  location, contacts) additionally require an explicit runtime prompt
  the user can accept or refuse.

**Objects and methods used**
- `AndroidManifest.xml` — the file, read by the OS before any app code
  runs, declaring which classes are real launchable components,
  Lesson 07 — reappears here exactly as already taught, now holding a
  different kind of entry. `<uses-permission>`/`<uses-feature>` and the
  normal/dangerous split are this lesson's own subject, given full
  treatment above.

---

## Concept Unit: Normal vs. Dangerous Permissions

### The Problem

Sending an SMS on the user's behalf — potentially costing them money, and
capable of being abused to send spam or premium-rate messages without
their knowledge — is a meaningfully different kind of risk than, say, an
app checking whether the device has network connectivity. Android
doesn't treat every permission identically.

### The Two-Tier Model

Every permission an Android app can request falls into one of two
protection levels: **normal**, for capabilities posing minimal risk to
the user's privacy or the operation of other apps (checking network
state, setting an alarm), granted automatically the moment the app is
installed, with the Manifest declaration alone being the entire
requirement; and **dangerous**, for capabilities that could genuinely
affect the user's privacy, their data, or their money if misused (reading
contacts, accessing location, and — this project's case — sending SMS
messages). A dangerous permission's Manifest declaration is necessary but
explicitly **not sufficient**: the app must also ask the user directly,
at runtime, and the user can refuse — the entire subject of Lesson 31.

`SEND_SMS` is classified dangerous specifically because of the direct
financial and privacy risk: an app quietly sending premium-rate texts or
messages to a user's entire contact list without their knowledge is a
real, historical category of malware, not a hypothetical concern.

### Mechanical Walkthrough

- **Normal permission** — declared once, in the Manifest, via
  `<uses-permission>`; the OS grants it automatically at install time,
  with no further code required to actually use the capability.
- **Dangerous permission** — the identical `<uses-permission>`
  declaration is still required (necessary), but is not, on its own,
  enough (not sufficient) — the app must additionally request it at
  runtime (Lesson 31), and the user can refuse even after the app asks.
- The classification itself (which specific permissions count as
  "normal" versus "dangerous") is decided by the Android platform, not
  by the app declaring them — an app cannot opt a dangerous permission
  down into requiring only the install-time declaration.

### SE Lens

Why not just require every permission to go through a runtime prompt,
for consistency, rather than splitting them into two tiers? Prompting
for genuinely low-risk capabilities (checking network state, for
instance) would train users to reflexively tap "Allow" on every prompt
without reading any of them — the exact failure mode that makes runtime
prompts meaningless as a real consent mechanism. Reserving the runtime
prompt specifically for capabilities with real privacy, safety, or
financial consequence keeps it meaningful precisely because it's rare.

### CS Lens

A two-tier permission model, where low-risk capabilities are granted
automatically and high-risk ones require explicit, in-the-moment user
consent, is an instance of **risk-based access control** — rather than
treating every capability identically (either "everything requires
approval," which trains users to click through prompts without reading
them, or "nothing requires approval," which removes user consent
entirely), the system reserves friction specifically for the cases where
it matters.

Also recognized in: iOS's nearly identical permission model (also
splitting "just works" capabilities from ones requiring an explicit user
prompt), web browsers requiring explicit permission for camera/microphone
access but not for reading a page's own text, and financial systems
requiring extra authentication specifically for high-value transactions
rather than every transaction equally.

---

## Concept Unit: The Manifest Declarations

### The Problem

Before any runtime prompt can even be shown (next lesson), the Manifest
must declare both the permission itself and the hardware capability it
depends on.

### Project Change

- **Reference Source:** No external framework signature to cite — these
  are Manifest configuration entries, not Java/Kotlin API; their exact
  required tag names and attributes are specified directly by Android's
  own Manifest schema, referenced by name below.
- **Files affected:** `AndroidManifest.xml`.
- **Change type:** Add two new top-level declarations.
- **Location:** Both `<uses-permission>` and `<uses-feature>` are
  siblings of `<application>`, not children of it — added directly
  inside the root `<manifest>` element, above where `<application>`
  begins.
- **Dependencies:** None new.

### The New Code

```xml
<uses-permission android:name="android.permission.SEND_SMS" />

<uses-feature
    android:name="android.hardware.telephony"
    android:required="false" />
```

### The Updated Project

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.SEND_SMS" />

    <uses-feature
        android:name="android.hardware.telephony"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.YourApp">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".InventoryActivity"
            android:exported="false" />

    </application>
</manifest>
```

### Mechanical Walkthrough

- `<uses-permission android:name="android.permission.SEND_SMS" />` —
  **first appearance.** Declares the app wants the `SEND_SMS`
  capability — a dangerous permission, per the classification above.
  This line alone does **not** grant the app the ability to send SMS
  messages; it only makes the capability *requestable* at all, and is a
  precondition Lesson 31's runtime request depends on — omit this line
  entirely, and the runtime request Lesson 31 builds fails immediately,
  regardless of what the user taps.
- `<uses-feature android:name="android.hardware.telephony" android:required="false" />`
  — **first appearance.** Declares that the app uses telephony hardware —
  separate from the *permission* to send a message; this is about
  whether the underlying hardware capability exists on the device at
  all. `android:required="false"` is a deliberate, real decision, not a
  default left unconsidered: `required="true"` would prevent the app
  from being installable at all on devices without telephony hardware
  (Wi-Fi-only tablets, for instance) — appropriate only if SMS is
  absolutely central to the app's function. `required="false"` declares
  "this app benefits from telephony but can still function without it,"
  which matches this project's own scope honestly: the app's other
  screens (login, inventory grid) work regardless of whether SMS is
  ever available, and this project's own design goal is for the rest of
  the app to keep working normally even when SMS access is denied or
  absent.

### SE Lens

**Why does Android require a separate `<uses-feature>` declaration at
all, when the app already knows it wants `SEND_SMS`?** Permission and
hardware capability are genuinely independent facts: a device could have
telephony hardware but the user could deny the permission, or a device
could lack telephony hardware entirely (many tablets), making the
permission irrelevant regardless of what's declared. Keeping these as two
separate declarations lets the Play Store's own device-compatibility
filtering use `<uses-feature>` specifically to decide which devices even
see the app as installable, independently of the runtime permission
question Lesson 31 handles — conflating the two into one declaration
would remove that independent, install-time filtering capability
entirely.

---

## Connect the Pieces

One trace: `<uses-permission android:name="android.permission.SEND_SMS" />`
is the *declaration* half of a two-part requirement — necessary, but,
because `SEND_SMS` is dangerous rather than normal, not sufficient on its
own. `<uses-feature android:required="false">` separately tells the
Play Store and the OS "this app uses telephony hardware if present, but
remains installable and functional without it" — matching the
requirement that denying or lacking SMS access must not break the rest
of the app. Neither line, by itself, shows a single permission dialog to
the user — that's Lesson 31's entire subject.

## What Breaks Without This

Remove the `<uses-permission>` line entirely (leave `<uses-feature>` in
place) and, once Lesson 31's runtime request code exists, attempt to run
it. Real result: the runtime permission request Lesson 31 builds fails
immediately — Android will not even show a permission dialog for a
permission the Manifest never declared wanting in the first place; some
API paths throw `SecurityException` directly if an actual send is
attempted without the underlying declaration present. This is worth
proving for yourself once Lesson 31's code exists, rather than taking the
claim on faith now — noted here so you remember to circle back and test
it.

## Exercises

1. Change `android:required="false"` to `android:required="true"` and,
   using Android Studio's device manager, compare which virtual devices
   the app can and cannot be installed to before and after the change —
   direct, observed proof of what this attribute actually controls,
   rather than trusting the written explanation alone.
2. Look up one other dangerous permission (`ACCESS_FINE_LOCATION` or
   `READ_CONTACTS`) in Android's own permissions reference and confirm
   it's classified dangerous for the same kind of reason `SEND_SMS` is —
   a real, concrete risk to the user's privacy, money, or data if misused.

## Definition of Done

- [ ] You can state, precisely, the difference between a normal and a
      dangerous permission, and which one `SEND_SMS` is.
- [ ] You can explain why `<uses-feature>` and `<uses-permission>` are
      two separate declarations rather than one.
- [ ] You can state, concretely, why this project set
      `android:required="false"` rather than `"true"`.
- [ ] Both declarations are present in `AndroidManifest.xml`, and the app
      still builds and runs unchanged (no visible difference yet — this
      lesson is purely declarative).
- [ ] Commit: `git commit -m "Declare SEND_SMS permission and optional
      telephony feature in the Manifest"` — explaining the
      required="false" decision, not just that two lines were added.

Next: actually requesting `SEND_SMS` from the user at runtime — the part
a Manifest declaration alone can never do for a dangerous permission.

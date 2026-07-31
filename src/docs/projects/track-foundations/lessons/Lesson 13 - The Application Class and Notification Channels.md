# Lesson 13: The Application Class and Notification Channels

**What you will build:** Both units read real Android component contracts
directly — nothing here compiles with plain `javac`, since both concepts
require the real Android framework to mean anything.

**What you need to know first:** Lesson 10's `Activity`, Lesson 11's
`Android Manifest`.

**Terms introduced in this lesson:**

- **`Application`** — a class representing the whole running process, not
  one screen or component — exactly one instance exists for the app's
  entire lifetime, created before any Activity.
- **Notification channel** — a declared category of notification,
  created once, that every individual notification must reference,
  letting the user control categories of notifications individually
  without the app building its own preference UI.

---

## Concept Unit: `Application` — One Instance for the Whole Process

### The Problem

An `Activity`, from Lesson 10, represents one screen, created and
destroyed repeatedly as the user navigates. Some setup work genuinely
needs to happen exactly once, before any screen opens, and stay valid for
the entire time the app's process is alive — no single Activity is
correctly positioned to own that, since any one of them might not be the
first to run, and all of them come and go independently.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real, verified component shape,
read directly. `Application`'s real, partial declared contract:

```java
public class Application extends ContextWrapper {
    public void onCreate() {
        // called exactly once, before any Activity, Service, or
        // BroadcastReceiver in this app is created
    }
}
```

A concrete subclass, as an application developer would write it:

```java
public class MyApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        // one-time, whole-process setup goes here
    }
}
```

Declared in the Manifest:

```xml
<application android:name=".MyApp" android:label="My App">
</application>
```

This is `Application` — **first appearance**: a class representing the
whole running process, not one screen or component — exactly one instance
exists for the app's entire lifetime, created before any Activity.
`android:name=".MyApp"` tells Android to construct this specific
subclass, instead of a plain default `Application`, as the very first
object built when the process starts.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract and Manifest shape.

### Mechanical Walkthrough

1. `public class Application extends ContextWrapper { ... }` — **(b)
   reappearing** inheritance shape from Lesson 05, applied to a real
   Android base class representing the whole process rather than one
   screen.
2. `public void onCreate()` — **(a) first appearance** of `Application`'s
   own lifecycle hook: unlike `Activity`'s six-step lifecycle (Lesson
   10), `Application` has essentially one meaningful moment — creation —
   since it's never individually paused, stopped, or resumed the way a
   screen is; it simply exists for as long as the process does.
3. `public class MyApp extends Application { @Override public void
   onCreate() { super.onCreate(); ... } }` — **(b) reappearing**
   overriding, `@Override`, and `super` from Lessons 05, 08, and 10,
   applied here to the process-level base class instead of a
   screen-level one.
4. `android:name=".MyApp"` inside `<application>` — **(a) first
   appearance** of this specific attribute: without it, Android
   constructs a plain, default `Application` instance automatically;
   with it, Android constructs `MyApp` instead, running its overridden
   `onCreate()`.

### CS Lens

`Application` is the same inversion-of-control shape from Lesson 10,
applied at the broadest possible scope: the Android OS decides when the
process itself starts and constructs exactly one `Application` instance,
calling its `onCreate()` before constructing anything else — the same
"framework calls you, not the reverse" idea, now governing the entire
process's own startup rather than one screen's.

Also recognized in: a web server's own application-startup hook (run
once, before any individual request is handled), a desktop app's
`Main`/`Program` entry point in frameworks that still hand control to a
larger runtime, any "singleton root object" a platform constructs first.

### SE Lens

The alternative — putting process-wide setup in whichever Activity
happens to be first opened — was not chosen because "whichever Activity
happens to be first" is not reliable: a different Activity could
legitimately be the entry point depending on how the app was launched
(from the icon, from a notification, from another app), and duplicating
setup logic across every possible entry point invites exactly the kind of
drift Lesson 01 already showed doesn't scale. `Application.onCreate()` is
guaranteed to run exactly once, before anything else, regardless of which
Activity ends up opening first.

---

## Concept Unit: Notification Channels — A Declared Category, Created Once

### The Problem

Posting a notification without any prior setup would leave the user with
no way to control categories of notifications individually — muting "new
message" alerts while keeping "urgent alarm" alerts, for instance.
Android requires a real, upfront declaration of each category before any
notification in it can be shown at all, and that declaration needs to
happen exactly once, in exactly one reliable place.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real, verified code, read directly,
placed inside `MyApp.onCreate()` from the previous unit:

```java
NotificationChannel channel = new NotificationChannel(
    "reminders",
    "Reminders",
    NotificationManager.IMPORTANCE_DEFAULT
);

NotificationManager manager = getSystemService(NotificationManager.class);
manager.createNotificationChannel(channel);
```

This is a `notification channel` — **first appearance**: a declared
category of notification, created once, that every individual
notification must reference, letting the user control categories of
notifications individually without the app building its own preference
UI. `"reminders"` is this channel's unique identifier — every future
notification that wants to appear under "Reminders" must name this exact
identifier; posting a notification against a channel that was never
created fails outright.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
framework code.

### Mechanical Walkthrough

1. `new NotificationChannel("reminders", "Reminders",
   NotificationManager.IMPORTANCE_DEFAULT)` — **(a) first appearance.**
   Three arguments: a stable identifier (`"reminders"`, never shown to
   the user, used internally to reference this channel), a
   human-readable label (`"Reminders"`, shown to the user in system
   notification settings), and an importance level controlling how
   intrusively notifications in this channel are presented by default.
2. `getSystemService(NotificationManager.class)` — **(a) first
   appearance**: retrieves the OS's own notification-management service,
   a real object owned by the Android system itself, not constructed
   directly with `new` the way this curriculum's own classes have been —
   a first hint at a broader pattern (system services generally) a later
   lesson covers in full.
3. `manager.createNotificationChannel(channel)` — registers the channel
   with the OS, exactly once. Calling this again with the same channel
   identifier and settings is harmless (Android treats it as a no-op),
   but it must happen at least once, before the app tries to post any
   notification into that channel — which is exactly why it belongs in
   `Application.onCreate()`, guaranteed to run once, before any Activity.

### CS Lens

A notification channel is a real instance of "declare a category before
using it," the same shape as this lesson's own `Application` needing to
exist before any Activity, and Lesson 11's Manifest needing to declare an
Activity before Android will launch it. Each of these enforces a real
ordering requirement: registration before use, checked or required by the
platform itself, not left to convention.

Also recognized in: any pub/sub messaging system requiring a topic to be
created before publishers or subscribers can use it, a database requiring
a table's schema to exist before rows can be inserted into it.

### SE Lens

The alternative — posting notifications with no channel system at all,
one flat, undifferentiated stream — was not chosen by Android (as of
version 8) because users increasingly want fine-grained control:
muting one specific kind of notification from an app, while keeping
others. Notification channels push that categorization decision to app
developers upfront, at the cost of this one extra setup step, in exchange
for users never needing the app itself to build a custom notification-
preferences screen — the OS handles it uniformly for every app.

---

## Connect the Pieces

`MyApp extends Application`, declared in the Manifest via
`android:name=".MyApp"`, is constructed exactly once, before any Activity
— the same inversion-of-control shape from Lesson 10, now governing the
whole process. Its `onCreate()` is the one reliable place to create a
notification channel exactly once, since any Activity-based approach
would risk running the creation code multiple times, or not at all,
depending on which screen happens to open first.

## What Breaks Without This

Posting a notification against a channel that was never created throws a
real runtime error on Android 8 and above, resembling:

```
java.lang.SecurityException: Fail to post notification, channel id reminders not exist
```

This is concrete proof the channel-first requirement is enforced by the
OS itself, not a style guideline: no amount of correctly-written
notification-posting code compensates for a channel that was never
registered.

## Exercises

1. Add a second notification channel, `"alerts"`, with a higher
   importance level (`IMPORTANCE_HIGH`), inside the same `onCreate()`,
   and explain, in your own words, why creating it here rather than in
   an Activity is the correct choice.
2. Read `Application`'s real contract again and identify what
   distinguishes it from `Activity`'s own lifecycle — specifically, why
   `Application` has no `onPause`/`onStop`/`onDestroy` equivalents.
3. Read the real `SecurityException` message in "What Breaks Without
   This" and identify exactly which part names the missing channel.

## Definition of Done

- [ ] You read `Application`'s real contract and can explain why
      `android:name=".MyApp"` is required to use a custom subclass.
- [ ] You completed Exercise 1 and added a second, correctly-scoped
      notification channel.
- [ ] You can state, without looking back at this lesson, why creating a
      notification channel inside an Activity's `onCreate()` instead of
      `Application`'s would be a real, meaningful mistake.

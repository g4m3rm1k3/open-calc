# Lesson 26b: Notification Channel

**What you will build:** No new code to compile — this reads real,
verified code directly.

**What you need to know first:** Lesson 26a's `Application`, Lesson 2h's
Android Manifest.

**Terms introduced in this lesson:**

- **Notification Channel** — a declared category of notification,
  created once, that every individual notification must reference —
  letting the user control categories of notifications individually
  without the app building its own preference UI.

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
placed inside `MyApp.onCreate()` from Lesson 26a:

```java
NotificationChannel channel = new NotificationChannel(
    "reminders",
    "Reminders",
    NotificationManager.IMPORTANCE_DEFAULT
);

NotificationManager manager = getSystemService(NotificationManager.class);
manager.createNotificationChannel(channel);
```

This is a `Notification Channel` — **first appearance**: a declared
category of notification, created once, that every individual
notification must reference — letting the user control categories of
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
   directly with `new` the way this course's own classes have been.
3. `manager.createNotificationChannel(channel)` — registers the channel
   with the OS, exactly once. Calling this again with the same channel
   identifier and settings is harmless (Android treats it as a no-op),
   but it must happen at least once, before the app tries to post any
   notification into that channel — which is exactly why it belongs in
   `Application.onCreate()`, guaranteed to run once, before any Activity.

### CS Lens

A notification channel is a real instance of "declare a category before
using it," the same shape as Lesson 26a's own `Application` needing to
exist before any Activity, and Lesson 2h's Manifest needing to declare an
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

`Application.onCreate()` (Lesson 26a) is the one reliable place to create
a notification channel exactly once, since any Activity-based approach
would risk running the creation code multiple times, or not at all,
depending on which screen happens to open first. The next lesson
introduces a different kind of app component entirely.

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
2. Read the real `SecurityException` message in "What Breaks Without
   This" and identify exactly which part names the missing channel.
3. Explain, in your own words, why calling
   `manager.createNotificationChannel(channel)` twice with the same
   arguments is harmless.

## Definition of Done

- [ ] You completed Exercise 1 and added a second, correctly-scoped
      notification channel.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why creating a
      notification channel inside an Activity's `onCreate()` instead of
      `Application`'s would be a real, meaningful mistake.

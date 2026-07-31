# Lesson 14: BroadcastReceiver and Registration

**What you will build:** Both units read real Android component contracts
directly — nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 11's `Android Manifest`.

**Terms introduced in this lesson:**

- **`BroadcastReceiver`** — a third kind of app component, distinct from
  `Activity` and `ContentProvider`, reacting to system-wide or cross-app
  announcements via a short-lived `onReceive` callback with no lifecycle
  of its own — heavy work must be handed off elsewhere.
- **Static vs. dynamic registration** — registering interest in an event
  either declaratively, ahead of time (surviving across restarts but
  restricted to an exempted set), or in code at runtime (tied to a
  component's actual running lifetime, unrestricted but requiring
  something already alive to register it).

---

## Concept Unit: `BroadcastReceiver` — Reacting to System-Wide Announcements

### The Problem

Every event this curriculum's Android material has reacted to so far
originated inside the app itself — a button tap, a screen opening. Some
events genuinely come from outside any one app entirely: the device
finishing its boot sequence, another app announcing something happened.
No Activity or Application, as built so far, has any way to be notified
of an announcement it didn't itself trigger.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real component contract, verified against
the actual Android framework source. `BroadcastReceiver`'s real,
complete declared contract (it has exactly one method):

```java
public abstract class BroadcastReceiver {
    public abstract void onReceive(Context context, Intent intent);
}
```

A concrete subclass, as an application developer would write it:

```java
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        System.out.println("Device finished booting.");
    }
}
```

This is a `BroadcastReceiver` — **first appearance**: a third kind of app
component, distinct from `Activity` and `ContentProvider`, reacting to
system-wide or cross-app announcements via a short-lived `onReceive`
callback with no lifecycle of
its own — heavy work must be handed off elsewhere. Unlike `Activity`'s
six-step lifecycle from Lesson 10, `onReceive` is the *entire* lifecycle:
it runs briefly, once, per announcement, and the object is discarded
immediately afterward — there is no `onCreate`/`onDestroy` pair to hold
longer-running state across.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
framework contract.

### Mechanical Walkthrough

1. `public abstract class BroadcastReceiver { public abstract void
   onReceive(Context context, Intent intent); }` — **(b) reappearing**
   abstract class and abstract method shape from Lesson 10, this time
   with exactly one required method rather than several.
2. `Context context` — **(b) reappearing** parameter type from Lesson
   10's `onCreate(Bundle savedInstanceState)`, here identifying which
   app environment received the broadcast.
3. `Intent intent` — **(a) first appearance** of `Intent` in this
   curriculum: a data object describing what actually happened — which
   specific announcement this is, and any data attached to it. A later
   lesson covers `Intent` in full; here it's the parameter carrying the
   announcement's own details into `onReceive`.
4. `class BootReceiver extends BroadcastReceiver { @Override public void
   onReceive(...) { ... } }` — **(b) reappearing** inheritance,
   overriding, and `@Override`, applied to this third component kind.

### CS Lens

`BroadcastReceiver` is inversion of control (Lesson 10) at its most
minimal: one method, called once, by the OS, at a moment entirely outside
the application's own control — no multi-step template method sequence,
because a broadcast is a single, discrete event, not an ongoing screen
with multiple phases.

Also recognized in: a pub/sub system's own subscriber callback (called
once per published message), a webhook handler (called once per external
event), any "fire and forget" event-notification shape where the
receiver has no ongoing lifecycle of its own between events.

### SE Lens

The alternative — giving `BroadcastReceiver` a fuller lifecycle, matching
`Activity`'s — was not chosen because a broadcast receiver's entire job
is reacting briefly to one specific announcement; the Android OS may
create and immediately discard the receiver object for each individual
broadcast, and heavy, long-running work inside `onReceive` risks being
killed mid-execution once the OS decides the receiver's brief window is
over — which is exactly why this pattern requires handing real work off
elsewhere (a later lesson's own subject) rather than doing it directly
inside `onReceive`.

---

## Concept Unit: Static vs. Dynamic Registration

### The Problem

Lesson 11 already established that an Activity must be declared in the
Manifest before Android will treat it as launchable. A natural
assumption is that declaring a `BroadcastReceiver` in the Manifest the
same way is enough to make it start receiving broadcasts — but modern
Android specifically restricts this for most broadcast types, for real
security and battery reasons, requiring a different registration path
instead.

### Introduce the Concept in Isolation

A Manifest declaration for `BootReceiver` — verified against the real
Android Manifest schema:

```xml
<receiver android:name=".BootReceiver" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

This is `static registration` — declared ahead of time, in the Manifest,
surviving across app restarts. It genuinely works for `BOOT_COMPLETED`
and a short, OS-exempted list of other broadcasts — but for most other
broadcast types (a connectivity change, for instance), this exact same
shape compiles and installs correctly, yet the receiver simply never
fires. The real alternative, `dynamic registration`, done in code:

```java
BroadcastReceiver receiver = new BootReceiver();
IntentFilter filter = new IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED);
context.registerReceiver(receiver, filter);
```

This is `static vs. dynamic registration` — **first appearance**:
registering interest in an event either declaratively, ahead of time
(surviving across restarts but restricted to an exempted set), or in code
at runtime (tied to a component's actual running lifetime, unrestricted
but requiring something already alive to register it).
`context.registerReceiver(...)` only works while the registering
component (an Activity, for instance) is actually alive — the receiver
stops receiving broadcasts the moment that component is destroyed, unlike
a statically-declared one.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — both are real, verified
registration shapes.

### Mechanical Walkthrough

1. `<receiver android:name=".BootReceiver" ...>` — **(b) reappearing**
   Manifest component-declaration shape from Lesson 11, applied to this
   third component kind.
2. `<action android:name="android.intent.action.BOOT_COMPLETED" />` —
   **(b) reappearing** intent-filter action declaration from Lesson 11,
   naming the specific system announcement this receiver wants.
3. `new BootReceiver()` and `context.registerReceiver(receiver, filter)`
   — **(a) first appearance** of dynamic registration: constructing the
   receiver directly with `new` (unlike every other component in this
   curriculum, none of which are ever constructed directly by application
   code) and explicitly registering it with the OS at a specific moment
   in running code, rather than declaring it ahead of time.
4. `new IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)` — **(b)
   reappearing** intent-filter concept from Lesson 11, here constructed
   as a real Java object instead of declared in XML — the same
   underlying idea, expressed through code because dynamic registration
   has no Manifest entry to declare it in at all.

### CS Lens

Static and dynamic registration are two different answers to "when does
this registration exist": static registration exists for the app's
entire installed lifetime, checked by the OS against a Manifest it reads
independent of whether the app is even running; dynamic registration
exists only as long as the specific object that called
`registerReceiver` is alive, tied directly to that object's own runtime
lifetime rather than the app's installation.

Also recognized in: a web server's static route configuration (defined in
a config file, loaded once at startup) versus dynamically registering a
route handler at runtime from within running code — the same
declarative-versus-imperative registration split recurring outside
Android entirely.

### SE Lens

The alternative — Android allowing every broadcast type to be received
via static, Manifest-only registration — was not chosen (as of recent
Android versions) specifically to limit how many apps silently wake up in
response to system-wide events they're not actively using, a real battery
and privacy cost at OS scale. Dynamic registration, tied to a component
actually being alive and running, means a receiver can only ever fire
while something in the app is already active to receive it — a
deliberate restriction traded for real resource savings across every
installed app on the device.

---

## Connect the Pieces

`BootReceiver extends BroadcastReceiver`, overriding `onReceive`,
established this third component kind: a brief, single-callback reaction
to an outside announcement, with no lifecycle of its own. Declaring it in
the Manifest (`<receiver>` plus `<intent-filter>`) is static
registration — it works for `BOOT_COMPLETED` specifically, but the same
declaration for most other broadcast types silently never fires, which is
exactly why `context.registerReceiver(...)`, dynamic registration tied to
a running component's own lifetime, exists as the real, working
alternative for everything outside that narrow exempted set.

## What Breaks Without This

A statically-declared receiver for a restricted broadcast type (like
connectivity changes) installs and compiles with no error at all, and
simply never fires — there is no crash, no exception, nothing pointing at
the mistake. This is the concrete, silent failure mode static
registration's own restriction causes: the only way to notice it is
knowing, ahead of time, which broadcast types are exempted and which
require dynamic registration instead — exactly the distinction this
lesson exists to make explicit rather than left to be discovered the hard
way.

## Exercises

1. Write a second dynamic registration, for
   `Intent.ACTION_BATTERY_LOW`, reusing `BootReceiver` as the receiver
   object, and explain in your own words why this specific broadcast
   needs dynamic registration rather than static.
2. Read `BroadcastReceiver`'s real, one-method contract again and explain
   why it has no equivalent to `Activity`'s `onPause`/`onResume` pair.
3. Identify, from this lesson's own text, which specific broadcast type
   is named as one of the short, OS-exempted list still allowed to use
   static registration.

## Definition of Done

- [ ] You read `BroadcastReceiver`'s real one-method contract and can
      explain why it has no fuller lifecycle.
- [ ] You read both the static and dynamic registration examples and can
      state which one `BOOT_COMPLETED` actually works with.
- [ ] You completed Exercise 1 and can explain why `ACTION_BATTERY_LOW`
      needs dynamic registration.
- [ ] You can state, without looking back at this lesson, why a
      statically-declared receiver for most broadcast types produces no
      error at all, yet still doesn't work.

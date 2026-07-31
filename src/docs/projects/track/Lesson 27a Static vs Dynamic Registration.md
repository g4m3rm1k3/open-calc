# Lesson 27a: Static vs. Dynamic Registration

**What you will build:** No new code to compile — this reads real
Android component contracts directly.

**What you need to know first:** Lesson 2h's Android Manifest.

**Terms introduced in this lesson:**

- **Static vs. Dynamic Registration** — registering interest in an event
  either declaratively, ahead of time (surviving across restarts but
  restricted to an exempted set), or in code at runtime (tied to a
  component's actual running lifetime, unrestricted but requiring
  something already alive to register it).

---

## Concept Unit: Static vs. Dynamic Registration

### The Problem

Lesson 2h already established that an Activity must be declared in the
Manifest before Android will treat it as launchable. A natural
assumption is that declaring interest in an outside, system-wide event
the same way — in the Manifest — is always enough to start receiving it.
Modern Android specifically restricts this for most event types, for
real security and battery reasons, requiring a different registration
path instead.

### Introduce the Concept in Isolation

A real Manifest declaration, verified against the real Android Manifest
schema, for a component reacting to the device finishing its boot
sequence — the specific component kind itself is the next lesson's own
subject:

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

This is `Static vs. Dynamic Registration` — **first appearance**:
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
   Manifest component-declaration shape from Lesson 2h, applied to a new
   component kind the next lesson names.
2. `<action android:name="android.intent.action.BOOT_COMPLETED" />` —
   **(b) reappearing** intent-filter action declaration from Lesson 2i,
   naming the specific system announcement this receiver wants.
3. `new BootReceiver()` and `context.registerReceiver(receiver, filter)`
   — **(a) first appearance** of dynamic registration: constructing the
   receiver directly with `new` (unlike every other component this
   course has shown, none of which are ever constructed directly by
   application code) and explicitly registering it with the OS at a
   specific moment in running code, rather than declaring it ahead of
   time.
4. `new IntentFilter(Intent.ACTION_AIRPLANE_MODE_CHANGED)` — **(b)
   reappearing** intent-filter concept from Lesson 2i, here constructed
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

The alternative — Android allowing every event type to be received via
static, Manifest-only registration — was not chosen (as of recent
Android versions) specifically to limit how many apps silently wake up in
response to system-wide events they're not actively using, a real battery
and privacy cost at OS scale. Dynamic registration, tied to a component
actually being alive and running, means a receiver can only ever fire
while something in the app is already active to receive it — a
deliberate restriction traded for real resource savings across every
installed app on the device.

---

## Connect the Pieces

Declaring a receiver in the Manifest works only for a short, exempted
list of events; `context.registerReceiver(...)`, tied to a running
component's own lifetime, is the real, working alternative for
everything else. The next lesson names the component kind this
registration actually applies to.

## What Breaks Without This

A statically-declared receiver for a restricted event type (like
connectivity changes) installs and compiles with no error at all, and
simply never fires — there is no crash, no exception, nothing pointing at
the mistake.

## Exercises

1. Write a second dynamic registration, for
   `Intent.ACTION_BATTERY_LOW`, reusing `BootReceiver` as the receiver
   object, and explain in your own words why this specific broadcast
   needs dynamic registration rather than static.
2. Identify, from this lesson's own text, which specific broadcast type
   is named as one of the short, OS-exempted list still allowed to use
   static registration.
3. Explain, in your own words, why dynamic registration requires
   "something already alive" to call `registerReceiver`, while static
   registration does not.

## Definition of Done

- [ ] You read both the static and dynamic registration examples and can
      state which one `BOOT_COMPLETED` actually works with.
- [ ] You completed Exercise 1 and can explain why `ACTION_BATTERY_LOW`
      needs dynamic registration.
- [ ] You can state, without looking back at this lesson, why a
      statically-declared receiver for most broadcast types produces no
      error at all, yet still doesn't work.

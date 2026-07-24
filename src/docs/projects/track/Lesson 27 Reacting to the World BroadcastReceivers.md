# Lesson 27: Reacting to the World — BroadcastReceivers

**What you will build:** A `BootReceiver` that defensively reschedules
`LowStockWorker` after a device reboot, and a dynamically-registered
receiver watching for the device regaining internet connectivity —
logging for now, wired to a real sync trigger once Lesson 28 builds one.
The transferable problem: everything this project has reacted to so
far originated *inside* the app itself — a tap, a `LiveData` change, a
scheduled `Worker`. A `BroadcastReceiver` is Android's mechanism for
reacting to events the *system*, or another app entirely, announces —
completing the four-component picture this curriculum has been
building toward since Lesson 2 named Activities, Services, Broadcast
Receivers, and Content Providers as a set.

**What you need to know first:** Lesson 26 (`WorkManager`,
`enqueueUniquePeriodicWork`, background execution limits — this
lesson's second unit extends that exact limitation), Lesson 2 (the
Manifest as declared capability), Lesson 25 (`FileProvider`, this
project's first non-Activity component).

---

## Concept Unit: `BroadcastReceiver` — Reacting to a System-Wide Announcement

### The Problem

`WorkManager`'s periodic scheduling (Lesson 26) is itself backed by
persistent OS mechanisms and does survive a reboot on its own — but
demonstrating the receiver mechanism directly, as genuine defensive
belt-and-suspenders practice many real apps still include, is worth
building for real.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `BootReceiver.java`;
  `AndroidManifest.xml`.
- **Change type:** Create, configure.
- **Dependencies:** the `WorkManager` scheduling call from Lesson 26.

### The New Code

```java
package com.yourname.pocketinventory;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import java.util.concurrent.TimeUnit;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            android.util.Log.d("BootReceiver", "Device booted, rescheduling low-stock check");
            PeriodicWorkRequest lowStockRequest =
                    new PeriodicWorkRequest.Builder(LowStockWorker.class, 6, TimeUnit.HOURS).build();
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                    "low_stock_check", ExistingPeriodicWorkPolicy.KEEP, lowStockRequest);
        }
    }
}
```

```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

```xml
<receiver android:name=".BootReceiver" android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
    </intent-filter>
</receiver>
```

### The Updated Project

`BootReceiver.java` is a whole new file. The Manifest gains a
`<uses-permission>` line (alongside `CAMERA` and `POST_NOTIFICATIONS`,
Lesson 24/26) and a `<receiver>` entry — a fourth Manifest component
type, syntactically parallel to `<activity>`, `<service>`, and
`<provider>`.

### Mechanical Walkthrough
- `extends BroadcastReceiver` — **first appearance.** The fourth and
  final major app component base class in this curriculum's set.
- `onReceive(Context context, Intent intent)` — **first appearance.**
  Called by the OS when a matching broadcast arrives — critically, this
  method has an extremely short execution budget (roughly ten seconds)
  and **no** `Activity`/`Service`-style lifecycle of its own: heavy
  work must be handed off (here, to `WorkManager`, itself already
  designed for exactly this handoff) rather than performed directly
  inside `onReceive`.
- `Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())` — **first
  appearance of `intent.getAction()`.** A single receiver *can* be
  registered for multiple broadcast actions at once (not done here);
  checking the specific action received is how you distinguish which
  one actually fired — reappearing string-constant-comparison shape
  from Lesson 21's menu dispatch.
- `PeriodicWorkRequest.Builder(...)`, `WorkManager.getInstance(context).enqueueUniquePeriodicWork(...)`
- — reappearing verbatim, Lesson 26, `KEEP` still correctly preventing
  duplicate scheduling even though this is now a *second* call site
  requesting the same unique work name.
- `<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />`
  — reappearing pattern (Lesson 24/26), a permission specifically
  gating the ability to be notified of this particular system event.
- `<receiver android:name=".BootReceiver" android:exported="true">` —
  reappearing Manifest-entry shape (Lesson 2/4), `exported="true"` here
  specifically because the broadcast originates from the *system*
  itself, outside this app's own process — the opposite of Lesson 4's
  `InventoryActivity` entry, which was `exported="false"` because it
  only needed to be reachable from within this app.
- `<intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>`
- — reappearing structural shape (Lesson 2's `MAIN`/`LAUNCHER` filter),
  a different action string, declaring which specific broadcast this
  receiver wants delivered to it.

### CS Lens

A `BroadcastReceiver` matched against a declared `<intent-filter>` is
another instance of the **publish-subscribe pattern** already named in
Lesson 16's Observer CS Lens — here, the "publisher" is the operating
system itself (or another app entirely), broadcasting an event with no
knowledge of, or direct reference to, who's listening; any number of
apps can independently declare interest in the same system event.

### SE Lens

**Why does the OS enforce such a tight time budget on `onReceive`
instead of letting a receiver run as long as it needs, like an
Activity can?** A `BroadcastReceiver` exists specifically to answer
"did something happen," briefly and cheaply, potentially triggered
extremely often across the whole device (boot events aside — think
connectivity or battery-state changes, covered next) — allowing
unbounded work directly inside `onReceive` would let a single poorly-
written app noticeably degrade every broadcast's delivery latency
system-wide. Forcing real work to be handed off elsewhere (`WorkManager`
here, exactly as Lesson 26 already built it to run detached from any
UI) keeps the receiver itself fast and predictable, at the cost of an
extra indirection for anything beyond a trivial, instant reaction.

---

## Concept Unit: Implicit Broadcast Restrictions and Dynamic Registration

### The Problem

Try declaring a Manifest `<receiver>` for connectivity changes the
identical way `BootReceiver` was just declared —
`android.net.conn.CONNECTIVITY_CHANGE` in an `<intent-filter>` — and it
will **never fire** on any reasonably modern Android version. This
isn't a mistake in the code; it's a deliberate platform restriction
this unit exists to explain, honestly, rather than let silently
confuse a future debugging session.

### The Concept, in Prose

Starting with Android 8 (API 26), the OS stopped delivering most
**implicit broadcasts** (ones not specifically targeted at your app) to
Manifest-declared receivers at all — for the same battery/performance
reasons Lesson 26 named for background execution limits generally: a
device-wide event like connectivity changing can fire extremely
frequently, and waking every installed app's declared receiver for
every occurrence, even apps not currently running, was a measurable
drain the platform now refuses by default. `BOOT_COMPLETED`, used
above, is one of a short, explicitly exempted list (it fires once, an
app genuinely needs the chance to react even if not currently running).
Connectivity changes are not exempted — reacting to them now requires
**registering the receiver in code, at runtime**, from a component
that's actually alive at the moment you care about the event, and only
for as long as that component stays alive.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `PocketInventoryApplication.java`.
- **Change type:** Add.
- **Dependencies:** none new.

### The New Code

```java
private final BroadcastReceiver connectivityReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
        ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        Network activeNetwork = cm.getActiveNetwork();
        boolean isConnected = activeNetwork != null;
        android.util.Log.d("Connectivity", "Network available: " + isConnected);
    }
};
```

```java
IntentFilter filter = new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION);
registerReceiver(connectivityReceiver, filter);
```

### The Updated Project

Added to `PocketInventoryApplication` — the field alongside the
`LOW_STOCK_CHANNEL_ID` constant from Lesson 26; the registration call
inside `onCreate`, after the notification channel setup.

### Mechanical Walkthrough
- `new BroadcastReceiver() { @Override public void onReceive(...) { ... } }`
- — **first appearance of an anonymous `BroadcastReceiver`** — the
  same anonymous-class shape as Lesson 8's `Parcelable.Creator` and
  Lesson 20's `DiffUtil.Callback`, here because this receiver is
  registered dynamically rather than declared in the Manifest, so it
  never needs a separate named top-level class or a Manifest entry at
  all.
- `ConnectivityManager cm = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE)`
- — reappearing (`getSystemService`, Lesson 26), a different system
  service, cast (Lesson 8) to its specific type.
- `cm.getActiveNetwork()` — **first appearance.** Returns the
- currently active `Network` object, or `null` if there is none —
  checked directly here rather than relying solely on the broadcast's
  own extras, since the modern-recommended way to determine *current*
  connectivity state is to query it directly rather than trust
  potentially-stale broadcast data.
- `new IntentFilter(ConnectivityManager.CONNECTIVITY_ACTION)` — **first
  appearance.** The code equivalent of the Manifest `<intent-filter>`
  tag (Lesson 2) — built as a real Java object instead of XML, because
  this registration itself happens in code, not in a static
  declaration.
- `registerReceiver(connectivityReceiver, filter)` — **first
  appearance.** Explicitly registers the receiver, right now, tied to
- this specific `Application` instance's lifetime — the actual
  mechanism that makes dynamic registration exempt from the Manifest-
  declaration restriction just explained: the OS only needs to deliver
  to receivers that are *currently, demonstrably* running, not wake up
  every installed app on the device.

### Run It

Run the app, toggle the emulator's network connectivity off and back
on (via the emulator's extended controls, or Airplane Mode). Confirm
Logcat shows the `"Network available: ..."` line firing on each
transition — real proof the dynamic registration path works where a
Manifest declaration for this same action would silently not.

### CS Lens

The contrast between Manifest-declared (static, survives across app
restarts, restricted to an exempted action list) and dynamically-
registered (code-based, tied to a component's actual running lifetime,
works for any broadcast) receivers is a real instance of **static
versus dynamic registration/subscription** — the same tradeoff shape as
compile-time dependency injection versus runtime service lookup, or a
compiled router table versus one built and modified while a program
runs.

### SE Lens

**Why keep Manifest-declared receivers at all, if dynamic registration
works for everything and doesn't require special exemptions?** Dynamic
registration only works while *something* in your app is already
alive to register it — `PocketInventoryApplication.onCreate()` runs
once per process start, meaning the connectivity receiver stops
receiving anything the moment Android kills the process for memory,
with no way to "wake up" and re-register on its own. `BOOT_COMPLETED`'s
Manifest-declared path exists specifically because that one, genuinely
important case — the app isn't running *at all*, and needs a chance to
react to something happening regardless — has no dynamic-registration
equivalent: there's no already-alive component to register from before
the app has ever started.

---

## Connect the Pieces

Full trace: on device boot, the OS broadcasts `BOOT_COMPLETED`
system-wide → because this action is on the platform's small exemption
list, `BootReceiver`'s Manifest-declared `<intent-filter>` still
receives it even though Pocket Inventory was never running →
`onReceive` hands the real work to `WorkManager` (Lesson 26), staying
inside its own tight time budget → separately, while the app's process
is alive, `PocketInventoryApplication.onCreate()` dynamically registers
a second receiver for connectivity changes — the only path that still
works for this specific, non-exempted broadcast action on modern
Android — logging each transition for now, the exact hook Lesson 28
wires to a real "connectivity restored, trigger pending sync" action.

## What Breaks Without This

Temporarily change `BootReceiver`'s Manifest `<intent-filter>` action
string to a typo (`android.intent.action.BOOT_COMPLETE`, missing the
final "D"). Reboot the emulator (or simulate via
`adb shell am broadcast -a android.intent.action.BOOT_COMPLETED`) and
confirm, via Logcat, that `BootReceiver` never fires — no crash, no
error, simply silent non-delivery, since the filter genuinely doesn't
match anything the OS actually sends. Restore the correct string
afterward.

## Exercises

1. Temporarily declare `android.net.conn.CONNECTIVITY_CHANGE` as a
   Manifest `<intent-filter>` action on a *second*, new receiver class,
   toggle connectivity, and confirm via Logcat that it genuinely never
   fires on your test device/emulator's API level — direct, hands-on
   confirmation of this lesson's central restriction, rather than
   trusting it from prose alone. Delete this second receiver afterward.
2. Add `unregisterReceiver(connectivityReceiver)` to a matching
   teardown point and write, in your own words, why a dynamically-
   registered receiver that's *never* unregistered is a real, if minor,
   resource leak — connect this to Lesson 16's `getViewLifecycleOwner()`
   discussion of listeners that must be tied to a bounded lifetime.

## Definition of Done

- [ ] `BootReceiver` is declared correctly and reschedules
      `LowStockWorker` after a real or simulated reboot.
- [ ] The dynamically-registered connectivity receiver logs real
      connectivity transitions, verified by actually toggling
      connectivity, not just reading the code.
- [ ] You can explain, in your own words, why one receiver could be
      Manifest-declared and the other could not.
- [ ] You broke the boot receiver's intent-filter string on purpose,
      confirmed the silent non-delivery, and restored it.
- [ ] Commit: message explaining why (e.g. "Add a Manifest-declared
      BootReceiver for defensive WorkManager rescheduling and a
      dynamically-registered connectivity receiver, since implicit
      broadcasts other than a small exempted set require runtime
      registration on modern Android").

Lesson 28 is next: the connectivity receiver just built has nothing
real to trigger yet — Retrofit, JSON, and syncing this project's local
inventory with a remote server for the first time.

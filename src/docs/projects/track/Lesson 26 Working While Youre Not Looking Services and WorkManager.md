# Lesson 26: Working While You're Not Looking — Services, WorkManager, and Notifications

**What you will build:** A real, if secondary, `LowStockCheckService`
kept in the project as an alternative implementation you'll compare
against the real feature: a `WorkManager`-scheduled periodic check that
runs even when Pocket Inventory isn't open, posting a real system
notification when any item is at or below its saved threshold. The
transferable problem: every background operation so far (Room queries,
Lesson 13; camera capture, Lesson 25) has been tied directly to a
visible screen's lifecycle. Nothing in this app currently does anything
while it's closed — and "check stock levels periodically, in the
background, even reliably across a device reboot" needs a genuinely
different kind of component than an Activity or Fragment can provide.

**What you need to know first:** Lesson 14 (threads, why background
work exists at all), Lesson 13 (`ItemDao`, querying persisted data),
Lesson 11 (the saved low-stock threshold), Lesson 24 (the runtime
permission pattern, reused for notifications).

---

## Concept Unit: `Service` — Running Code With No Screen At All

### The Problem

An Activity or Fragment only exists while something is visibly showing
it (Lesson 5/18's lifecycles). Some work — even short, one-off work —
needs to run with no UI involved whatsoever. `Service` is Android's
oldest, most general-purpose answer: a fourth kind of app component
(alongside Activity, `ContentProvider` — briefly met via `FileProvider`
in Lesson 25 and covered fully in Lesson 29 — and `BroadcastReceiver`,
Lesson 27), declared in the Manifest exactly like an Activity, but with
no window of its own.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `LowStockCheckService.java`;
  `AndroidManifest.xml`.
- **Change type:** Create, configure.
- **Dependencies:** `ItemDao`, `AppDatabase` (Lesson 13).

**A note on scope before building this:** unlike this curriculum's
throwaway labs (discarded once understood), this `Service` is a real,
working, permanently-kept alternative implementation — built because
this project's stated goal is understanding Android broadly, not just
shipping the single narrowest path to a working feature. It will not
be wired to run automatically; the real, ongoing low-stock feature uses
`WorkManager` instead, for reasons this lesson explains directly. Both
stay in the codebase.

### The New Code

```java
package com.yourname.pocketinventory;

import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import androidx.annotation.Nullable;
import java.util.List;

public class LowStockCheckService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        android.util.Log.d("LowStockCheckService", "Service started, checking stock");

        new Thread(() -> {
            ItemDao itemDao = AppDatabase.getInstance(getApplicationContext()).itemDao();
            List<Item> allItems = itemDao.getAll();
            int lowStockCount = 0;
            for (Item item : allItems) {
                if (item.getQuantity() <= 5) {
                    lowStockCount++;
                }
            }
            android.util.Log.d("LowStockCheckService", "Low-stock items found: " + lowStockCount);
            stopSelf(startId);
        }).start();

        return START_NOT_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
```

```xml
<service android:name=".LowStockCheckService" android:exported="false" />
```

### The Updated Project

This is the whole new file. The Manifest gains a `<service>` entry, a
sibling to the `<activity>` and `<provider>` entries already present —
same declaration pattern, a different component type.

### Mechanical Walkthrough

- `extends Service` — **first appearance.** Same "must extend the
  framework's class" pattern as `AppCompatActivity` (Lesson 2), a
  component with no view hierarchy of its own at all.
- `onStartCommand(Intent intent, int flags, int startId)` — **first
  appearance.** Called by the OS when something calls
  `startService(intent)` (this project's Manifest declares it but
  nothing calls it, deliberately, since it's kept unwired) — this is a
  `Service`'s rough equivalent to an Activity's `onCreate`, except a
  `Service` can be *started again* while already running, which is
  what `startId` distinguishes between separate start requests.
- `new Thread(() -> { ... }).start()` — reappearing (Lesson 14),
  worth restating directly: **`Service` methods run on the main thread
  by default**, exactly like an Activity's — a `Service` is not
  automatically a background thread itself, a common, real point of
  confusion; the actual database work still needs its own thread, the
  same rule Lesson 14 established for everything else.
- `stopSelf(startId)` — **first appearance.** A `Service` doesn't stop
  automatically when its work finishes — it keeps running,
  consuming resources, until something explicitly stops it; matching
  the specific `startId` this call was given avoids stopping the
  service out from under a *different*, more recent start request that
  might have arrived in the meantime.
- `return START_NOT_STICKY;` — **first appearance.** Tells the OS what
  to do if it kills this `Service` to reclaim memory while it's
  running: `START_NOT_STICKY` means "don't bother restarting it
  automatically" — appropriate for a one-off check with nothing left to
  resume; other constants (`START_STICKY`, not used here) exist for
  services that should be recreated and re-invoked after being killed.
- `onBind(Intent intent)` returning `null` — **first appearance.**
  Required by the `Service` contract regardless of use — this method
  matters for a **bound** `Service` (one other components attach to
  and call methods on directly, a real, different usage pattern this
  project doesn't need and doesn't build); returning `null` here
  explicitly declines binding support, appropriate for a purely
  **started** `Service` like this one.

### CS Lens

A `Service` is the general-purpose case of the broader idea already met
narrowly in Lesson 14: work detached from any specific UI's lifecycle.
Also recognized in: Unix/Linux daemon processes (running independent of
any logged-in session), Windows Services, and any long-lived background
process an operating system manages separately from foreground,
user-facing applications.

### SE Lens

**Why does this lesson build a real `Service` at all if it's not going
to be used?** Because a plain `Service`'s actual behavior — what
happens to it under memory pressure, whether it survives a reboot,
whether the OS lets it run at all while the screen is off — has changed
substantially across Android versions, in ways that make it, on its
own, a genuinely poor fit for "run this periodically, reliably, for as
long as the app is installed," which is exactly this feature's real
requirement. Understanding what a raw `Service` actually is and does is
what makes the next unit's explanation of *why* `WorkManager` exists
land as a real, felt tradeoff instead of an arbitrary library
recommendation to memorize.

---

## Concept Unit: Why Not a Plain `Service` for Periodic Work

### The Problem

Nothing about the `Service` just built schedules it to run
periodically, or guarantees it runs at all once the screen is off.

### The Concept, in Prose

Since Android 8 (API 26), the OS imposes real, increasingly strict
**background execution limits**: an app with no visible UI is
aggressively restricted in what it can do unprompted, specifically to
protect battery life — a plain started `Service` with no special
handling can be stopped by the OS within moments of the app leaving the
foreground. Later versions add **Doze mode** — during extended idle
periods (screen off, device stationary), the OS batches and delays
background work app-wide, including most alarms and network access,
precisely to save power. Manually building "run every 6 hours, survive
reboots, respect Doze, retry on failure, adapt to whichever Android
version this device runs" correctly, by hand, on top of a raw `Service`,
is real, substantial, error-prone work — exactly the kind of repeated
boilerplate this curriculum has already seen good reason to delegate to
a library (Room over raw SQLite, Lesson 13; Navigation Component over
manual Intents, Lesson 19).

### SE Lens

**Why does Android provide a whole separate library (`WorkManager`)
instead of just fixing `Service` to already do all of this?** Not every
background task wants the same tradeoffs a plain `Service` offers —
some genuinely need to run *immediately*, in the foreground, visibly (a
music player, covered by a different mechanism, a foreground `Service`,
out of scope here). `WorkManager` doesn't replace `Service` outright;
it's built to solve one specific, common shape of problem —
deferrable, guaranteed-eventually background work — well, by
internally choosing the best underlying mechanism (`JobScheduler`,
`AlarmManager`, or a plain thread, depending on the device's actual
Android version) so your code doesn't have to.

---

## Concept Unit: `WorkManager` — Deferrable, Guaranteed Background Work

### Commands Needed

Add to `app/build.gradle`'s `dependencies { }`:

```gradle
implementation 'androidx.work:work-runtime:2.9.0'
```

Sync.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `LowStockWorker.java`;
  `InventoryActivity.java` (schedules it once).
- **Change type:** Create, add.
- **Dependencies:** `ItemDao`, `AppDatabase`, the notification channel
  built in the next unit.

### The New Code

```java
package com.yourname.pocketinventory;

import android.content.Context;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import java.util.List;

public class LowStockWorker extends Worker {
    public LowStockWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        ItemDao itemDao = AppDatabase.getInstance(getApplicationContext()).itemDao();
        android.content.SharedPreferences prefs = getApplicationContext()
                .getSharedPreferences("pocket_inventory_prefs", Context.MODE_PRIVATE);
        int threshold = prefs.getInt("low_stock_threshold", 5);

        List<Item> allItems = itemDao.getAll();
        int lowStockCount = 0;
        for (Item item : allItems) {
            if (item.getQuantity() <= threshold) {
                lowStockCount++;
            }
        }

        if (lowStockCount > 0) {
            NotificationHelper.showLowStockNotification(getApplicationContext(), lowStockCount);
        }

        return Result.success();
    }
}
```

```java
PeriodicWorkRequest lowStockRequest =
        new PeriodicWorkRequest.Builder(LowStockWorker.class, 6, TimeUnit.HOURS).build();
WorkManager.getInstance(this).enqueueUniquePeriodicWork(
        "low_stock_check", ExistingPeriodicWorkPolicy.KEEP, lowStockRequest);
```

### The Updated Project

`LowStockWorker` is a whole new file. The scheduling call is added to
`InventoryActivity.onCreate`, once, alongside `setContentView` — the
one and only place this project ever needs to request the periodic
check exist; `WorkManager` itself owns actually running it from then on,
independent of whether `InventoryActivity` is ever opened again.

### Mechanical Walkthrough

- `extends Worker` — **first appearance.** The unit of work
  `WorkManager` executes — deliberately **not** an Activity, Fragment,
  or `Service` subclass; a plain class with a required constructor
  shape and one method to implement.
- `public LowStockWorker(@NonNull Context context, @NonNull WorkerParameters params) { super(context, params); }`
  — reappearing (constructor shape, parent call — the exact same
  required-constructor pattern `AndroidViewModel` demanded in Lesson
  15, a different framework class with the same design idea).
- `doWork()` — **first appearance.** Called by `WorkManager`, already
  on a background thread it manages internally — **notably, unlike a
  `Service`'s `onStartCommand`, no manual `Thread`/`ExecutorService`
  wrapping is needed here** — `WorkManager` handles the "don't block
  the main thread" concern (Lesson 14) for you, the same kind of
  built-in convenience `ListAdapter` provided over hand-rolled
  `DiffUtil` dispatching in Lesson 20.
- `AppDatabase.getInstance(getApplicationContext())` — reappearing
  (Lesson 13's Singleton), `getApplicationContext()` — reappearing
  (Lesson 13/15), correct here for the same long-lived-context reason.
- `prefs.getInt("low_stock_threshold", 5)` — reappearing, Lesson 11,
  read directly rather than through `ItemRepository`, a reasonable,
  narrow exception since a `Worker` isn't part of the ViewModel/
  Repository chain (Lesson 17) at all — it's a separate entry point
  into the same underlying data.
- `Result.success()` — **first appearance.** Reports the outcome back
  to `WorkManager` — other values (`Result.retry()`, `Result.failure()`,
  not needed by this simple check) exist for work that can meaningfully
  fail and be retried.
- `new PeriodicWorkRequest.Builder(LowStockWorker.class, 6, TimeUnit.HOURS).build()`
  — **first appearance.** The Builder pattern again (Lesson 22's named
  concept, Lesson 13's `Room.databaseBuilder`), configuring which
  `Worker` to run and how often — `TimeUnit.HOURS` — **first
  appearance** — a standard-library enum making the interval's unit
  unambiguous.
- `WorkManager.getInstance(this)` — reappearing (Singleton retrieval
  shape, Lesson 13).
- `.enqueueUniquePeriodicWork("low_stock_check", ExistingPeriodicWorkPolicy.KEEP, lowStockRequest)`
  — **first appearance.** `"low_stock_check"` names this specific
  periodic job — calling this method again with the *same* name and
  `ExistingPeriodicWorkPolicy.KEEP` (**first appearance**) means "if
  this job is already scheduled, leave it exactly as it is, don't
  duplicate or restart it" — critical given `InventoryActivity.onCreate`
  runs on every app launch (Lesson 5); without `KEEP`, every relaunch
  would schedule a redundant duplicate periodic job.

### CS Lens

`WorkManager` choosing the actual underlying scheduling mechanism per-
device internally, while exposing one stable API, is the same
**abstraction over platform-specific implementation details** idea as
`RecyclerView.LayoutManager` (Lesson 6, arrangement strategy hidden
behind a stable interface) — here applied to "how does this specific
Android version prefer to schedule deferrable background work" instead
of "how are rows arranged on screen."

---

## Concept Unit: `NotificationChannel` and Posting the Notification

### The Problem

`LowStockWorker` calls `NotificationHelper.showLowStockNotification(...)`,
which doesn't exist yet — and posting any notification on Android 8+
requires a **channel** to be created first, and, since Android 13,
explicit runtime permission (Lesson 24's exact pattern, applied to a
new permission).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file `PocketInventoryApplication.java`; new
  file `NotificationHelper.java`; `AndroidManifest.xml`.
- **Change type:** Create, configure.

### The New Code — the Channel, Created Once at App Startup

```java
package com.yourname.pocketinventory;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;

public class PocketInventoryApplication extends Application {
    public static final String LOW_STOCK_CHANNEL_ID = "low_stock_channel";

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    LOW_STOCK_CHANNEL_ID, "Low Stock Alerts", NotificationManager.IMPORTANCE_DEFAULT);
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
}
```

```xml
<application
    android:name=".PocketInventoryApplication"
    ...>
```

### The Updated Project

This is a whole new file — the project's first `Application` subclass,
registered via `android:name=".PocketInventoryApplication"` added to
the existing `<application>` tag's attributes (alongside
`android:allowBackup`, `android:icon`, etc., from Lesson 2's original
Manifest).

### Mechanical Walkthrough

- `extends Application` — **first appearance.** Unlike every other
  base class in this project, `Application` represents the *whole
  running process*, not one screen or component — exactly one instance
  exists for the app's entire lifetime, created before any Activity.
- `public void onCreate()` — reappearing method name (Lesson 2), a
  genuinely different override: `Application.onCreate()` is called once
  per process start, before any Activity's own `onCreate`.
- `Build.VERSION.SDK_INT >= Build.VERSION_CODES.O` — **first appearance
  of a runtime API-level check.** `NotificationChannel` didn't exist
  before Android 8 (API 26, "O") — this guard runs the channel-creation
  code only on devices new enough to have the concept at all, a real,
  common pattern whenever a project's `minSdkVersion` (Lesson 1) is
  lower than the version a specific feature was introduced in.
- `new NotificationChannel(LOW_STOCK_CHANNEL_ID, "Low Stock Alerts", NotificationManager.IMPORTANCE_DEFAULT)`
  — **first appearance.** A channel's ID (an internal key, matched
  later when posting), a user-visible name (shown in the system's
  per-app notification settings), and an importance level governing
  default behavior (sound, visual prominence).
- `getSystemService(NotificationManager.class)` — **first appearance.**
  A general Android mechanism for retrieving OS-level service objects
  by type — the same underlying idea `LayoutInflater.from(...)` (Lesson
  6) and `getSharedPreferences(...)` (Lesson 11) already used less
  explicitly.
- `manager.createNotificationChannel(channel)` — **first appearance.**
  Registers the channel — safe and correct to call every app launch;
  creating an already-existing channel is a harmless no-op.

### The New Code — Requesting Permission and Posting

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

```java
package com.yourname.pocketinventory;

import android.app.NotificationManager;
import android.content.Context;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import android.Manifest;
import android.content.pm.PackageManager;

public class NotificationHelper {
    static void showLowStockNotification(Context context, int lowStockCount) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        NotificationCompat.Builder builder = new NotificationCompat.Builder(
                context, PocketInventoryApplication.LOW_STOCK_CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle("Low Stock Alert")
                .setContentText(lowStockCount + " item(s) at or below threshold")
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setAutoCancel(true);
        NotificationManagerCompat.from(context).notify(1001, builder.build());
    }
}
```

### The Updated Project

`NotificationHelper` is a new file with one static method,
`LowStockWorker.doWork()` (this lesson's earlier unit) already calls
it. The Manifest gains one more `<uses-permission>` line, alongside
`CAMERA` (Lesson 24).

### Mechanical Walkthrough

- `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`
  — reappearing pattern (Lesson 24), a permission specific to Android
  13+ — on older devices, posting notifications never required runtime
  consent at all, which is why this check is written defensively rather
  than assumed.
- `ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PERMISSION_GRANTED`
  — reappearing exactly, Lesson 24 — this project deliberately doesn't
  build a full rationale-dialog flow for this one (it would need a UI
  screen to launch from, and `LowStockWorker` has none) — instead, it
  silently skips posting if permission was never granted, a reasonable,
  narrower handling for a background-only feature with no screen to
  ask from directly (the request itself would need to be triggered from
  an actual screen — left as an exercise).
- `new NotificationCompat.Builder(context, PocketInventoryApplication.LOW_STOCK_CHANNEL_ID)`
  — reappearing Builder pattern, referencing the channel ID created
  once at app startup.
- `.setSmallIcon(...)`, `.setContentTitle(...)`, `.setContentText(...)`,
  `.setPriority(...)`, `.setAutoCancel(true)` — **first appearance, as
  a group.** Standard notification content fields; `setAutoCancel(true)`
  — worth its own clause — dismisses the notification automatically
  once the user taps it.
- `NotificationManagerCompat.from(context).notify(1001, builder.build())`
  — **first appearance.** `1001` is this notification's ID — reusing
  the same ID on a future call would **update** the existing
  notification rather than post a new one, a detail worth knowing even
  though this project always uses the same fixed ID.

### Run It

Temporarily reduce `LowStockWorker`'s scheduled interval to the
`PeriodicWorkRequest.Builder`'s practical minimum (15 minutes — a real
`WorkManager` floor, not a bug) for testing purposes, or use
`WorkManager`'s test-only `TestDriver` API (documented, not required
here) to force immediate execution. Confirm a real system notification
appears reading "Low Stock Alert" whenever any item is at or below the
saved threshold — tap it, confirm it dismisses. Restore the 6-hour
interval afterward.

### CS Lens

Requiring a channel, created once, that every individual notification
must reference, is another instance of **declared capability before
use** — the same shape as the Manifest itself (Lesson 2): the system
knows, ahead of time and in one place, every *category* of notification
an app might send, letting the user control them individually (mute
low-stock alerts specifically, keep others) without the app needing to
build that preference UI itself.

---

## Connect the Pieces

Full trace: `PocketInventoryApplication.onCreate()` runs once, at
process start, creating the notification channel before anything else
in the app executes → `InventoryActivity.onCreate()` schedules
`LowStockWorker` to run every 6 hours via `WorkManager`, using
`enqueueUniquePeriodicWork`'s `KEEP` policy so relaunching the app never
duplicates the schedule → hours later, with the app fully closed,
`WorkManager` — using whichever underlying OS mechanism this device
prefers — wakes `LowStockWorker.doWork()` on its own managed background
thread → it reads the real threshold (Lesson 11) and every persisted
`Item` (Lesson 13) directly through `ItemDao`, counts low-stock items,
and calls `NotificationHelper.showLowStockNotification`, which checks
the Android 13+ runtime permission (Lesson 24's exact pattern) before
building and posting a real system notification through the channel
created at startup — none of it touching a single Activity, Fragment,
or visible screen, the entire point this lesson set out to demonstrate.
The `LowStockCheckService` built in this lesson's first unit remains in
the project, uninvoked, a real working alternative you can compare
directly against `LowStockWorker`'s approach.

## What Breaks Without This

Temporarily remove `ExistingPeriodicWorkPolicy.KEEP` and its argument
entirely, replacing it with `ExistingPeriodicWorkPolicy.REPLACE`. Launch
the app several times in a row (force-stop and relaunch each time).
Nothing crashes and nothing is *visibly* wrong — but `REPLACE` means
every single launch cancels and reschedules the periodic job from
scratch, silently resetting its next-run countdown every time, which
in a real, frequently-opened app could mean the check effectively never
fires on its intended cadence. Restore `KEEP` afterward.

## Exercises

1. Add a `Constraints` object to `LowStockWorker`'s
   `PeriodicWorkRequest.Builder` (via `.setConstraints(...)`) requiring
   `NetworkType.NOT_REQUIRED` explicitly, then look up (documentation)
   `setRequiresBatteryNotLow(true)` and consider, in writing, whether
   it's an appropriate constraint for this specific low-priority check.
2. Wire a debug-only button somewhere temporary that calls
   `startService(new Intent(requireContext(), LowStockCheckService.class))`,
   confirming the kept-but-unwired `Service` from this lesson's first
   unit genuinely still works when explicitly triggered — direct,
   hands-on proof that "not used by the app's real flow" and "doesn't
   work" are different things.

## Definition of Done

- [ ] `LowStockWorker` is scheduled once, correctly avoiding duplicate
      scheduling across relaunches, and posts a real system
      notification when items are low.
- [ ] `LowStockCheckService` exists, compiles, and works if manually
      triggered, even though nothing calls it automatically.
- [ ] You can explain, in your own words, why a plain `Service` alone
      isn't a good fit for guaranteed periodic background work.
- [ ] You changed `KEEP` to `REPLACE` on purpose, understood the subtle
      rescheduling problem, and restored it.
- [ ] Commit: message explaining why (e.g. "Add a periodic WorkManager-
      scheduled low-stock check with system notifications, keeping a
      hand-built Service as an unused reference alternative").

Lesson 27 is next: this project has never reacted to anything happening
*outside* itself — `BroadcastReceiver`, and responding to a real system
event (the device finishing a reboot) without the app being open at
all.

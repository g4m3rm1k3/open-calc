# Lesson 12: `SmsManager`, the Professional Way

**What you will build:** A real Notifications screen — a phone number
field, a "Send Test SMS" button, and a real status `TextView` — sending
a genuine SMS through the identical `SmsManager` API
`android-persistence-lab` Lesson 09 already proved, this time triggered
through a real `NotificationsViewModel` and observed through a real
`LiveData<String>`, instead of called directly from inside an
`Activity`'s own click listener. The transferable problem: that
series' own `NotificationsActivity` held every real piece of this
feature's logic — the permission check, the `SmsManager` call, the
`SecurityException` handling — directly inside one click listener; this
project's own architecture, built since Lesson 02, exists specifically
so a screen never owns real logic like that directly.

**What you need to know first:** `android-persistence-lab` Lesson 09
(`SmsManager`, `sendTextMessage`, the real `SecurityException` race,
the two-check discipline) — this lesson reuses that series' own already
-verified API and reasoning directly. This series' own Lessons 06, 09,
10 (`Repository`, `AndroidViewModel`, `MutableLiveData`).

**Terms introduced in this lesson:** none new — every real API this
lesson uses was already given full treatment in
`android-persistence-lab` Lesson 09; this lesson's own real subject is
where that logic now lives.

**Objects and methods used:**

**`SmsManager` / `sendTextMessage`**
- *What they are:* the real class and method that sends an SMS.
- *Implementation:* given full treatment in `android-persistence-lab`
  Lesson 09 — real declared shape, real `SecurityException` risk,
  unchanged here.
- *Its use:* called once, inside `NotificationRepository`, never
  directly inside `NotificationsActivity`.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`ContextCompat.checkSelfPermission`**
  - *What it is:* a method returning whether a permission is currently
    granted.
  - *Implementation:* given full treatment in `android-ui-foundations`
    Lesson 31.
  - *Its use:* the identical real, two-check discipline
    `android-persistence-lab` Lesson 09 established — checked once
    before attempting a send, and the send itself still wrapped in a
    real `try`/`catch` for the real race that discipline can't fully
    close.

---

## Concept Unit: Moving Real Logic Out of the `Activity`

### The Problem

`android-persistence-lab`'s own `NotificationsActivity.sendTestSmsButton`
click listener held, directly: a permission check, reading a typed
phone number, obtaining a real `SmsManager`, calling `sendTextMessage`,
and catching a real `SecurityException` — five real, distinct
responsibilities, all inside one `Activity`'s own click listener,
exactly the shape Lesson 02 of this series already named as the
architectural dead end this entire project exists to fix.

### Project Change

- **Reference Source:** `SmsManager`'s real declared shape, already
  quoted in full in `android-persistence-lab` Lesson 09.
- **Files affected:** New file `notifications/NotificationRepository.java`;
  new file `notifications/NotificationsViewModel.java`;
  `notifications/NotificationsActivity.java`.
- **Change type:** Create two new files; rewrite one click listener.
- **Dependencies:** None new.

### The New Code

`NotificationRepository.java`:

```java
package com.yourname.inventoryapp.notifications;

import android.Manifest;
import android.app.Application;
import android.content.pm.PackageManager;
import android.telephony.SmsManager;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

public class NotificationRepository {
    private final Application application;

    public NotificationRepository(Application application) {
        this.application = application;
    }

    public LiveData<String> sendTestSms(String phoneNumber) {
        MutableLiveData<String> status = new MutableLiveData<>();

        boolean granted = ContextCompat.checkSelfPermission(application, Manifest.permission.SEND_SMS)
            == PackageManager.PERMISSION_GRANTED;
        if (!granted) {
            status.setValue("Grant SMS permission first");
            return status;
        }

        try {
            SmsManager smsManager = SmsManager.getDefault();
            smsManager.sendTextMessage(phoneNumber, null, "Test message from the inventory app", null, null);
            status.setValue("Message sent");
        } catch (SecurityException e) {
            status.setValue("SMS permission was revoked");
        }
        return status;
    }
}
```

`NotificationsViewModel.java`:

```java
package com.yourname.inventoryapp.notifications;

import android.app.Application;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

public class NotificationsViewModel extends AndroidViewModel {
    private final NotificationRepository repository;

    public NotificationsViewModel(Application application) {
        super(application);
        this.repository = new NotificationRepository(application);
    }

    public LiveData<String> sendTestSms(String phoneNumber) {
        return repository.sendTestSms(phoneNumber);
    }
}
```

`NotificationsActivity.java`, the real change:

```java
binding.sendTestSmsButton.setOnClickListener((view) -> {
    String phoneNumber = binding.phoneNumberField.getText().toString();
    viewModel.sendTestSms(phoneNumber).observe(this, status -> {
        binding.statusText.setText(status);
    });
});
```

### Mechanical Walkthrough

- `NotificationRepository(Application application)` — the identical
  real `AndroidViewModel`-safe construction pattern Lesson 10 already
  established — `Application`, never a plain `Context` or an `Activity`.
- `sendTestSms(String phoneNumber)` returning `LiveData<String>` — the
  identical real, deliberate one-shot `MutableLiveData` shape
  `UserRepository.checkCredentials` already used (Lesson 09) — a real,
  single, freshly-built `LiveData` for one real answer, not a
  continuously-observed stream.
- The real permission check, the real `SmsManager` call, and the real
  `try`/`catch` — all reappearing, character-for-character, from
  `android-persistence-lab` Lesson 09 — moved, not rewritten. This
  lesson's own real point isn't new logic; it's the same, already-
  correct logic, now living where it architecturally belongs.
- `status.setValue(...)` — **not** `postValue`, unlike Lesson 09's own
  `UserRepository`. This real call runs entirely on the main thread —
  `ContextCompat.checkSelfPermission` and `sendTextMessage` are both
  real, fast, synchronous calls with no database or network work
  involved, so no background thread is genuinely required here, unlike
  Lesson 09's own real hash computation.
- `NotificationsViewModel.sendTestSms(...)` — a thin, direct pass-
  through, the identical real boundary reasoning Lessons 06 and 09
  already established.
- `viewModel.sendTestSms(phoneNumber).observe(this, status -> {...})`
  — **first appearance of observing a freshly-created, one-shot
  `LiveData` at the exact moment it's needed.** Called directly inside
  the click listener itself, deliberately not registered once, up
  front, the way `getAllItems()`'s own continuous `LiveData` is
  observed.

### Run It Yourself

Genuinely Android-only behavior — no plain-JVM equivalent proves it.
Run this lesson's own rearchitected version exactly the way
`android-persistence-lab` Lesson 09 already verified its original:
enter your own real phone number, tap "Send Test SMS," and confirm the
real message arrives, then revoke permission in system Settings and
confirm the status text correctly reports it instead of crashing. Real,
predicted result, grounded directly in that lesson's own already-
verified behavior (confirm it yourself on a real device): identical to
that lesson's own real, captured result, character for character — this
lesson's entire real point is that moving the logic changed *where* it
lives, not *what* it does.

### CS Lens

`NotificationsActivity` now contains zero real logic about *how* an
SMS is sent, *whether* permission is granted, or *what* a
`SecurityException` means — only *what to display* once
`NotificationsViewModel` reports a real result. This is MVVM's own real
architecture, applied to this series' very last remaining piece of
logic still living directly inside an `Activity`.

### SE Lens

**Why does `status.setValue(...)` run synchronously here, while
Lesson 09's own `UserRepository` deliberately used a background thread
and `postValue`?** The real, deciding difference is genuinely how
expensive the underlying work is: a real database read plus a real,
deliberately-slow cryptographic hash (Lesson 09) is real, measurable
work worth moving off the main thread; a permission check and handing
a string to the telephony stack are both fast, real, synchronous
operations Android's own APIs are documented to permit on the main
thread directly. Reaching for a background thread unconditionally,
regardless of whether the specific work actually warrants it, would be
real, unnecessary complexity — this lesson's own choice matches the
real cost of the work being done, not a blanket rule.

---

## Connect the Pieces

One trace: tapping "Send Test SMS" calls
`viewModel.sendTestSms(phoneNumber)`, receiving a real, one-shot
`LiveData<String>` back immediately. `NotificationsViewModel` passes
the call straight to `NotificationRepository`, which runs the identical
real permission check and `SmsManager` call
`android-persistence-lab` Lesson 09 already proved correct — now
architecturally isolated from `NotificationsActivity` entirely, which
only ever sees the final, real status string, through the same real
`LiveData` observation mechanism every other real feature in this
project already uses.

## What Breaks Without This

This lesson's own real cost, precisely: without this real boundary,
every future screen needing to know "was the last SMS sent
successfully" would need direct access to `NotificationsActivity`
itself — real, structural coupling this project's own architecture,
built since Lesson 02, exists specifically to prevent. `Repository`
and `ViewModel` make that real state a real, reusable, observable value
instead.

## Exercises

1. Add a second real observer of `sendTestSms(...)`'s own returned
   `LiveData`, logging the same status via `Log.d` — confirm both the
   real `TextView` update and the real log line happen, independently,
   from the exact same one-shot result.
2. Explain, in your own words, why this lesson's `sendTestSms` builds a
   *fresh* `MutableLiveData` on every single call, rather than one,
   shared field reused across calls the way `ItemRepository.getAllItems()`
   reuses Room's own single, continuously-live `LiveData`.
3. Confirm, on a real device, that a real SMS still genuinely arrives —
   the identical real verification `android-persistence-lab` Lesson 09
   already required, now proving this lesson's own real architectural
   move didn't change any actual, observable behavior.

## Definition of Done

- [ ] `NotificationsActivity` contains no direct `SmsManager` or
      permission-check logic — only a click listener and an observer.
- [ ] Sending a real SMS, and the real permission-denied and
      `SecurityException` cases, all behave identically to
      `android-persistence-lab` Lesson 09's own already-verified
      results.
- [ ] You can explain, precisely, why this lesson's own `LiveData` uses
      `setValue` while Lesson 09's `UserRepository` used `postValue`.
- [ ] Commit: `git commit -m "Move SMS sending logic into
      NotificationRepository/NotificationsViewModel"` — explaining the
      real architectural move, not just that the feature still works.

Next: dependency injection — manual first, then real `Hilt` — the real,
professional fix for every `new ItemRepository(application)`-style
constructor call this series has written by hand since Lesson 06.

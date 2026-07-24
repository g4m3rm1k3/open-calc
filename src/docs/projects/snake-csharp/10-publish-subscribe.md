# Lesson 10: Alan Kay's Idea, Realized Directly

*(Publish/Subscribe, via C# `event`)*

**User Story**
> As a player, I want the score display and an achievement system to both
> react when my score changes, without either one knowing the other exists.

**What you will build**
A real score-change notification system using C#'s `event` keyword — the
single clearest, most direct realization of Lesson 0's Alan Kay framing
anywhere in this project: independent objects, communicating purely through
messages, with the sender never knowing who — or how many — receivers exist.

**What you need to know first**
Lesson 0's messaging framing, stated explicitly there and cashed in fully
here. Lesson 6's properties (this lesson introduces a closely related, but
distinct, C# member kind: the event).

---

## Concept Unit: The Tightly Coupled Version, First

### The Problem

Worth seeing the alternative before the fix, so the fix's actual value is
concrete rather than assumed.

### Introduce the concept in isolation

```csharp
class RigidScoreTracker
{
    private int score = 0;
    private UiDisplay ui = new UiDisplay();
    private AchievementSystem achievements = new AchievementSystem();

    public void AddPoints(int points)
    {
        score += points;
        ui.OnScoreChanged(score);
        achievements.OnScoreChanged(score);
    }
}

class UiDisplay
{
    public void OnScoreChanged(int newScore) => Console.WriteLine($"[UI] Score: {newScore}");
}

class AchievementSystem
{
    public void OnScoreChanged(int newScore)
    {
        if (newScore >= 50) Console.WriteLine($"[Achievements] Unlocked: Half-Century ({newScore})");
    }
}
```

Run it:

```csharp
var rigidTracker = new RigidScoreTracker();
rigidTracker.AddPoints(10);
rigidTracker.AddPoints(45);
```

Real output — verified this session:

```text
[UI] Score: 10
[UI] Score: 55
[Achievements] Unlocked: Half-Century (55)
```

*What this proves:* this works completely correctly. The problem isn't
behavior — it's **coupling**. `RigidScoreTracker` directly constructs both
`UiDisplay` and `AchievementSystem`, and directly calls a specific method
on each, by name. Adding a third thing that should react to score changes —
a sound effect player, say — means editing `RigidScoreTracker` itself,
forever, every single time something new needs to know about a score
change. `RigidScoreTracker` has to know about every single one of its own
listeners, by name, permanently.

### Discard nothing yet — this version is kept as the direct contrast

`RigidScoreTracker` isn't deleted — it stays, specifically so the next unit
can be compared against it directly, line by line.

---

## Concept Unit: `event` — A Message With Any Number of Unknown Listeners

### The New Code

```csharp
class ScoreTracker
{
    public event Action<int>? ScoreChanged;
    private int score = 0;

    public void AddPoints(int points)
    {
        score += points;
        ScoreChanged?.Invoke(score);
    }
}
```

Run it with two independent subscribers:

```csharp
var tracker = new ScoreTracker();
var ui = new UiDisplay();
var achievements = new AchievementSystem();
tracker.ScoreChanged += ui.OnScoreChanged;
tracker.ScoreChanged += achievements.OnScoreChanged;
tracker.AddPoints(10);
tracker.AddPoints(45);
```

Real output — verified this session:

```text
[UI] Score: 10
[UI] Score: 55
[Achievements] Unlocked: Half-Century (55)
```

*What this proves:* **identical output** to the rigid version — but look at
`ScoreTracker` itself: it contains no reference to `UiDisplay` or
`AchievementSystem` anywhere in its own code, not even their names. It
declares one `event`, and fires it. `ui` and `achievements` were
connected entirely from *outside* `ScoreTracker`, by code that knows both
sides exist — `ScoreTracker` itself only ever knows "something, some
unknown number of somethings, might be listening."

### Mechanical walkthrough

1. `public event Action<int>? ScoreChanged;` — (first appearance) `event`
   declares a message this class can broadcast. `Action<int>` is a
   **delegate type** — "a method that takes one `int` and returns
   nothing" — describing the *shape* any listener must have, not naming
   any specific listener. The `?` marks it nullable — a brand-new event
   with nobody subscribed yet is genuinely `null`.
2. `ScoreChanged?.Invoke(score);` — (first appearance) `?.` is the **null-
   conditional operator** — `Invoke` only runs if `ScoreChanged` isn't
   `null`; if nobody has subscribed yet, this line safely does nothing at
   all, rather than crashing.
3. `tracker.ScoreChanged += ui.OnScoreChanged;` — (first appearance) `+=`
   on an event **subscribes** a method to it — `ui.OnScoreChanged`
   (a **method group** — the method itself, not a call to it, no
   parentheses) is added to the list of things that run when
   `ScoreChanged` fires. A second `+=` adds a second, completely
   independent subscriber — both run, in the order they were added,
   neither aware the other exists.
4. `UiDisplay`/`AchievementSystem` — completely unchanged from the rigid
   version — the exact same classes, just connected differently, from
   outside, instead of hardwired inside `ScoreTracker`.

### Proving it's genuinely decoupled: unsubscribing, and adding a third listener with zero changes to `ScoreTracker`

```csharp
var tracker = new ScoreTracker();
Action<int> logger = (score) => Console.WriteLine($"[Logger] Score changed to {score}");
tracker.ScoreChanged += logger;
tracker.AddPoints(5);
tracker.ScoreChanged -= logger;
tracker.AddPoints(5);
Console.WriteLine("Logger unsubscribed — no more log lines should appear above this.");
```

Real output — verified this session:

```text
[Logger] Score changed to 5
Logger unsubscribed — no more log lines should appear above this.
```

*What this proves:* `-=` genuinely removes a subscriber — the second
`AddPoints(5)` fires `ScoreChanged` exactly as before, but `logger` no
longer runs, because it was explicitly unsubscribed. Notice, too, that
`logger` here is a **lambda** (an inline, anonymous function) rather than a
named method on a class — `event` doesn't care what shape of thing is
listening, as long as it matches `Action<int>`'s signature.

### CS Lens — the direct payoff of Lesson 0's framing

This is Alan Kay's messaging idea, **exactly, with no metaphor needed**:
`ScoreTracker` sends a message (`ScoreChanged`) into the world, with
absolutely no knowledge of who — or how many recipients — will receive it.
Zero listeners, one listener, three listeners: `ScoreTracker`'s own code is
identical in every case. This is publish/subscribe, sometimes shortened to
"pub/sub" — `ScoreTracker` is the **publisher**; `UiDisplay`,
`AchievementSystem`, and the `logger` lambda are each **subscribers**,
each free to appear or disappear without the publisher ever being edited.

Also recognized in: every UI framework's event handlers (a button doesn't
know or care what code runs when it's clicked — this curriculum's WPF and
Kotlin/Compose courses both lean on exactly this mechanism), message
queues and event buses in real distributed systems (Kafka, RabbitMQ, and
similar), and the DOM's own `addEventListener` in every web browser — all,
underneath their specific names, the identical idea: a publisher
broadcasting a message with no fixed, hardcoded list of recipients.

### SE Lens

The real, concrete engineering win, stated precisely: `ScoreTracker` can be
written, tested, and shipped with **zero knowledge** of what will ever
listen to it — including things that don't exist yet. A future achievement
system, added a year later by a different developer who's never even seen
`ScoreTracker`'s source code, subscribes to `ScoreChanged` from the outside
and it just works, with literally no changes to `ScoreTracker` itself. This
is the open/closed principle (Lesson 5) again, at the scale of an entire
subsystem's communication rather than one method.

The honest cost: a publisher genuinely doesn't know what its subscribers
do, which means a slow or misbehaving subscriber can cause real problems
(a subscriber that throws an exception, for instance, can prevent later
subscribers in the same event from running at all) — decoupling isn't
free of any tradeoff, it trades "the publisher controls everything" for
"the publisher controls nothing about what happens after it sends a
message," and that trade is only worth it because, in this project and in
most real systems, the flexibility is worth far more than the control.

### Connection

Lesson 16's persistence subscribes to this same `ScoreChanged` event to
save a new high score the instant one happens — no changes to
`ScoreTracker` required. Lesson 11's Dependency Injection is the next,
related answer to the same underlying question this lesson just
answered — how do independent objects communicate without needing each
other's concrete details.

---

## Closing

### Connect the pieces

`RigidScoreTracker` (unit 1) works, but only by hardcoding a reference to
every one of its own listeners. `ScoreTracker`'s `event` (unit 2) produces
byte-for-byte identical output while knowing nothing about who's
listening — verified directly, including subscribing, unsubscribing, and
adding a completely new kind of listener (a lambda) without a single line
of `ScoreTracker` itself changing. This is Lesson 0's Alan Kay framing,
made as concrete as this project ever makes it.

### What breaks without this

Remove the `?` from `ScoreChanged`'s declaration (making it
`Action<int> ScoreChanged;`, non-nullable) and call `AddPoints` before
anything subscribes. Real, observable failure: a `NullReferenceException`
the moment `ScoreChanged.Invoke(score)` runs with nobody subscribed — the
`?.` null-conditional operator was doing real, load-bearing work, not
decoration. Restore the nullable event and the safe `?.Invoke` call
together and firing an event with zero subscribers becomes safe again.

### Exercises

- Trigger the real `NullReferenceException` above yourself, then restore
  the fix.
- Add a fourth, genuinely new kind of subscriber — a sound-effect stub that
  just prints `"*ding*"` — and confirm it subscribes with zero changes to
  `ScoreTracker`.
- Write down, in your own words, why this lesson's `ScoreTracker` and
  Lesson 5's `IDrawable` are both real examples of the same underlying
  messaging idea, even though one uses `event` and the other uses an
  `interface`.

### Definition of done

- [ ] The rigid and decoupled versions produce identical output, verified
      side by side.
- [ ] You added a new subscriber with zero changes to `ScoreTracker`.
- [ ] You triggered the real `NullReferenceException` and fixed it.
- [ ] You can explain, concretely and without re-reading this lesson, how
      this connects to Alan Kay's messaging idea from Lesson 0.
- [ ] Commit: `git commit -m "Add ScoreTracker with a real publish/subscribe event — the score display and achievements both react independently"`.

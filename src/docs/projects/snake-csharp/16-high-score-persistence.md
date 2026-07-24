# Lesson 16: Surviving Closing the Program

*(High Score Persistence)*

**User Story**
> As a player, I want my best score to still be there the next time I open
> the game.

**What you will build**
The high score saved to a real file on disk, reloaded automatically the
next time the game starts — subscribing to Lesson 10's `ScoreChanged`
event to know exactly when a new high score has actually happened.

**What you need to know first**
Lesson 10's `event`/pub-sub mechanism and Lesson 3's `record` — this lesson
adds a third, brand-new subscriber to `ScoreChanged` with zero changes to
`ScoreTracker` itself, the exact payoff that lesson promised.

---

## Concept Unit: Serializing a `record` to JSON

### The Problem

Everything in this game currently lives only in memory — closing the
program loses the high score entirely.

### Introduce the concept in isolation

```csharp
using System.Text.Json;

var scores = new HighScoreData(BestScore: 0, PlayerName: "none yet");
Console.WriteLine($"Before: {scores.BestScore} by {scores.PlayerName}");

scores = scores with { BestScore = 120, PlayerName = "Ada" };
string json = JsonSerializer.Serialize(scores);
Console.WriteLine($"Serialized: {json}");

record HighScoreData(int BestScore, string PlayerName);
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Before: 0 by none yet
Serialized: {"BestScore":120,"PlayerName":"Ada"}
```

*What this proves:* `scores with { BestScore = 120, PlayerName = "Ada" }`
produced a brand-new `HighScoreData`, leaving the original untouched — a
**non-destructive update**, real syntax specific to `record` types.
`JsonSerializer.Serialize` turned that record directly into a real JSON
string, with property names matching the record's own field names
automatically — no manual string-building required.

### Mechanical walkthrough

1. `new HighScoreData(BestScore: 0, PlayerName: "none yet")` — (hard
   concept reappearing) `record`'s primary constructor, this time called
   with **named arguments** (Lesson 0's mechanism, applied to a
   constructor) — `BestScore: 0` reads clearly even though `HighScoreData`
   only has two fields.
2. `scores with { BestScore = 120, PlayerName = "Ada" }` — (first
   appearance) the **`with` expression** — available specifically because
   `HighScoreData` is a `record`: it creates a full copy of `scores`, with
   only the listed fields changed, leaving the original `scores` variable
   pointing at the old, unmodified object.
3. `JsonSerializer.Serialize(scores)` — (first appearance) part of
   `System.Text.Json`, .NET's built-in JSON library — converts any object
   (here, specifically taking advantage of `record`'s auto-generated
   properties) into a JSON-formatted string.

### CS Lens

`with` expressions exist specifically because `record`s are meant to
represent **immutable values** — Lesson 3 already established this for
`Position`; here it matters for a different reason: an object representing
"the high score as of this exact moment" should never be silently mutated
in place elsewhere in the program while something else is still holding a
reference to the "before" version — `with` guarantees a genuinely new
object instead.

### Connection

The next unit writes this exact JSON to a real file, and reads it back.

---

## Concept Unit: Reading and Writing a Real File

### The New Code

```csharp
HighScoreData LoadHighScore(string path)
{
    if (!File.Exists(path))
    {
        return new HighScoreData(0, "none yet");
    }
    string json = File.ReadAllText(path);
    return JsonSerializer.Deserialize<HighScoreData>(json)!;
}

void SaveHighScore(string path, HighScoreData data)
{
    string json = JsonSerializer.Serialize(data);
    File.WriteAllText(path, json);
}
```

Run a full round trip:

```csharp
var scores = new HighScoreData(0, "none yet") with { BestScore = 120, PlayerName = "Ada" };
SaveHighScore("highscore.json", scores);

var loaded = LoadHighScore("highscore.json");
Console.WriteLine($"Loaded from disk: {loaded.BestScore} by {loaded.PlayerName}");
```

Real output — verified this session:

```text
Loaded from disk: 120 by Ada
```

*What this proves:* a genuinely separate run of `LoadHighScore` — reading
from disk, not from any variable still in memory — correctly reconstructed
the exact same data that was saved.

### Handling the very first launch, honestly

```csharp
var scores = LoadHighScore("does-not-exist-yet.json");
Console.WriteLine($"First launch: {scores.BestScore} by {scores.PlayerName}");
```

Real output — verified this session:

```text
First launch: 0 by none yet
```

*What this proves:* `File.Exists(path)` correctly detects a missing save
file and returns a sensible default, rather than crashing the very first
time the game is ever run, before any score has ever been saved.

### Mechanical walkthrough

1. `File.Exists(path)` — (first appearance) checks whether a file exists at
   all, without attempting to open it — checked *before* trying to read,
   avoiding a crash on the very first run.
2. `File.ReadAllText(path)` / `File.WriteAllText(path, json)` — (first
   appearance) read or write an entire file's contents as one `string`, in
   one call — the simplest possible file I/O, appropriate for a small
   JSON file like this one.
3. `JsonSerializer.Deserialize<HighScoreData>(json)!` — (hard concept
   reappearing) `Deserialize<T>` is a **generic method** (Lesson 0's
   `List<T>` idea, applied to a method instead of a class) — `<HighScoreData>`
   tells it exactly what shape of object to reconstruct from the JSON
   text. The `!` (Lesson 0's `null`-handling territory) asserts "trust me,
   this won't be `null`" — honest here specifically because a
   successfully-read, valid JSON file for this exact type genuinely won't
   deserialize to `null`.

### Connection

The next unit is what actually decides *when* to call `SaveHighScore` —
which turns out to already exist, from Lesson 10.

---

## Concept Unit: Subscribing Persistence to `ScoreChanged`

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** Wherever `ScoreTracker` (Lesson 10) is set up.
- **Change type:** Add a new subscriber.
- **Location:** Anywhere `ScoreTracker.ScoreChanged` is already being
  subscribed to.
- **Dependencies:** `ScoreTracker`, `LoadHighScore`, `SaveHighScore`.

### The New Code

```csharp
var currentHighScore = LoadHighScore("highscore.json");

tracker.ScoreChanged += (newScore) =>
{
    if (newScore > currentHighScore.BestScore)
    {
        currentHighScore = currentHighScore with { BestScore = newScore };
        SaveHighScore("highscore.json", currentHighScore);
    }
};
```

### CS Lens

This is the exact, direct payoff Lesson 10 promised: persistence is a
**completely new subscriber**, added from outside `ScoreTracker`, with
zero changes to `ScoreTracker`'s own source code — the same class already
notifying the UI and achievements now also, trivially, notifies
persistence, because `event` was never written to assume a fixed number of
listeners.

### SE Lens

Why check `newScore > currentHighScore.BestScore` before saving, rather
than saving on every single score change? Writing to disk is meaningfully
slower than an in-memory operation — saving only when the high score
actually improves avoids needless disk writes on every single point
scored during ordinary play, a small, real performance consideration named
directly rather than left implicit.

---

## Closing

### Connect the pieces

`with` expressions and `JsonSerializer` (unit 1) turn a `record` into
saveable, reloadable text. `File.Exists`/`ReadAllText`/`WriteAllText`
(unit 2) handle the actual disk I/O, including the honest first-launch
case with no existing save file. Subscribing to `ScoreChanged` (unit 3) is
where persistence actually happens — proof, concretely, that Lesson 10's
pub/sub design meant adding a whole new feature required touching nothing
in `ScoreTracker` at all.

### What breaks without this

Delete the `File.Exists(path)` check, calling `File.ReadAllText` directly
on every launch. Real, observable failure on a genuinely first launch (no
save file yet): a real, uncaught `FileNotFoundException` crashes the
entire game before it can even show the menu. Restore the check and the
first launch is handled gracefully, with a sensible default.

### Exercises

- Trigger the real `FileNotFoundException` above yourself, then restore
  the fix.
- Extend `HighScoreData` to also store the date the record was set, using
  `DateTime.Now` — confirm it serializes and deserializes correctly
  alongside the existing fields.

### Definition of done

- [ ] The high score correctly survives closing and reopening the game,
      verified by actually doing it.
- [ ] The very first launch, with no save file, doesn't crash, verified
      directly.
- [ ] You can explain, in your own words, why adding this feature required
      zero changes to `ScoreTracker` itself.
- [ ] Commit: `git commit -m "Add high score persistence via JSON, subscribing to the existing ScoreChanged event"`.

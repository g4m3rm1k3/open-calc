# Concept: `Dictionary<TKey, TValue>` and Safe Lookups With `TryGetValue`

**What you'll understand by the end:** C#'s key-value lookup collection, why reading a missing key with the indexer throws instead of returning a sentinel value, and `TryGetValue` as the safe, non-throwing alternative that answers "does this exist, and what is it" in one call.

**Prerequisites:** `csharp-classes-objects-and-fields.md`.

## Setup

```
dotnet new console -o lab-dictionary
cd lab-dictionary
```
Replace the generated `Program.cs`'s contents with each example below in turn.

## The Problem

Some data is naturally looked up by a meaningful name or key rather than by position — a price by product name, a score by player name. Reading that value back needs a collection that maps one value (the key) to another (the value it's associated with), and — separately — a safe way to ask "is this key even here" without risking a crash on every lookup that might legitimately miss.

## The Isolated Example

```csharp
Dictionary<string, int> scores = new Dictionary<string, int>();
scores["Alice"] = 90;
scores["Bob"] = 75;

Console.WriteLine(scores["Alice"]);
Console.WriteLine(scores.ContainsKey("Carol"));
Console.WriteLine(scores["Carol"]);
```

**Real output up to the crash — `dotnet run`:**
```
90
False
```

**Real, captured crash on the last line:**
```
Unhandled exception. System.Collections.Generic.KeyNotFoundException: The given key 'Carol' was not present in the dictionary.
   at System.Collections.Generic.Dictionary`2.get_Item(TKey key)
   at Program.<Main>$(String[] args) in Program.cs:line 7
```

**What this proves:** `scores["Alice"] = 90;` and `scores["Bob"] = 75;` use the indexer to *write* — if the key doesn't exist yet, it's added; `scores["Alice"]` reads it back correctly. `scores.ContainsKey("Carol")` safely reports `False` with no risk of crashing. But `scores["Carol"]` — reading a key that was never set with the plain indexer — throws a real `KeyNotFoundException`. The indexer's read behavior is: return the value if the key exists, throw if it doesn't. There is no third option.

**Now the safe alternative — `TryGetValue`:**
```csharp
Dictionary<string, int> scores = new Dictionary<string, int>();
scores["Alice"] = 90;
scores["Bob"] = 75;

int aliceScore = scores.TryGetValue("Alice", out int foundAlice) ? foundAlice : -1;
Console.WriteLine($"Alice score: {aliceScore}");

int carolScore = scores.TryGetValue("Carol", out int foundCarol) ? foundCarol : -1;
Console.WriteLine($"Carol score: {carolScore}");
```

**Real output:**
```
Alice score: 90
Carol score: -1
```

**What this proves:** `TryGetValue` never crashed on the missing `"Carol"` key — it returned `false`, and the `? :` ternary picked the fallback `-1`. This is a completely safe alternative to the indexer's crash-on-missing-key behavior proven above, with no `try`/`catch` needed anywhere.

## Mechanical Walkthrough

- `Dictionary<string, int>` — a **generic type**: `Dictionary` alone isn't a complete, usable type — `<string, int>` fills in its two generic type parameters, `TKey` and `TValue`, saying "this specific dictionary maps `string` keys to `int` values." A `Dictionary<int, string>` would be a completely different, equally valid dictionary shape.
- `new Dictionary<string, int>()` — builds a real, empty dictionary object.
- `scores["Alice"] = 90;` — the **indexer**, used to *write*: if `"Alice"` isn't a key yet, this adds it; if it already exists, this overwrites its value.
- `scores["Alice"]` (read context) — the same indexer syntax, now *reading* — returns the value stored under that key, or throws if the key was never set.
- `scores.ContainsKey("Carol")` — checks whether a key exists at all, returning `true`/`false`, without ever risking the exception a direct `[...]` read on a missing key would.
- `scores.TryGetValue("Alice", out int foundAlice)` — takes the key to look up, plus a second parameter marked `out`: instead of *returning* the found value the normal way, it hands it back *through* that `out` parameter, while its real return value is a separate `bool` — `true` if the key existed, `false` if it didn't. `int foundAlice` inside the `out` position declares a brand-new variable right there, in the argument list itself.
- `... ? foundAlice : -1` — a ternary: if `TryGetValue` returned `true`, use `foundAlice` (the value it just handed back); otherwise, fall back to `-1`. `foundAlice` genuinely holds a real value either way (C# requires this), but only the `true` branch's value is meaningful here.

## CS Lens

A dictionary is a **hash table** — real-world data addressed by a meaningful key instead of an arbitrary position, the same underlying data structure across nearly every language, just named and typed differently (`dict` in Python, `HashMap` in Java, `Dictionary` here). `TryGetValue`'s two-outputs-in-one-call shape (a `bool` success flag *and* a real value, together) is the **Try-Parse pattern** — a deliberate convention (`int.TryParse`, `Dictionary.TryGetValue`, `Dictionary.TryAdd`, and others) that turns "this might not work" into one call producing both "did it work" and "here's the result," instead of "throws an exception, catch it" or "returns a special sentinel value that might be confused with a real one."

Also recognized in: any lookup-by-name problem — a phone book, a cache keyed by request URL, a symbol table in a compiler mapping variable names to their declared types; Python's own `dict.get(key, default)` solves the identical safe-lookup need with a different-shaped solution, returning the fallback directly instead of a success/value pair.

## SE Lens

The alternative to a dictionary — a list of key-value pairs, searched linearly for a matching key every time — technically works but gets slower as the list grows, checking every entry one by one. A real dictionary looks a key up directly, without scanning past entries that don't match, which is the entire reason it exists as its own data structure rather than "just a list you search." Separately, the alternative to `TryGetValue` — always using the indexer and wrapping it in a `try`/`catch` for the missing-key case — genuinely works, but exception handling is comparatively expensive and reads as "this is expected to fail sometimes," when a missing key is often a completely normal, anticipated case, not an exceptional one. `TryGetValue` treats "not found" as an ordinary `false`, not a thrown error.

## Connection

Any code that needs to look something up by name, and needs to handle "that name doesn't exist yet" as a normal, expected case rather than a crash, reaches for exactly this pair: a `Dictionary<TKey, TValue>` for storage, `TryGetValue` for the read.

## Try It Yourself

1. Build a `Dictionary<int, string>` (keys and values swapped from the example) mapping ID numbers to names. Confirm the generic type parameters really do determine what's a valid key vs. value — try using a `string` as a key and read the real compiler error.
2. Replace the `? :` fallback with `scores.GetValueOrDefault("Carol", -1)` (a real, built-in `Dictionary` method) and confirm it produces the identical result to the `TryGetValue`/ternary version, with less code.
3. Set `scores["Alice"] = 100;` a second time, after it was already `90`, and confirm the indexer overwrote the existing value rather than throwing or creating a second entry — the indexer's write behavior treats "key exists" and "key doesn't exist yet" identically, unlike its read behavior.

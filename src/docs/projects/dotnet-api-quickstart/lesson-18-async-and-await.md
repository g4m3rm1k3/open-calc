# Lesson 18: Async and Await — Just Enough to Read It

**What this covers:** `async`, `await`, `Task`, and `Task<T>` — enough
to read and correctly call a real, unfamiliar API method that uses
them, without needing the full, real threading model underneath.

**What you need first:** [Lesson 02](lesson-02-reading-an-unfamiliar-types-shape.md).

**One real, honest note:** not every host API uses this at all — many
real add-in APIs are fully synchronous by design, since they run
inside one, real, live host process on one real thread. This lesson is
"just enough to read it," for if and when you actually see it.

---

## The real problem this solves

Some real operations genuinely take time — a real network call, a
real file load, a real, slow host operation — and you don't want your
whole real program frozen while waiting. Python solves this with
`async def` / `await`; C# uses the identical, real idea, with almost
identical, real syntax.

## Reading the real signature

```csharp
public async Task<string> GetPartNameAsync(int partId)
{
    string name = await _database.LoadNameAsync(partId);
    return name;
}
```

`Task<string>` is a real "promise of a `string`, eventually" — the
real method hasn't necessarily finished by the time it returns this
`Task<string>`; it's returned a real, live handle to the *eventual*
result. `Task` alone (no `<T>`) is the identical, real idea for a
method that would otherwise be `void` — "a promise this eventually
finishes, no value attached." The real `Async` suffix on the method
name is a real, universal .NET naming convention, not a language
requirement — a strong, real signal the moment you see it in an
unfamiliar API's documentation.

## `await`: real, pause here until it's done

`await _database.LoadNameAsync(partId)` real, pauses *this* method
right here until the real, inner `Task` completes — but, critically,
without blocking the real thread it's running on, which is free to do
other, real work in the meantime. Once it completes, execution real,
resumes on the next line, with `name` now holding the real, actual
`string` value — not the `Task` wrapper itself.

## Calling an async method

```csharp
public async Task RunAsync()
{
    string name = await GetPartNameAsync(5);
    Console.WriteLine(name);
}
```

Once you `await` inside a method, that method itself real, has to be
marked `async` too — and its own real return type becomes `Task` or
`Task<T>`, following the identical, real pattern up the chain. This is
sometimes called "async all the way" — a real, common, honest
complaint about the model, but also the real reason it's safe: nothing
downstream is ever real, silently blocked waiting.

## The one, real exception: event handlers

```csharp
private async void Button_Click(object sender, RoutedEventArgs e)
{
    string name = await GetPartNameAsync(5);
    NameLabel.Text = name;
}
```

`async void` (rather than `async Task`) is real and normally
discouraged — except for a real, genuine UI event handler like a
button click, which is the one, standard place it's real and correct,
because a real event handler's signature can't be changed to return a
`Task` at all.

## The real trap: never force it synchronous

```csharp
// Don't do this — real, common cause of a UI deadlock
string name = GetPartNameAsync(5).Result;
```

Calling `.Result` or `.Wait()` on a real `Task` blocks the current,
real thread until it finishes — and in a real WPF app, that thread is
often the one, real UI thread the async operation itself needs free to
finish on, producing a real, genuine deadlock. The real, correct fix
is always the same: make the calling method `async` too, and `await`
it properly, instead of forcing a synchronous wait.

## Definition of done

- [ ] You can read a real `Task<T>` return type and state, in your own
      words, what it represents.
- [ ] You wrote a real `async`/`await` method chain and can explain
      why `await` doesn't block the current thread.
- [ ] You can state, in your own words, why `async void` is normally
      avoided, and the one, real case it's correct.
- [ ] You can explain, in your own words, why calling `.Result` on a
      `Task` from a UI thread is dangerous.

## Next

This is the last lesson in this series. Across eighteen lessons, you
now have the real, direct literacy this series set out to give you:
what an interface is and why real APIs hand them to you (01), how to
read an unfamiliar signature (02), two real ways to discover an API's
shape — reflection (03) and Visual Studio itself (04) — what a Class
Library is and how a host loads one (05), the `UserControl` shape a
real add-in template uses (06), how a real app pulls in libraries
(07), logs (08), and configures itself (09), how to navigate an
unfamiliar solution (10), the real syntax gaps from Python (11), a
real, built-in fix for numeric-code lookups (12), handling real
failures safely (13), querying collections the real, idiomatic way
(14), the real, other direction a host talks to you (15), why a method
you never wrote still shows up on a type (16), the real, direct
equivalent of "print stuff and look at it" (17), and just enough to
read a real, unfamiliar `async` signature (18). From here, the real,
remaining unknowns are specific to your own host application's actual
API — and that's exactly what your real documentation at work is for.

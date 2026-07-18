import type { PracticeChallenge } from './loader'

export const title = 'Nullable Reference Types (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'With `#nullable enable`, declare `string city = "Paris";` and print `city.Length` directly (non-nullable, always safe). Declare `string? maybeCity = null;`, and use `if (maybeCity != null)` to print `.Length` or otherwise print `"maybeCity was null, skipped safely"`. Reassign `maybeCity = "Berlin";` and repeat the same check-then-print.',
        starter: '',
        tests: `
assert output === '5\\nmaybeCity was null, skipped safely\\n6'
`,
        solution: `#nullable enable
using System;

string city = "Paris";
Console.WriteLine(city.Length);

string? maybeCity = null;

if (maybeCity != null)
{
    Console.WriteLine(maybeCity.Length);
}
else
{
    Console.WriteLine("maybeCity was null, skipped safely");
}

maybeCity = "Berlin";
if (maybeCity != null)
{
    Console.WriteLine(maybeCity.Length);
}
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Fix `main`: `maybeCity!.Length` uses the null-forgiving operator (`!`) to silence the compiler\'s nullable warning WITHOUT actually verifying `maybeCity` is non-null — since `GetCity()` genuinely returns `null`, this throws a REAL `NullReferenceException` at runtime; `!` only suppresses the WARNING, it does nothing to prevent the crash. Replace it with a real `if (maybeCity != null)` check, printing `.Length` if present or `"no city available"` otherwise.',
        starter: `#nullable enable
using System;

string? maybeCity = GetCity();
Console.WriteLine(maybeCity!.Length);

string? GetCity()
{
    return null;
}
`,
        tests: `
assert output === 'no city available'
`,
        solution: `#nullable enable
using System;

string? maybeCity = GetCity();
if (maybeCity != null)
{
    Console.WriteLine(maybeCity.Length);
}
else
{
    Console.WriteLine("no city available");
}

string? GetCity()
{
    return null;
}
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Write `string? FindNickname(string name)` returning `"Bob"` for `"Robert"`, `"Bill"` for `"William"`, otherwise `null`. For each name in `{"Robert", "Charlie", "William"}`, compute `string nickname = FindNickname(name) ?? "(no nickname)";` using the NULL-COALESCING operator `??` to supply a default inline (instead of an explicit `if`/`else`), and print `$"{name}: {nickname}"`.',
        starter: '',
        tests: `
assert output === 'Robert: Bob\\nCharlie: (no nickname)\\nWilliam: Bill'
`,
        solution: `#nullable enable
using System;

string? FindNickname(string name)
{
    if (name == "Robert") return "Bob";
    if (name == "William") return "Bill";
    return null;
}

string[] names = { "Robert", "Charlie", "William" };

foreach (var name in names)
{
    string nickname = FindNickname(name) ?? "(no nickname)";
    Console.WriteLine($"{name}: {nickname}");
}
`,
      },
    ],
  },
]

export default challenges

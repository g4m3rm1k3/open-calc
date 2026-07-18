import type { PracticeChallenge } from './loader'

export const title = 'Extension Methods (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Write `public static class StringExtensions` with `public static int WordCount(this string s)`, splitting on `\' \'` (removing empty entries) and returning the resulting array\'s `.Length`. Print `"hello world foo".WordCount()` and `"single".WordCount()`. Then print whether `StringExtensions.WordCount("a b c")` (explicit static call) equals `"a b c".WordCount()` (extension-method call) — both compile to the exact same call.',
        starter: '',
        tests: `
assert output === '3\\n1\\nTrue'
`,
        solution: `using System;
using System.Linq;

Console.WriteLine("hello world foo".WordCount());
Console.WriteLine("single".WordCount());

Console.WriteLine(StringExtensions.WordCount("a b c") == "a b c".WordCount());

public static class StringExtensions
{
    public static int WordCount(this string s)
    {
        return s.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    }
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
        prompt: 'Fix `main`: `IsPalindrome` is defined inside a `MyExtensions` namespace, but there\'s no `using MyExtensions;` at the top — an extension method is only found by the compiler if its containing static class\'s namespace is actually imported, so `"racecar".IsPalindrome()` is a COMPILE ERROR as written. Add `using MyExtensions;` (and `using System.Linq;`, needed for `.Reverse()`) at the top of the file.',
        starter: `using System;

Console.WriteLine("racecar".IsPalindrome());

namespace MyExtensions
{
    public static class StringExtensions
    {
        public static bool IsPalindrome(this string s)
        {
            var reversed = new string(s.Reverse().ToArray());
            return s == reversed;
        }
    }
}
`,
        tests: `
assert output === 'True'
`,
        solution: `using System;
using System.Linq;
using MyExtensions;

Console.WriteLine("racecar".IsPalindrome());

namespace MyExtensions
{
    public static class StringExtensions
    {
        public static bool IsPalindrome(this string s)
        {
            var reversed = new string(s.Reverse().ToArray());
            return s == reversed;
        }
    }
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
        prompt: 'Write `public static class EnumerableExtensions` with `public static IEnumerable<int> OnlyEven(this IEnumerable<int> source)`, using `yield return` inside a `foreach` to lazily yield only the even elements. Given `numbers = { 1..8 }`, chain your custom extension with a BUILT-IN LINQ one: `numbers.OnlyEven().Select(n => n * n).ToList()` — print the joined result, demonstrating a custom extension method composing seamlessly with LINQ\'s own (also extension-method-based) API.',
        starter: '',
        tests: `
assert output === '4, 16, 36, 64'
`,
        solution: `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8 };

var result = numbers.OnlyEven().Select(n => n * n).ToList();
Console.WriteLine(string.Join(", ", result));

public static class EnumerableExtensions
{
    public static IEnumerable<int> OnlyEven(this IEnumerable<int> source)
    {
        foreach (var n in source)
        {
            if (n % 2 == 0) yield return n;
        }
    }
}
`,
      },
    ],
  },
]

export default challenges

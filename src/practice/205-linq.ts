import type { PracticeChallenge } from './loader'

export const title = 'LINQ (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Given `var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9 };`, compute `resultMethod` using METHOD syntax (`.Where(n => n % 3 == 0).Select(n => n * 10).ToList()`) and `resultQuery` using QUERY syntax (`from n in numbers where n % 3 == 0 select n * 10`, then `.ToList()`) — print both as comma-joined strings (`string.Join(", ", ...)`), then print `resultMethod.SequenceEqual(resultQuery)`.',
        starter: '',
        tests: `
assert output === '30, 60, 90\\n30, 60, 90\\nTrue'
`,
        solution: `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9 };

var resultMethod = numbers.Where(n => n % 3 == 0).Select(n => n * 10).ToList();
Console.WriteLine(string.Join(", ", resultMethod));

var resultQuery = (from n in numbers where n % 3 == 0 select n * 10).ToList();
Console.WriteLine(string.Join(", ", resultQuery));

Console.WriteLine(resultMethod.SequenceEqual(resultQuery));
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Fix `main`: `query = numbers.Where(n => n > 1)` is NOT materialized — LINQ is lazy, so it holds a DESCRIPTION, not a snapshot. Adding `4` and `5` to `numbers` AFTER defining `query` but BEFORE printing it means the printed result reflects the LATEST state of `numbers` (`"2, 3, 4, 5"`) instead of a snapshot from definition time. Add `.ToList()` right after `.Where(...)` so `query` is immediately materialized, unaffected by the later `Add` calls.',
        starter: `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3 };

var query = numbers.Where(n => n > 1);

numbers.Add(4);
numbers.Add(5);

Console.WriteLine(string.Join(", ", query));
`,
        tests: `
assert output === '2, 3'
`,
        solution: `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3 };

var query = numbers.Where(n => n > 1).ToList();

numbers.Add(4);
numbers.Add(5);

Console.WriteLine(string.Join(", ", query));
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Given `numbers = { 1, 2, 3 }` and an `int evaluationCount = 0`, build a lazy `query = numbers.Select(n => { evaluationCount++; return n * n; })`. Materialize it ONCE with `var materialized = query.ToList();`, then compute `materialized.Sum()` and `string.Join(", ", materialized)` — reusing the already-materialized list for BOTH, instead of re-enumerating `query`. Print the sum, the joined string, and `evaluationCount` — it should stay at `3` (one evaluation per element), not double from redundant re-computation.',
        starter: '',
        tests: `
assert output === '14\\n1, 4, 9\\n3'
`,
        solution: `using System;
using System.Collections.Generic;
using System.Linq;

var numbers = new List<int> { 1, 2, 3 };
int evaluationCount = 0;

var query = numbers.Select(n =>
{
    evaluationCount++;
    return n * n;
});

var materialized = query.ToList();

int sum = materialized.Sum();
string joined = string.Join(", ", materialized);

Console.WriteLine(sum);
Console.WriteLine(joined);
Console.WriteLine(evaluationCount);
`,
      },
    ],
  },
]

export default challenges

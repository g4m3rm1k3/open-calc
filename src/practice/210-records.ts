import type { PracticeChallenge } from './loader'

export const title = 'Records (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Declare `public record Money(string Currency, int Amount);`. Create `m1 = new Money("USD", 100)`, `m2 = new Money("USD", 100)`, `m3 = new Money("EUR", 100)`. Print `m1 == m2` (value-based equality, `True`) and `m1 == m3` (`False`), then print `m1` (auto-generated `ToString()`). Create `m4 = m1 with { Amount = 250 }`, print `m4` and then `m1` again — `m1` itself is unchanged.',
        starter: '',
        tests: `
assert output === 'True\\nFalse\\nMoney { Currency = USD, Amount = 100 }\\nMoney { Currency = USD, Amount = 250 }\\nMoney { Currency = USD, Amount = 100 }'
`,
        solution: `using System;

var m1 = new Money("USD", 100);
var m2 = new Money("USD", 100);
var m3 = new Money("EUR", 100);

Console.WriteLine(m1 == m2);
Console.WriteLine(m1 == m3);

Console.WriteLine(m1);

var m4 = m1 with { Amount = 250 };
Console.WriteLine(m4);
Console.WriteLine(m1);

public record Money(string Currency, int Amount);
`,
      },
    ],
  },
  {
    level: 2,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Fix `Point`: it\'s a plain `class` with manually-written properties and a constructor — plain classes use REFERENCE equality by default, so `p1 == p2` incorrectly prints `False` even though both hold `X=1, Y=2`. Replace the whole class with a single-line `public record Point(int X, int Y);`, which gets value-based equality automatically.',
        starter: `using System;

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

Console.WriteLine(p1 == p2);

public class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}
`,
        tests: `
assert output === 'True'
`,
        solution: `using System;

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);

Console.WriteLine(p1 == p2);

public record Point(int X, int Y);
`,
      },
    ],
  },
  {
    level: 3,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Declare `public record Employee(string Name, string Role, int Salary);`. Create `original = new Employee("Alice", "Engineer", 80000)`. Use `with` to create `promoted` (changing `Role` to `"Senior Engineer"` and `Salary` to `95000`), then use `with` AGAIN on `promoted` to create `renamed` (changing `Name` to `"Alicia"`). Print `original`, `promoted`, and `renamed` — each `with` produces a new record, and `original` stays untouched through both chained modifications.',
        starter: '',
        tests: `
assert output === 'Employee { Name = Alice, Role = Engineer, Salary = 80000 }\\nEmployee { Name = Alice, Role = Senior Engineer, Salary = 95000 }\\nEmployee { Name = Alicia, Role = Senior Engineer, Salary = 95000 }'
`,
        solution: `using System;

var original = new Employee("Alice", "Engineer", 80000);

var promoted = original with { Role = "Senior Engineer", Salary = 95000 };
var renamed = promoted with { Name = "Alicia" };

Console.WriteLine(original);
Console.WriteLine(promoted);
Console.WriteLine(renamed);

public record Employee(string Name, string Role, int Salary);
`,
      },
    ],
  },
]

export default challenges

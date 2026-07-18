import type { PracticeChallenge } from './loader'

export const title = 'Properties (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Write `BankAccount` with an auto-property `Owner` and a `Balance` property backed by `private int _balance` — its `set` throws `ArgumentException("balance can\'t be negative")` if `value < 0` before ever touching `_balance`. Set `Owner = "Bob"` and `Balance = 100`, print both. Then `try` setting `Balance = -50`, `catch (ArgumentException e)` and print `$"caught: {e.Message}"`, then print `Balance` again — it should still be `100`.',
        starter: '',
        tests: `
assert output === "Bob has 100\\ncaught: balance can't be negative\\nBalance is still: 100"
`,
        solution: `using System;

var account = new BankAccount();
account.Owner = "Bob";
account.Balance = 100;
Console.WriteLine($"{account.Owner} has {account.Balance}");

try
{
    account.Balance = -50;
}
catch (ArgumentException e)
{
    Console.WriteLine($"caught: {e.Message}");
}
Console.WriteLine($"Balance is still: {account.Balance}");

public class BankAccount
{
    private int _balance;

    public string Owner { get; set; } = "";

    public int Balance
    {
        get => _balance;
        set
        {
            if (value < 0) throw new ArgumentException("balance can't be negative");
            _balance = value;
        }
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
        prompt: 'Fix `Person`: `FullName` is a plain FIELD, computed ONCE in the constructor from `first`/`last` — if `FirstName` changes later, `FullName` goes stale and doesn\'t reflect the update. Replace the field with a computed, read-only PROPERTY: `public string FullName => $"{FirstName} {LastName}";`, so it\'s always derived fresh from the current `FirstName`/`LastName` on every access, with no separate field to go stale.',
        starter: `using System;

var p = new Person("Alice", "Smith");
Console.WriteLine(p.FullName);

p.FirstName = "Alicia";
Console.WriteLine(p.FullName);

public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName;

    public Person(string first, string last)
    {
        FirstName = first;
        LastName = last;
        FullName = $"{first} {last}";
    }
}
`,
        tests: `
assert output === 'Alice Smith\\nAlicia Smith'
`,
        solution: `using System;

var p = new Person("Alice", "Smith");
Console.WriteLine(p.FullName);

p.FirstName = "Alicia";
Console.WriteLine(p.FullName);

public class Person
{
    public string FirstName { get; set; }
    public string LastName { get; set; }

    public string FullName => $"{FirstName} {LastName}";

    public Person(string first, string last)
    {
        FirstName = first;
        LastName = last;
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
        prompt: 'Write `Order` with a READ-ONLY auto-property `public int Id { get; }` (settable only from the constructor) and a normal read-write auto-property `public string ItemName { get; set; }`. Construct `new Order(1001, "Widget")`, print `$"{order.Id}: {order.ItemName}"`, then set `order.ItemName = "Gadget"` and print again — `Id` stays fixed while `ItemName` is freely mutable afterward.',
        starter: '',
        tests: `
assert output === '1001: Widget\\n1001: Gadget'
`,
        solution: `using System;

var order = new Order(1001, "Widget");
Console.WriteLine($"{order.Id}: {order.ItemName}");

order.ItemName = "Gadget";
Console.WriteLine($"{order.Id}: {order.ItemName}");

public class Order
{
    public int Id { get; }
    public string ItemName { get; set; }

    public Order(int id, string itemName)
    {
        Id = id;
        ItemName = itemName;
    }
}
`,
      },
    ],
  },
]

export default challenges

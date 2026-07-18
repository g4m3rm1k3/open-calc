import type { PracticeChallenge } from './loader'

export const title = 'Delegates and Events (C#)'

const challenges: PracticeChallenge[] = [
  {
    level: 1,
    variants: [
      {
        lang: 'csharp-program',
        prompt: 'Declare `public delegate void PriceHandler(int price);` and `StockTicker` with `public event PriceHandler? OnPriceChanged;` and `UpdatePrice(int price)` that raises it via `OnPriceChanged?.Invoke(price);`. Subscribe two handlers (each printing a distinct investor label with the price) via `+=`, call `UpdatePrice(100)` (both should run), unsubscribe the first via `-=`, then call `UpdatePrice(105)` (only the second should run).',
        starter: '',
        tests: `
assert output === 'Investor A sees: 100\\nInvestor B sees: 100\\nInvestor B sees: 105'
`,
        solution: `using System;

var ticker = new StockTicker();

PriceHandler handler1 = (price) => Console.WriteLine($"Investor A sees: {price}");
PriceHandler handler2 = (price) => Console.WriteLine($"Investor B sees: {price}");

ticker.OnPriceChanged += handler1;
ticker.OnPriceChanged += handler2;

ticker.UpdatePrice(100);

ticker.OnPriceChanged -= handler1;

ticker.UpdatePrice(105);

public delegate void PriceHandler(int price);

public class StockTicker
{
    public event PriceHandler? OnPriceChanged;

    public void UpdatePrice(int price)
    {
        OnPriceChanged?.Invoke(price);
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
        prompt: 'Fix `UpdatePrice`: it calls `OnPriceChanged.Invoke(price)` directly, WITHOUT the `?.` null-conditional check — since nothing has subscribed yet, `OnPriceChanged` is `null`, and invoking it directly throws `NullReferenceException`, crashing before `"done"` ever prints. Change it to `OnPriceChanged?.Invoke(price);`, so raising an event with zero subscribers is a safe no-op.',
        starter: `using System;

var ticker = new StockTicker();
ticker.UpdatePrice(50);
Console.WriteLine("done");

public delegate void PriceHandler(int price);

public class StockTicker
{
    public event PriceHandler? OnPriceChanged;

    public void UpdatePrice(int price)
    {
        OnPriceChanged.Invoke(price);
    }
}
`,
        tests: `
assert output === 'done'
`,
        solution: `using System;

var ticker = new StockTicker();
ticker.UpdatePrice(50);
Console.WriteLine("done");

public delegate void PriceHandler(int price);

public class StockTicker
{
    public event PriceHandler? OnPriceChanged;

    public void UpdatePrice(int price)
    {
        OnPriceChanged?.Invoke(price);
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
        prompt: 'Using the same `StockTicker`/`PriceHandler` shape, subscribe a `logger` (always prints `"log: " + price`, increments a shared `callCount`) and an `alerter` (increments `callCount`, but only prints `"ALERT: price is " + price` if `price > 100`). Call `UpdatePrice(50)` then `UpdatePrice(150)` (both handlers run each time, in subscription order), unsubscribe `alerter`, then call `UpdatePrice(200)` (only `logger` runs). Print `$"total handler calls: {callCount}"` at the end.',
        starter: '',
        tests: `
assert output === 'log: 50\\nlog: 150\\nALERT: price is 150\\nlog: 200\\ntotal handler calls: 5'
`,
        solution: `using System;

var ticker = new StockTicker();
int callCount = 0;

PriceHandler logger = (price) => { callCount++; Console.WriteLine($"log: {price}"); };
PriceHandler alerter = (price) => { callCount++; if (price > 100) Console.WriteLine($"ALERT: price is {price}"); };

ticker.OnPriceChanged += logger;
ticker.OnPriceChanged += alerter;

ticker.UpdatePrice(50);
ticker.UpdatePrice(150);

ticker.OnPriceChanged -= alerter;

ticker.UpdatePrice(200);

Console.WriteLine($"total handler calls: {callCount}");

public delegate void PriceHandler(int price);

public class StockTicker
{
    public event PriceHandler? OnPriceChanged;

    public void UpdatePrice(int price)
    {
        OnPriceChanged?.Invoke(price);
    }
}
`,
      },
    ],
  },
]

export default challenges

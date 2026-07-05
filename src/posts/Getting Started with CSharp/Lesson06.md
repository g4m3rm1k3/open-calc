# Loops and Iteration: LINQ as a First-Class Citizen

C#'s loop constructs are syntactically familiar: `for`, `while`, `do-while`, `foreach`. What makes C# iteration distinctive is **LINQ** (Language Integrated Query) — a set of language features and library methods introduced in C# 3.0 that bring SQL-like declarative queries directly into the language. LINQ isn't a bolt-on — the `foreach` loop, iterator methods, and expression trees are all designed to work together with it. Understanding iteration in C# means understanding where loops end and LINQ begins.

## The `for` Loop

```csharp
// Classic indexed loop
for (int i = 0; i < 5; i++)
{
    Console.Write(i + " ");
}
Console.WriteLine();

// Summing
int sum = 0;
for (int i = 1; i <= 100; i++) sum += i;
Console.WriteLine($"Sum 1-100: {sum}");  // 5050

// Multiple variables
for (int i = 0, j = 10; i < j; i++, j--)
{
    Console.Write($"({i},{j}) ");
}
Console.WriteLine();

// Decrement
for (int i = 10; i > 0; i--)
    Console.Write(i + " ");
Console.WriteLine();

// Infinite loop with break
int count = 0;
for (;;)   // equivalent to while(true)
{
    count++;
    if (count >= 5) break;
}
Console.WriteLine($"count = {count}");
```

## The `foreach` Loop

`foreach` works on anything implementing `IEnumerable<T>` — arrays, lists, strings, files, database results, generators:

```csharp
// Over array
int[] numbers = { 1, 2, 3, 4, 5 };
foreach (int n in numbers)
    Console.Write(n + " ");
Console.WriteLine();

// Over List
var fruits = new List<string> { "apple", "banana", "cherry" };
foreach (string fruit in fruits)
    Console.WriteLine(fruit.ToUpper());

// Over string (char by char)
foreach (char c in "Hello")
    Console.Write(c + "-");
Console.WriteLine();

// Over Dictionary
var scores = new Dictionary<string, int>
{
    ["Alice"]   = 95,
    ["Bob"]     = 82,
    ["Charlie"] = 91
};
foreach (var (name, score) in scores)   // Tuple deconstruction
    Console.WriteLine($"  {name}: {score}");
```

The tuple deconstruction `var (name, score) in scores` is C# 7's **deconstruction** syntax. `Dictionary<K,V>.GetEnumerator()` yields `KeyValuePair<K,V>`, and C# 7 lets you destructure it inline.

## `while` and `do-while`

```csharp
// while: check first
int value = 100;
int steps = 0;
while (value != 1)
{
    value = value % 2 == 0 ? value / 2 : 3 * value + 1;  // Collatz
    steps++;
}
Console.WriteLine($"Collatz(100): {steps} steps");

// do-while: execute first, check after
int attempts = 0;
do
{
    Console.WriteLine($"Attempt {++attempts}");
} while (attempts < 3);

// Newton-Raphson square root
double target = 9.0;
double guess = target;
double prev;
do
{
    prev = guess;
    guess = (guess + target / guess) / 2.0;
} while (Math.Abs(guess - prev) > 1e-12);
Console.WriteLine($"sqrt(9) ≈ {guess}");
```

## `break`, `continue`, and `goto`

Unlike Java, C# actually has `goto` — but it's limited to jumping to labels within the same method or to switch cases. It's rarely justified, but exists:

```csharp
// break
foreach (int n in new[] { 3, 7, -1, 9, 4 })
{
    if (n < 0) break;
    Console.Write(n + " ");
}
Console.WriteLine();

// continue
for (int i = 0; i < 10; i++)
{
    if (i % 2 == 0) continue;
    Console.Write(i + " ");   // Only odd numbers
}
Console.WriteLine();

// Breaking nested loops without flags — use a local function or goto
static void FindInMatrix()
{
    int[,] matrix = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
    int target = 5;
    bool found = false;

    for (int i = 0; i < 3 && !found; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            if (matrix[i, j] == target)
            {
                Console.WriteLine($"Found {target} at [{i},{j}]");
                found = true;
                break;
            }
        }
    }
}
FindInMatrix();
```

## Iterator Methods: `yield return`

C#'s `yield return` creates **lazy sequences** — values are produced on demand, one at a time, without materializing the whole collection:

```csharp
// Generate an infinite Fibonacci sequence lazily
static IEnumerable<long> Fibonacci()
{
    long a = 0, b = 1;
    while (true)
    {
        yield return a;
        (a, b) = (b, a + b);   // Tuple swap
    }
}

// Take only what you need — the generator stops when foreach stops
foreach (long n in Fibonacci().Take(15))
    Console.Write(n + " ");
Console.WriteLine();

// Primes via Sieve, lazily
static IEnumerable<int> Primes(int max)
{
    var sieve = new bool[max + 1];
    for (int i = 2; i <= max; i++)
    {
        if (!sieve[i])
        {
            yield return i;
            for (int j = i * 2; j <= max; j += i)
                sieve[j] = true;
        }
    }
}

Console.Write("Primes to 50: ");
foreach (int p in Primes(50))
    Console.Write(p + " ");
Console.WriteLine();
```

`yield return` produces an iterator that implements `IEnumerable<T>`. The method's execution is **suspended** at each `yield return` and resumed on the next `MoveNext()` call. This is cooperative multitasking within a single thread — the same mechanism that makes `async/await` work internally.

## LINQ: Declarative Iteration

LINQ (Language Integrated Query) provides a rich set of extension methods on `IEnumerable<T>` — and a query syntax that looks like SQL:

```csharp
var numbers = Enumerable.Range(1, 20).ToList();

// Method syntax (most common in modern code)
var result = numbers
    .Where(n => n % 2 == 0)       // Filter: even numbers
    .Select(n => n * n)            // Transform: square them
    .Where(n => n > 50)            // Filter again
    .OrderByDescending(n => n)     // Sort
    .Take(5);                      // First 5

Console.WriteLine(string.Join(", ", result));

// Query syntax (SQL-like alternative — same output)
var result2 =
    from n in numbers
    where n % 2 == 0
    let squared = n * n
    where squared > 50
    orderby squared descending
    select squared;

Console.WriteLine(string.Join(", ", result2.Take(5)));

// Aggregation
Console.WriteLine($"Sum: {numbers.Sum()}");
Console.WriteLine($"Average: {numbers.Average()}");
Console.WriteLine($"Max: {numbers.Max()}");
Console.WriteLine($"Count even: {numbers.Count(n => n % 2 == 0)}");

// Grouping
var words = new[] { "apple", "banana", "cherry", "avocado", "blueberry", "apricot" };
var byFirstLetter = words
    .GroupBy(w => w[0])
    .OrderBy(g => g.Key);

foreach (var group in byFirstLetter)
{
    Console.WriteLine($"  '{group.Key}': {string.Join(", ", group)}");
}
```

## LINQ Is Lazy

LINQ operations build a pipeline description — they don't execute until you iterate the result. This laziness means:

```csharp
// This query is built but not yet evaluated
var query = Enumerable.Range(1, int.MaxValue)
    .Where(n => n % 3 == 0)
    .Select(n => n * n);

// Execution happens here — stops after first 5 results
// Without Take(5) this would run forever
foreach (int n in query.Take(5))
    Console.WriteLine(n);   // 9, 36, 81, 144, 225

// Force immediate evaluation with ToList() or ToArray()
var materialized = query.Take(10).ToList();
Console.WriteLine($"Type: {materialized.GetType().Name}");
```

The laziness is what makes LINQ over `IEnumerable<T>` efficient — you chain `Where`, `Select`, `Take` and each element is processed through the entire pipeline once, not in three separate passes. It's also why calling `Count()` on a LINQ query iterates the entire sequence — if you need to check both emptiness and count, call `ToList()` first.

## `foreach` Under the Hood

The C# compiler desugars `foreach` into a pattern-based expansion. Any type with a `GetEnumerator()` method returning an object with `MoveNext()` and `Current` works, even if it doesn't implement `IEnumerable<T>`. This is how `async foreach` (`await foreach`) works — `IAsyncEnumerable<T>` has `MoveNextAsync()` instead:

```csharp
// Custom iterable struct (no heap allocation!)
struct Range
{
    private readonly int start, end;
    public Range(int start, int end) { this.start = start; this.end = end; }

    public Enumerator GetEnumerator() => new Enumerator(start, end);

    public struct Enumerator
    {
        private int current;
        private readonly int end;
        public Enumerator(int start, int end) { current = start - 1; this.end = end; }
        public bool MoveNext() => ++current <= end;
        public int Current => current;
    }
}

foreach (int i in new Range(1, 5))
    Console.Write(i + " ");
Console.WriteLine();  // 1 2 3 4 5
```

This struct-based enumerator allocates zero bytes on the heap — every `foreach` iteration is pure stack-based operation. This pattern is used extensively in high-performance .NET code.

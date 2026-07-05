# File I/O and Working with Data

Almost every real application reads or writes files: configuration files, logs, CSVs, JSON data, user documents. C# provides a rich set of tools for this under the `System.IO` namespace. We'll start with the simplest APIs and build up to handling larger files and structured data like JSON.

## Reading and Writing Files: The Simple API

For small files that fit comfortably in memory, `System.IO.File` provides straightforward static methods:

```csharp
// You'll need this using directive at the top of your file
// (In modern .NET with global usings, you may not even need it)
using System.IO;

// ── WRITING ─────────────────────────────────────────────────────────────────

// Write a single string to a file.
// If the file doesn't exist, it's created.
// If it does exist, it's completely replaced (overwritten).
File.WriteAllText("notes.txt", "Hello, file world!");

// Write multiple lines at once
// Each string in the array becomes one line
string[] lines = { "Line one", "Line two", "Line three" };
File.WriteAllLines("lines.txt", lines);

// Append to an existing file (don't overwrite — add to the end)
File.AppendAllText("notes.txt", "\nThis was added later.");

// ── READING ─────────────────────────────────────────────────────────────────

// Read the entire file as one big string
string content = File.ReadAllText("notes.txt");
Console.WriteLine(content);
// Hello, file world!
// This was added later.

// Read all lines into an array of strings
string[] readLines = File.ReadAllLines("lines.txt");
foreach (string line in readLines)
    Console.WriteLine($"  → {line}");
// → Line one
// → Line two
// → Line three

// Read all bytes (useful for images, PDFs, etc.)
byte[] bytes = File.ReadAllBytes("notes.txt");
Console.WriteLine($"File size: {bytes.Length} bytes");
```

These methods are perfect for small files and simple use cases. For anything larger or more complex, use streams.

## File Paths: Working with the `Path` Class

File paths look different on different operating systems (`C:\folder\file.txt` on Windows, `/home/user/file.txt` on Linux/Mac). The `Path` class gives you methods that handle paths correctly on any platform:

```csharp
// DON'T do this — hardcoded separators break on other operating systems
string bad = "data" + "\\" + "users" + "\\" + "alice.txt";

// DO this — Path.Combine uses the correct separator for the current OS
string good = Path.Combine("data", "users", "alice.txt");
Console.WriteLine(good);   // data\users\alice.txt (on Windows)
                            // data/users/alice.txt (on Linux/Mac)

// Get parts of a path
string fullPath = @"C:\projects\myapp\src\Program.cs";

Console.WriteLine(Path.GetFileName(fullPath));           // Program.cs
Console.WriteLine(Path.GetFileNameWithoutExtension(fullPath)); // Program
Console.WriteLine(Path.GetExtension(fullPath));          // .cs
Console.WriteLine(Path.GetDirectoryName(fullPath));      // C:\projects\myapp\src

// Build an absolute path relative to where the program is running
string relativePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.json");
Console.WriteLine(relativePath);

// Check if a file or directory exists before using it
if (File.Exists("notes.txt"))
    Console.WriteLine("File exists!");

if (!Directory.Exists("output"))
    Directory.CreateDirectory("output");   // Create the folder if it doesn't exist
```

Always use `Path.Combine` instead of string concatenation for file paths.

## The `Directory` Class

```csharp
// Create a directory (and any missing parent directories)
Directory.CreateDirectory(Path.Combine("output", "reports", "2024"));

// List all files in a directory
string[] files = Directory.GetFiles(".", "*.txt");   // "." = current directory
foreach (string f in files)
    Console.WriteLine(Path.GetFileName(f));

// List all files recursively (including subfolders)
string[] allCsFiles = Directory.GetFiles("src", "*.cs", SearchOption.AllDirectories);
Console.WriteLine($"Found {allCsFiles.Length} C# files");

// List subdirectories
string[] folders = Directory.GetDirectories(".");
foreach (string folder in folders)
    Console.WriteLine(Path.GetFileName(folder));

// Delete a file or directory
File.Delete("temp.txt");
Directory.Delete("old-output", recursive: true);   // recursive: delete contents too
```

## Streams: Reading Large Files Line by Line

The simple `File.ReadAllText` loads the **entire file** into memory at once. For a 10 MB file, that's fine. For a 10 GB log file, it would crash your program by running out of memory. **Streams** solve this by reading a little at a time:

```csharp
// StreamReader reads text files line by line, loading only one line at a time into memory
// 'using' ensures the file is properly closed when done (even if an exception occurs)
using (var reader = new StreamReader("large-log.txt"))
{
    int lineNumber = 0;
    string? line;

    // ReadLine() returns null when it reaches the end of the file
    while ((line = reader.ReadLine()) != null)
    {
        lineNumber++;

        // Process the line — in this case, only print lines containing "ERROR"
        if (line.Contains("ERROR"))
            Console.WriteLine($"Line {lineNumber}: {line}");
    }

    Console.WriteLine($"Processed {lineNumber} lines.");
}
// File is automatically closed here
```

### Writing with `StreamWriter`

```csharp
// StreamWriter writes text to a file
// Second parameter: true = append to existing file, false (default) = overwrite
using (var writer = new StreamWriter("output.txt", append: false))
{
    writer.WriteLine("First line");
    writer.WriteLine("Second line");
    writer.Write("No newline at end");

    // For large amounts of data, WriteLine inside a loop works fine
    for (int i = 1; i <= 1000; i++)
    {
        writer.WriteLine($"Record {i}: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
    }
}
// File is closed and flushed here — all data is written to disk
```

## Practical Example: Reading and Writing a CSV File

CSV (Comma-Separated Values) is one of the most common data formats. Here's how to read and write it without a third-party library:

```csharp
record Product(string Name, string Category, decimal Price, int Stock);

// ── WRITING A CSV ────────────────────────────────────────────────────────────

static void WriteProductsCsv(string path, List<Product> products)
{
    using var writer = new StreamWriter(path);

    // Write the header row
    writer.WriteLine("Name,Category,Price,Stock");

    // Write each product as a data row
    foreach (var p in products)
    {
        // Wrap Name in quotes in case it contains commas
        writer.WriteLine($"\"{p.Name}\",{p.Category},{p.Price},{p.Stock}");
    }

    Console.WriteLine($"Wrote {products.Count} products to {path}");
}

// ── READING A CSV ────────────────────────────────────────────────────────────

static List<Product> ReadProductsCsv(string path)
{
    var products = new List<Product>();

    using var reader = new StreamReader(path);

    // Skip the header line
    string? header = reader.ReadLine();

    string? line;
    int lineNum = 1;

    while ((line = reader.ReadLine()) != null)
    {
        lineNum++;

        // Skip empty lines
        if (string.IsNullOrWhiteSpace(line)) continue;

        // Split on commas — simple approach (doesn't handle quoted commas)
        string[] parts = line.Split(',');

        if (parts.Length != 4)
        {
            Console.WriteLine($"Warning: line {lineNum} has {parts.Length} fields, expected 4. Skipping.");
            continue;
        }

        try
        {
            // Trim removes surrounding whitespace and quotes
            string name     = parts[0].Trim().Trim('"');
            string category = parts[1].Trim();
            decimal price   = decimal.Parse(parts[2].Trim());
            int stock       = int.Parse(parts[3].Trim());

            products.Add(new Product(name, category, price, stock));
        }
        catch (FormatException ex)
        {
            Console.WriteLine($"Warning: could not parse line {lineNum}: {ex.Message}");
        }
    }

    Console.WriteLine($"Read {products.Count} products from {path}");
    return products;
}

// ── USING THEM ────────────────────────────────────────────────────────────────

var inventory = new List<Product>
{
    new("Widget",         "Hardware",   9.99m,  150),
    new("Gadget Pro",     "Electronics", 79.99m, 42),
    new("Blue Pen",       "Stationery", 1.49m,  800),
    new("Notebook, A5",   "Stationery", 4.99m,  200),   // comma in name — needs quoting
};

WriteProductsCsv("inventory.csv", inventory);

var loaded = ReadProductsCsv("inventory.csv");

// Use LINQ to summarize
var byCategory = loaded
    .GroupBy(p => p.Category)
    .Select(g => new { Category = g.Key, TotalValue = g.Sum(p => p.Price * p.Stock) })
    .OrderByDescending(g => g.TotalValue);

foreach (var cat in byCategory)
    Console.WriteLine($"{cat.Category}: ${cat.TotalValue:F2}");
```

## Working with JSON

JSON (JavaScript Object Notation) is the most common data format for web APIs and configuration files. .NET 5+ includes `System.Text.Json` — a fast, built-in JSON library. No extra packages needed.

```csharp
using System.Text.Json;
using System.Text.Json.Serialization;

// ── YOUR DATA CLASS ──────────────────────────────────────────────────────────

class WeatherForecast
{
    // JsonPropertyName lets you control what the JSON key is called
    [JsonPropertyName("city")]
    public string City { get; set; } = "";

    [JsonPropertyName("temperature_c")]
    public double TemperatureCelsius { get; set; }

    // Computed property — serialized to JSON automatically
    [JsonIgnore]   // JsonIgnore: don't include this in the JSON
    public double TemperatureFahrenheit => TemperatureCelsius * 9 / 5 + 32;

    [JsonPropertyName("description")]
    public string Description { get; set; } = "";
}

// ── SERIALIZE: object → JSON string ──────────────────────────────────────────

var forecast = new WeatherForecast
{
    City = "London",
    TemperatureCelsius = 18.5,
    Description = "Partly cloudy"
};

// JsonSerializer.Serialize converts your object to a JSON string
string json = JsonSerializer.Serialize(forecast);
Console.WriteLine(json);
// {"city":"London","temperature_c":18.5,"description":"Partly cloudy"}

// WriteIndented: makes the JSON human-readable with line breaks and spaces
var options = new JsonSerializerOptions { WriteIndented = true };
string prettyJson = JsonSerializer.Serialize(forecast, options);
Console.WriteLine(prettyJson);

// ── SAVE TO FILE ──────────────────────────────────────────────────────────────

File.WriteAllText("forecast.json", prettyJson);

// ── DESERIALIZE: JSON string → object ────────────────────────────────────────

string loadedJson = File.ReadAllText("forecast.json");

// JsonSerializer.Deserialize converts JSON back into your object
WeatherForecast? loaded = JsonSerializer.Deserialize<WeatherForecast>(loadedJson);
Console.WriteLine($"Loaded: {loaded?.City}, {loaded?.TemperatureCelsius}°C");

// ── WORKING WITH LISTS ────────────────────────────────────────────────────────

var forecasts = new List<WeatherForecast>
{
    new() { City = "Paris",  TemperatureCelsius = 22, Description = "Sunny" },
    new() { City = "Berlin", TemperatureCelsius = 15, Description = "Rainy" },
    new() { City = "Rome",   TemperatureCelsius = 28, Description = "Hot" },
};

// Serialize a list — produces a JSON array
string listJson = JsonSerializer.Serialize(forecasts, options);
File.WriteAllText("forecasts.json", listJson);

// Deserialize a list
string listContent = File.ReadAllText("forecasts.json");
List<WeatherForecast>? loadedList = JsonSerializer.Deserialize<List<WeatherForecast>>(listContent);
Console.WriteLine($"Loaded {loadedList?.Count} forecasts");
```

## Async File Operations

File I/O is a great candidate for async — disk operations can take time and we shouldn't block the thread while waiting. All the major file methods have async versions:

```csharp
static async Task ProcessFilesAsync()
{
    // Async versions of the simple File methods
    string content = await File.ReadAllTextAsync("notes.txt");
    await File.WriteAllTextAsync("copy.txt", content);

    string[] lines = await File.ReadAllLinesAsync("data.txt");

    // For StreamReader, ReadLineAsync is available
    using var reader = new StreamReader("large.txt");
    string? line;
    while ((line = await reader.ReadLineAsync()) != null)
    {
        // Process asynchronously
    }

    // JSON with async
    using var stream = File.OpenRead("data.json");
    var data = await JsonSerializer.DeserializeAsync<List<Product>>(stream);
    Console.WriteLine($"Loaded {data?.Count} items");
}
```

In any application that does significant file work — a web API that reads configs, a tool that processes many files — use the async versions to keep your application responsive.

## Common File Patterns Summary

```csharp
// Check before using
if (File.Exists(path)) { /* read it */ }

// Always use Path.Combine for paths
string fullPath = Path.Combine(baseDir, "subfolder", "file.txt");

// Always use 'using' with streams
using var reader = new StreamReader(path);

// Catch specific exceptions
try
{
    string text = File.ReadAllText(path);
}
catch (FileNotFoundException)
{
    Console.WriteLine($"File not found: {path}");
}
catch (UnauthorizedAccessException)
{
    Console.WriteLine($"Permission denied: {path}");
}
catch (IOException ex)
{
    Console.WriteLine($"I/O error: {ex.Message}");
}

// Use async for any I/O in real applications
string text2 = await File.ReadAllTextAsync(path);
```

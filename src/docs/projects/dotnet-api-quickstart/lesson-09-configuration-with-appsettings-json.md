# Lesson 09: Configuration With `appsettings.json`

**What this covers:** the real, standard .NET way to read settings —
a real connection string, a real log level, a real file path — from a
real, external file instead of hardcoding them, and the one, common
real gotcha that trips people up the first time.

**What you need first:** [Lesson 07](lesson-07-nuget-basics.md).

---

## The real file

```json
{
  "Logging": {
    "MinimumLevel": "Information"
  },
  "OutputFolder": "C:\\Reports"
}
```

`appsettings.json` is a real, plain JSON file, sitting alongside your
real project's other files — the direct, real parallel to a Python
app's own `config.yaml` or `.env` file. Nothing magic about the name;
it's simply the real, established convention every .NET tutorial and
real, professional app already follows.

## Reading it: `Microsoft.Extensions.Configuration`

```
dotnet add package Microsoft.Extensions.Configuration.Json
```

```csharp
using Microsoft.Extensions.Configuration;

IConfiguration config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

string? minLevel = config["Logging:MinimumLevel"];
string? outputFolder = config["OutputFolder"];
```

`ConfigurationBuilder` is a real, standard builder — `.AddJsonFile`
tells it a real, specific source to read from (you can real, later
add more real sources — environment variables, command-line args — the
same builder merges all of them). `config["Logging:MinimumLevel"]`
reads a real, nested value using `:` as the real, standard separator
between JSON levels.

## The one, real, common gotcha

A real `appsettings.json` file has to actually exist next to your
real, compiled `.exe`/`.dll` at runtime — and by default, a new file
you add to a project is **not** automatically copied there. Right-click
the file in Visual Studio → **Properties** → set **Copy to Output
Directory** to **Copy if newer**. In the raw, real `.csproj` XML, this
is the identical, real setting:

```xml
<ItemGroup>
  <None Update="appsettings.json">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

Skipping this is the single most common real reason
`AddJsonFile("appsettings.json", optional: false)` throws a real
`FileNotFoundException` the first time someone runs a real build —
worth checking first if that happens to you.

## Binding to a real, typed class instead of raw strings

```csharp
public class LoggingOptions
{
    public string MinimumLevel { get; set; } = "Information";
}
```

```csharp
LoggingOptions options = config.GetSection("Logging").Get<LoggingOptions>()
    ?? new LoggingOptions();
```

Rather than reading each real setting by its raw, real string key
everywhere you need it, `GetSection("Logging").Get<LoggingOptions>()`
fills in a real, whole object at once — real property names matched to
real JSON keys automatically. This is the real, preferred pattern in
any real app with more than a couple of settings: you get real
IntelliSense and real compile-time checking on `options.MinimumLevel`,
instead of a raw string that only fails at runtime if you misspell it.

## Definition of done

- [ ] You created a real `appsettings.json` file and read a real value
      out of it with `IConfiguration`.
- [ ] You correctly set **Copy to Output Directory** and can explain,
      in your own words, why it's necessary.
- [ ] You bound a real configuration section to a real, typed class
      with `Get<T>()`.
- [ ] You can state, in your own words, why hardcoding a real setting
      (a folder path, a connection string) is worse than reading it
      from a real config file.

## Next

[Lesson 10 — Solution and Project Structure](lesson-10-solution-and-project-structure.md)
turns from libraries and settings to the real, physical shape of the
project itself — `.sln` vs. `.csproj`, and how to navigate an
unfamiliar add-in template's files.

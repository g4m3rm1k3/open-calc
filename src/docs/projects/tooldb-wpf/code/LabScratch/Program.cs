using Microsoft.Data.Sqlite;

if (File.Exists("lab1.db"))
{
    File.Delete("lab1.db");
}

using var connection = new SqliteConnection("Data Source=lab1.db");
connection.Open();

Console.WriteLine($"File exists before CREATE TABLE: {File.Exists("lab1.db")}");
Console.WriteLine($"File size before CREATE TABLE: {new FileInfo("lab1.db").Length} bytes");

using var createTableCommand = new SqliteCommand("CREATE TABLE tools (name)", connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"ExecuteNonQuery() returned: {rowsAffected}");

Console.WriteLine($"File exists after CREATE TABLE: {File.Exists("lab1.db")}");
Console.WriteLine($"File size after CREATE TABLE: {new FileInfo("lab1.db").Length} bytes");

using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");

using var missingLookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'nonexistent'",
    connection);
object? missingResult = missingLookupCommand.ExecuteScalar();
if (missingResult is null)
{
    Console.WriteLine("sqlite_schema's stored SQL for 'nonexistent': null");
}
else
{
    Console.WriteLine($"sqlite_schema's stored SQL for 'nonexistent': {missingResult}");
}

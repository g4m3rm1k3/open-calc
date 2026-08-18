using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string createTableSql = "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT, manufacturer TEXT, overall_diameter REAL, overall_length REAL, flute_count INTEGER)";
using var createTableCommand = new SqliteCommand(createTableSql, connection);
int rowsAffected = createTableCommand.ExecuteNonQuery();
Console.WriteLine($"CREATE TABLE executed. ExecuteNonQuery() returned: {rowsAffected}");

using var lookupCommand = new SqliteCommand(
    "SELECT sql FROM sqlite_schema WHERE type = 'table' AND name = 'tools'",
    connection);
object? storedSql = lookupCommand.ExecuteScalar();
Console.WriteLine($"sqlite_schema's stored SQL for 'tools': {storedSql}");

using var autoindexCommand = new SqliteCommand(
    "SELECT name FROM sqlite_schema WHERE type = 'index' AND tbl_name = 'tools'",
    connection);
object? autoindexName = autoindexCommand.ExecuteScalar();
if (autoindexName is null)
{
    Console.WriteLine("Autoindex for tools: null (none created)");
}
else
{
    Console.WriteLine($"Autoindex for tools: {autoindexName}");
}

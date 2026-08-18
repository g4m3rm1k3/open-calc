using Microsoft.Data.Sqlite;

string connectionString = "Data Source=tools.db";

using var connection = new SqliteConnection(connectionString);
connection.Open();

Console.WriteLine($"Connected. State: {connection.State}");
Console.WriteLine($"Database file on disk: {File.Exists("tools.db")}");

string toolName = "1/2 in 4-Flute Carbide End Mill";
string manufacturer = "O'Brien Carbide Tools";
double overallDiameter = 0.5;
double overallLength = 3.0;
int fluteCount = 4;

using var insertCommand = new SqliteCommand(
    "INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES (@name, @manufacturer, @overall_diameter, @overall_length, @flute_count)",
    connection);
insertCommand.Parameters.Add(new SqliteParameter("@name", toolName));
insertCommand.Parameters.Add(new SqliteParameter("@manufacturer", manufacturer));
insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter", overallDiameter));
insertCommand.Parameters.Add(new SqliteParameter("@overall_length", overallLength));
insertCommand.Parameters.Add(new SqliteParameter("@flute_count", fluteCount));
int rowsAffected = insertCommand.ExecuteNonQuery();
Console.WriteLine($"INSERT executed. ExecuteNonQuery() returned: {rowsAffected}");

using var countCommand = new SqliteCommand("SELECT COUNT(*) FROM tools", connection);
object? toolCount = countCommand.ExecuteScalar();
Console.WriteLine($"Row count in tools: {toolCount}");

using var readBackCommand = new SqliteCommand("SELECT manufacturer FROM tools WHERE id = 1", connection);
object? storedManufacturer = readBackCommand.ExecuteScalar();
Console.WriteLine($"Row 1's stored manufacturer: {storedManufacturer}");

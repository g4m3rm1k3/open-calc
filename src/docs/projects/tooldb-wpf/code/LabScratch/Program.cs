using Microsoft.Data.Sqlite;

using var connection = new SqliteConnection("Data Source=../ToolDB/tools.db");
connection.Open();

using var readBackCommand = new SqliteCommand(
    "SELECT name, manufacturer, overall_diameter, typeof(overall_diameter), overall_length, typeof(overall_length), flute_count, typeof(flute_count) FROM tools WHERE id = 1",
    connection);
using var reader = readBackCommand.ExecuteReader();
reader.Read();
Console.WriteLine($"name: {reader.GetString(0)}");
Console.WriteLine($"manufacturer: {reader.GetString(1)}");
Console.WriteLine($"overall_diameter: {reader.GetDouble(2)} (typeof: {reader.GetString(3)})");
Console.WriteLine($"overall_length: {reader.GetDouble(4)} (typeof: {reader.GetString(5)})");
Console.WriteLine($"flute_count: {reader.GetInt32(6)} (typeof: {reader.GetString(7)})");

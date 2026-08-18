using Microsoft.Data.Sqlite;

public class ToolTests
{
    [Fact]
    public void FromReader_MapsAllColumnsOntoTool()
    {
        string testDbPath = "test_tool_mapping.db";
        if (File.Exists(testDbPath))
        {
            File.Delete(testDbPath);
        }

        using var connection = new SqliteConnection($"Data Source={testDbPath}");
        connection.Open();

        using var createCommand = new SqliteCommand(
            "CREATE TABLE tools (id INTEGER PRIMARY KEY, name TEXT NOT NULL, manufacturer TEXT NOT NULL, overall_diameter REAL NOT NULL, overall_length REAL NOT NULL, flute_count INTEGER NOT NULL)",
            connection);
        createCommand.ExecuteNonQuery();

        using var insertCommand = new SqliteCommand(
            "INSERT INTO tools (name, manufacturer, overall_diameter, overall_length, flute_count) VALUES (@name, @manufacturer, @overall_diameter, @overall_length, @flute_count)",
            connection);
        insertCommand.Parameters.Add(new SqliteParameter("@name", "3/8 in 2-Flute Carbide End Mill"));
        insertCommand.Parameters.Add(new SqliteParameter("@manufacturer", "Test Tooling Co."));
        insertCommand.Parameters.Add(new SqliteParameter("@overall_diameter", 0.375));
        insertCommand.Parameters.Add(new SqliteParameter("@overall_length", 2.5));
        insertCommand.Parameters.Add(new SqliteParameter("@flute_count", 2));
        insertCommand.ExecuteNonQuery();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();
        reader.Read();

        Tool tool = Tool.FromReader(reader);

        Assert.Equal(1, tool.Id);
        Assert.Equal("3/8 in 2-Flute Carbide End Mill", tool.Name);
        Assert.Equal("Test Tooling Co.", tool.Manufacturer);
        Assert.Equal(0.375, tool.OverallDiameter);
        Assert.Equal(2.5, tool.OverallLength);
        Assert.Equal(2, tool.FluteCount);
    }
}

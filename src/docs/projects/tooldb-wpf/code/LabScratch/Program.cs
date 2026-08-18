using Microsoft.Data.Sqlite;
using System.Text.Json;

Widget single = new Widget { Name = "O'Brien Carbide Tools", Count = 1 };
Console.WriteLine(JsonSerializer.Serialize(single));

List<Widget> many = new List<Widget>();
many.Add(new Widget { Name = "O'Brien Carbide Tools", Count = 1 });
many.Add(new Widget { Name = "Kennametal", Count = 40 });
Console.WriteLine(JsonSerializer.Serialize(many));

using var connection = new SqliteConnection("Data Source=../ToolDB/tools.db");
connection.Open();

using var selectCommand = new SqliteCommand(
    "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
    connection);
using var reader = selectCommand.ExecuteReader();

List<Tool> tools = new List<Tool>();
while (reader.Read())
{
    tools.Add(Tool.FromReader(reader));
}

Console.WriteLine(JsonSerializer.Serialize(tools));

class Widget
{
    public string Name { get; set; } = "";
    public int Count { get; set; }
}

class Tool
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Manufacturer { get; set; } = "";
    public double OverallDiameter { get; set; }
    public double OverallLength { get; set; }
    public int FluteCount { get; set; }

    public static Tool FromReader(SqliteDataReader reader)
    {
        return new Tool
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Manufacturer = reader.GetString(2),
            OverallDiameter = reader.GetDouble(3),
            OverallLength = reader.GetDouble(4),
            FluteCount = reader.GetInt32(5)
        };
    }
}

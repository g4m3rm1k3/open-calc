using Microsoft.Data.Sqlite;

public record Tool
{
    public int Id { get; init; }
    public string Name { get; init; } = "";
    public string Manufacturer { get; init; } = "";
    public double OverallDiameter { get; init; }
    public double OverallLength { get; init; }
    public int FluteCount { get; init; }

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

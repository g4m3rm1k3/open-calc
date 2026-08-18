using Microsoft.Data.Sqlite;

public class Tool
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

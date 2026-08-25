using Microsoft.Data.Sqlite;

using var connection = new SqliteConnection("Data Source=../ToolDB/tools.db");
connection.Open();

new SqliteCommand("CREATE TABLE vendors (id INTEGER PRIMARY KEY, name TEXT NOT NULL)", connection).ExecuteNonQuery();
new SqliteCommand("INSERT INTO vendors (name) SELECT DISTINCT manufacturer FROM tools", connection).ExecuteNonQuery();
new SqliteCommand("ALTER TABLE tools ADD COLUMN vendor_id INTEGER REFERENCES vendors(id)", connection).ExecuteNonQuery();
new SqliteCommand("UPDATE tools SET vendor_id = (SELECT id FROM vendors WHERE vendors.name = tools.manufacturer)", connection).ExecuteNonQuery();
new SqliteCommand("ALTER TABLE tools DROP COLUMN manufacturer", connection).ExecuteNonQuery();

Console.WriteLine("Real tools.db migrated. New tools schema:");
using (var schemaCmd = new SqliteCommand("SELECT sql FROM sqlite_schema WHERE name = 'tools'", connection))
using (var schemaReader = schemaCmd.ExecuteReader())
{
    schemaReader.Read();
    Console.WriteLine(schemaReader.GetString(0));
}

using (var vendorCmd = new SqliteCommand("SELECT id, name FROM vendors", connection))
using (var vendorReader = vendorCmd.ExecuteReader())
{
    while (vendorReader.Read())
    {
        Console.WriteLine($"vendor id={vendorReader.GetInt32(0)}, name={vendorReader.GetString(1)}");
    }
}

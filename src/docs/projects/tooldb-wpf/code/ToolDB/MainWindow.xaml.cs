using System.ComponentModel;
using System.Windows;
using Microsoft.Data.Sqlite;

namespace ToolDB;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
        connection.Open();

        using var selectCommand = new SqliteCommand(
            "SELECT id, name, manufacturer, overall_diameter, overall_length, flute_count FROM tools",
            connection);
        using var reader = selectCommand.ExecuteReader();

        int toolCount = 0;
        Tool? firstTool = null;
        while (reader.Read())
        {
            Tool tool = Tool.FromReader(reader);
            toolCount++;
            if (firstTool == null)
            {
                firstTool = tool;
            }
        }

        if (firstTool != null)
        {
            StatusText.Text = $"Loaded {toolCount} tool(s). First: {firstTool.Name} ({firstTool.Manufacturer})";
        }
        else
        {
            StatusText.Text = "Loaded 0 tools.";
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}

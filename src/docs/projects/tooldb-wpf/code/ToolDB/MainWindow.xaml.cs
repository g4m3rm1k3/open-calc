using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Windows;
using Microsoft.Data.Sqlite;
using Microsoft.Web.WebView2.Core;

namespace ToolDB;

public partial class MainWindow : Window
{
    private string _toolsJson = "[]";

    public MainWindow()
    {
        InitializeComponent();

        Loaded += MainWindow_Loaded;
        Closing += MainWindow_Closing;

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;
    }

    private void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        using var connection = new SqliteConnection("Data Source=tools.db");
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

        if (tools.Count > 0)
        {
            Title = $"ToolDB — Loaded {tools.Count} tool(s). First: {tools[0].Name} ({tools[0].Manufacturer})";
        }
        else
        {
            Title = "ToolDB — Loaded 0 tools.";
        }

        _toolsJson = JsonSerializer.Serialize(tools);

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "local.html");
        Browser.Source = new Uri(htmlPath);
    }

    private void Browser_CoreWebView2InitializationCompleted(object? sender, CoreWebView2InitializationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("CoreWebView2 initialized successfully.");
        }
        else
        {
            Console.WriteLine($"CoreWebView2 failed to initialize: {e.InitializationException}");
        }
    }

    private void Browser_NavigationCompleted(object? sender, CoreWebView2NavigationCompletedEventArgs e)
    {
        if (e.IsSuccess)
        {
            Console.WriteLine("Navigation completed successfully.");
            Browser.CoreWebView2.PostWebMessageAsJson(_toolsJson);
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("MainWindow is closing.");
    }
}

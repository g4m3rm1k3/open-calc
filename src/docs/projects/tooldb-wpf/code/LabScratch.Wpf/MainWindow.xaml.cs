using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Windows;

namespace LabScratch.Wpf;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        Browser.CoreWebView2InitializationCompleted += Browser_CoreWebView2InitializationCompleted;
        Browser.NavigationCompleted += Browser_NavigationCompleted;

        string htmlPath = Path.Combine(AppContext.BaseDirectory, "lab.html");
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
            Browser.CoreWebView2.PostWebMessageAsJson("\"hello from C#\"");
        }
        else
        {
            Console.WriteLine($"Navigation failed. WebErrorStatus={e.WebErrorStatus}");
        }
    }
}

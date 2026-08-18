using System.ComponentModel;
using System.Windows;

namespace LabScratch.Wpf;

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
        StatusText.Text = "Loaded event fired!";
    }

    private void MainWindow_Closing(object? sender, CancelEventArgs e)
    {
        Console.WriteLine("Closing event fired.");
    }
}

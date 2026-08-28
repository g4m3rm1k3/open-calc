using System.Collections.ObjectModel;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace MastercamGenerator;

public partial class MainWindow : Window
{
    private readonly FileSource _fileSource = new FileSource();
    private readonly DirectoryScanner _directoryScanner = new DirectoryScanner();
    private readonly NewestFileResolver _newestFileResolver = new NewestFileResolver();
    private readonly ObservableCollection<InputFile> _discoveredFiles = new ObservableCollection<InputFile>();
    private readonly WatcherStatus _watcherStatus = new WatcherStatus();
    private string? _selectedFolder;
    private LiveFileTracker? _liveFileTracker;

    public MainWindow()
    {
        InitializeComponent();
        DiscoveredFilesGrid.ItemsSource = _discoveredFiles;
        DataContext = _watcherStatus;
    }

    private async void BrowseButton_Click(object sender, RoutedEventArgs e)
    {
        string? folder = _fileSource.SelectDirectory();
        if (folder != null)
        {
            _selectedFolder = folder;
            FolderPathText.Text = folder;

            List<InputFile> discoveredFiles = await Task.Run(() => _directoryScanner.ScanDirectory(folder));
            _discoveredFiles.Clear();
            foreach (var file in discoveredFiles)
            {
                _discoveredFiles.Add(file);
            }
            FilesFoundText.Text = $"Files Found: {discoveredFiles.Count}";

            InputFile? newestFile = _newestFileResolver.FindNewest(discoveredFiles);
            if (newestFile != null)
            {
                NewestFileText.Text = $"Newest file: {newestFile.FileName} (Modified: {newestFile.LastModified})";
            }
            else
            {
                NewestFileText.Text = "Newest file: (none)";
            }
        }
    }

    private void StartWatchingButton_Click(object sender, RoutedEventArgs e)
    {
        if (_selectedFolder == null)
        {
            return;
        }

        _liveFileTracker = new LiveFileTracker(_selectedFolder);
        _liveFileTracker.StatusUpdated += OnWatcherStatusUpdated;
        _liveFileTracker.Start();
        _watcherStatus.WatcherStatusText = "Watching";
    }

    private void OnWatcherStatusUpdated(string message)
    {
        Dispatcher.Invoke(() =>
        {
            _watcherStatus.StatusMessage = message;

            if (_liveFileTracker?.CurrentFile != null)
            {
                _watcherStatus.CurrentFileText = _liveFileTracker.CurrentFile.FileName;
            }
        });
    }
}

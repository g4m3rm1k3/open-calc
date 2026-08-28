using System.ComponentModel;

namespace MastercamGenerator;

public class WatcherStatus : INotifyPropertyChanged
{
    private string _watcherStatusText = "Not Watching";
    private string _currentFileText = "(none)";
    private string _statusMessage = "(none)";

    public event PropertyChangedEventHandler? PropertyChanged;

    public string WatcherStatusText
    {
        get => _watcherStatusText;
        set
        {
            _watcherStatusText = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(WatcherStatusText)));
        }
    }

    public string CurrentFileText
    {
        get => _currentFileText;
        set
        {
            _currentFileText = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(CurrentFileText)));
        }
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set
        {
            _statusMessage = value;
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(nameof(StatusMessage)));
        }
    }
}

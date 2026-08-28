using System.IO;

namespace MastercamGenerator;

public class DirectoryWatcher
{
    private readonly FileSystemWatcher _watcher;

    public event FileSystemEventHandler? Created;
    public event FileSystemEventHandler? Changed;
    public event FileSystemEventHandler? Deleted;
    public event RenamedEventHandler? Renamed;

    public DirectoryWatcher(string directoryPath)
    {
        _watcher = new FileSystemWatcher(directoryPath, "*.xml");
        _watcher.Created += (sender, e) => Created?.Invoke(sender, e);
        _watcher.Changed += (sender, e) => Changed?.Invoke(sender, e);
        _watcher.Deleted += (sender, e) => Deleted?.Invoke(sender, e);
        _watcher.Renamed += (sender, e) => Renamed?.Invoke(sender, e);
    }

    public void StartWatching()
    {
        _watcher.EnableRaisingEvents = true;
    }
}

using System.IO;

namespace MastercamGenerator;

public class LiveFileTracker
{
    private readonly FileDateParser _fileDateParser = new FileDateParser();
    private readonly FileReadyWaiter _fileReadyWaiter = new FileReadyWaiter();
    private readonly DirectoryWatcher _directoryWatcher;
    private DateTime? _currentFileDate;

    public InputFile? CurrentFile { get; private set; }

    public event Action<string>? StatusUpdated;

    public LiveFileTracker(string directoryPath)
    {
        _directoryWatcher = new DirectoryWatcher(directoryPath);
        _directoryWatcher.Created += OnFileEvent;
        _directoryWatcher.Changed += OnFileEvent;
    }

    public void Start()
    {
        _directoryWatcher.StartWatching();
    }

    private void OnFileEvent(object sender, FileSystemEventArgs e)
    {
        StatusUpdated?.Invoke($"File event: {Path.GetFileName(e.FullPath)}");

        DateTime? parsedDate = _fileDateParser.TryParseDate(e.FullPath);
        if (parsedDate == null)
        {
            return;
        }

        if (_currentFileDate != null && parsedDate <= _currentFileDate)
        {
            return;
        }

        bool ready = _fileReadyWaiter.WaitForFileReady(e.FullPath, maxAttempts: 10, delayMilliseconds: 200);
        if (!ready)
        {
            return;
        }

        var fileInfo = new FileInfo(e.FullPath);
        CurrentFile = new InputFile(fileInfo.FullName, fileInfo.Name, fileInfo.LastWriteTime);
        _currentFileDate = parsedDate;

        StatusUpdated?.Invoke($"Now current: {fileInfo.Name}");
    }
}

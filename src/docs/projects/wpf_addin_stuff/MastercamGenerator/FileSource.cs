namespace MastercamGenerator;

public class FileSource
{
    public string? SelectDirectory()
    {
        var dialog = new Microsoft.Win32.OpenFolderDialog();
        bool? result = dialog.ShowDialog();
        if (result == true)
        {
            return dialog.FolderName;
        }

        return null;
    }
}

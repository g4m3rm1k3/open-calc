using System.IO;

namespace MastercamGenerator;

public class DirectoryScanner
{
    public List<InputFile> ScanDirectory(string directoryPath)
    {
        var results = new List<InputFile>();

        try
        {
            var directory = new DirectoryInfo(directoryPath);
            FileInfo[] files = directory.GetFiles("*.xml");

            foreach (var file in files)
            {
                results.Add(new InputFile(file.FullName, file.Name, file.LastWriteTime));
            }
        }
        catch (DirectoryNotFoundException)
        {
            return results;
        }

        return results;
    }
}

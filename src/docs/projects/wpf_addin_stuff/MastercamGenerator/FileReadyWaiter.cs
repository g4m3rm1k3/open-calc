using System.IO;

namespace MastercamGenerator;

public class FileReadyWaiter
{
    public bool WaitForFileReady(string filePath, int maxAttempts, int delayMilliseconds)
    {
        for (int attempt = 0; attempt < maxAttempts; attempt++)
        {
            if (IsFileReady(filePath))
            {
                return true;
            }

            Thread.Sleep(delayMilliseconds);
        }

        return false;
    }

    private bool IsFileReady(string filePath)
    {
        try
        {
            using FileStream stream = File.Open(filePath, FileMode.Open, FileAccess.Read, FileShare.None);
            return true;
        }
        catch (IOException)
        {
            return false;
        }
    }
}

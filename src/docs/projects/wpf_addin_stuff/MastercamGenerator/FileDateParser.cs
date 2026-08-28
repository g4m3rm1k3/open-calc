using System.Globalization;
using System.IO;

namespace MastercamGenerator;

public class FileDateParser
{
    public DateTime? TryParseDate(string fileName)
    {
        string nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        string[] parts = nameWithoutExtension.Split('_');

        if (parts.Length != 3)
        {
            return null;
        }

        string combined = parts[1] + "_" + parts[2];

        bool parsed = DateTime.TryParseExact(
            combined,
            "yyyy-MM-dd_HHmm",
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out DateTime result);

        if (parsed)
        {
            return result;
        }

        return null;
    }
}

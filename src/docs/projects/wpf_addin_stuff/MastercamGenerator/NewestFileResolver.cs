namespace MastercamGenerator;

public class NewestFileResolver
{
    private readonly FileDateParser _fileDateParser = new FileDateParser();

    public InputFile? FindNewest(IEnumerable<InputFile> files)
    {
        IEnumerable<InputFile> candidates = files.Where(file => _fileDateParser.TryParseDate(file.FileName) != null);

        return candidates.MaxBy(file => _fileDateParser.TryParseDate(file.FileName));
    }
}

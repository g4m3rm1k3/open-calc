using System.Xml.Linq;

namespace MastercamGenerator;

public class SetupSheetQueries
{
    public string? GetRootMetadata(XDocument document, string elementName)
    {
        return document.Root?.Element(elementName)?.Value;
    }

    public string? GetNcFileName(XElement ncFile)
    {
        return ncFile.Attribute("NAME")?.Value;
    }

    public IEnumerable<XElement> FindNcFiles(XDocument document)
    {
        return document.Root!.Elements("NCFILE");
    }

    public IEnumerable<XElement> FindOperations(XElement ncFile)
    {
        return ncFile.Elements("OPERATION");
    }

    public IEnumerable<XElement> FindDirectTools(XElement ncFile)
    {
        return ncFile.Elements("TOOL");
    }

    public IEnumerable<XElement> FindAllTools(XElement ncFile)
    {
        return ncFile.Descendants("TOOL");
    }
}

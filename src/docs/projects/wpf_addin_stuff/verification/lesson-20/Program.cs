using System.Xml.Linq;

// Real verification: run the real parser against the real sample file.

string filePath = @"c:\Users\g4m3r\Documents\testing tutorials\open-calc\src\docs\projects\wpf_addin_stuff\MastercamGenerator\SampleData\SetupSheet_2026-08-26_0512.xml";
var parser = new SetupSheetParser();
Part part = parser.ParseFile(filePath);

Console.WriteLine($"Part.Description: \"{part.Description}\"");
Console.WriteLine($"Part.Customer: \"{part.Customer}\"");
Console.WriteLine($"Part.PartNumber (no source in this file): \"{part.PartNumber}\"");
Console.WriteLine($"NcFiles.Count: {part.NcFiles.Count}");

foreach (var ncFile in part.NcFiles)
{
    Console.WriteLine($"  NcFile \"{ncFile.ProgramName}\", Operations.Count: {ncFile.Operations.Count}");
    foreach (var operation in ncFile.Operations)
    {
        Console.WriteLine($"    Operation {operation.SequenceNumber}: \"{operation.Description}\", Tool #{operation.Tool.Number} \"{operation.Tool.Description}\", Holder: \"{operation.Tool.Assembly.Holder}\"");
    }
}

// Domain model, copied to match Lessons 16-19 exactly.

public class Part
{
    public string PartNumber { get; set; } = "";
    public string Description { get; set; } = "";
    public string Customer { get; set; } = "";
    public string Revision { get; set; } = "";
    public List<NcFile> NcFiles { get; set; } = new List<NcFile>();
}

public class NcFile
{
    public string ProgramName { get; set; } = "";
    public string ProgramNumber { get; set; } = "";
    public List<Operation> Operations { get; set; } = new List<Operation>();
}

public class Operation
{
    public int SequenceNumber { get; set; }
    public string Description { get; set; } = "";
    public Tool Tool { get; set; } = new Tool();
}

public class Tool
{
    public int Number { get; set; }
    public string Description { get; set; } = "";
    public string Comment { get; set; } = "";
    public Assembly Assembly { get; set; } = new Assembly();
}

public class Assembly
{
    public string Holder { get; set; } = "";
}

// SetupSheetQueries, copied to match Lesson 15, plus this lesson's own
// new GetOperationTool method.

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

    public XElement? GetOperationTool(XElement operation)
    {
        return operation.Element("TOOL");
    }
}

// SetupSheetParser, this lesson's own real subject.

public class SetupSheetParser
{
    private readonly SetupSheetQueries _queries = new SetupSheetQueries();

    public Part ParseFile(string filePath)
    {
        XDocument document = XDocument.Load(filePath);

        var part = new Part();
        part.Description = _queries.GetRootMetadata(document, "DESCRIPTION") ?? "";
        part.Customer = _queries.GetRootMetadata(document, "CUSTOMER") ?? "";

        foreach (XElement ncFileElement in _queries.FindNcFiles(document))
        {
            var ncFile = new NcFile();
            ncFile.ProgramName = _queries.GetNcFileName(ncFileElement) ?? "";

            foreach (XElement operationElement in _queries.FindOperations(ncFileElement))
            {
                var operation = new Operation();

                string? numberText = operationElement.Attribute("NUMBER")?.Value;
                int.TryParse(numberText, out int sequenceNumber);
                operation.SequenceNumber = sequenceNumber;

                operation.Description = operationElement.Element("DESCRIPTION")?.Value ?? "";

                XElement? toolElement = _queries.GetOperationTool(operationElement);
                if (toolElement != null)
                {
                    string? toolNumberText = toolElement.Attribute("NUMBER")?.Value;
                    int.TryParse(toolNumberText, out int toolNumber);
                    operation.Tool.Number = toolNumber;
                    operation.Tool.Description = toolElement.Element("DESCRIPTION")?.Value ?? "";
                    operation.Tool.Assembly.Holder = toolElement.Element("ASSEMBLY")?.Element("HOLDER")?.Value ?? "";
                }

                ncFile.Operations.Add(operation);
            }

            part.NcFiles.Add(ncFile);
        }

        return part;
    }
}

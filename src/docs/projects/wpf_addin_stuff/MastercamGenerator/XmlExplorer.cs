using System.Xml.Linq;

namespace MastercamGenerator;

public class XmlExplorer
{
    public string DescribeTree(string filePath)
    {
        XDocument document = XDocument.Load(filePath);
        return DescribeElement(document.Root!, 0);
    }

    private string DescribeElement(XElement element, int depth)
    {
        string indent = new string(' ', depth * 2);
        string line = indent + element.Name;

        foreach (XAttribute attribute in element.Attributes())
        {
            line = line + " [" + attribute.Name + "=" + attribute.Value + "]";
        }

        string result = line + "\n";

        foreach (XElement child in element.Elements())
        {
            result = result + DescribeElement(child, depth + 1);
        }

        return result;
    }
}

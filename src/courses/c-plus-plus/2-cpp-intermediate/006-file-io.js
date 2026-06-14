const WRITE_CODE = `#include <iostream>
#include <fstream>
using namespace std;

// __OUTPUT__: wrote 3 lines\\n--- reading back ---\\nAlice,92,3.8\\nBob,87,3.5\\nCharlie,95,3.9

int main() {
    // ofstream: write text file — RAII closes it when scope ends
    {
        ofstream out("students.txt");
        if (!out) { cerr << "Cannot create file\\n"; return 1; }
        out << "Alice,92,3.8\\n";
        out << "Bob,87,3.5\\n";
        out << "Charlie,95,3.9\\n";
        cout << "wrote 3 lines\\n";
    }   // file closed automatically

    // ifstream: read line by line
    cout << "--- reading back ---\\n";
    ifstream in("students.txt");
    string line;
    while (getline(in, line)) cout << line << "\\n";

    return 0;
}`;

const PARSE_CODE = `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
using namespace std;

// __OUTPUT__: Alice score=92 gpa=3.8\\nBob score=87 gpa=3.5\\nCharlie score=95 gpa=3.9

int main() {
    // Assumes students.txt exists from previous run
    ifstream in("students.txt");
    string line;
    while (getline(in, line)) {
        stringstream ss(line);
        string name, scoreStr, gpaStr;
        getline(ss, name,     ',');   // read up to comma
        getline(ss, scoreStr, ',');
        getline(ss, gpaStr,   ',');

        int    score = stoi(scoreStr);
        double gpa   = stod(gpaStr);
        cout << name << " score=" << score << " gpa=" << gpa << "\\n";
    }
    return 0;
}`;

const SSTREAM_CODE = `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: tokens: hello world foo bar\\nbuilt: score=42 name=Alice

int main() {
    // stringstream as a string-to-stream parser
    string sentence = "hello world foo bar";
    stringstream parser(sentence);
    string word;
    cout << "tokens: ";
    while (parser >> word) cout << word << " ";
    cout << "\\n";

    // stringstream as a string builder
    stringstream builder;
    int score = 42;
    string name = "Alice";
    builder << "score=" << score << " name=" << name;
    cout << "built: " << builder.str() << "\\n";

    return 0;
}`;

const APPEND_CODE = `#include <iostream>
#include <fstream>
#include <string>
using namespace std;

// __OUTPUT__: appended Diana\\nlines: 4

int main() {
    // ios::app — opens at end, doesn't truncate existing content
    {
        ofstream out("students.txt", ios::app);
        out << "Diana,88,3.6\\n";
        cout << "appended Diana\\n";
    }

    // Count lines to verify
    ifstream in("students.txt");
    string line;
    int count = 0;
    while (getline(in, line)) count++;
    cout << "lines: " << count << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-1-006",
  slug: "file-io",
  chapter: "cpp-1",
  order: 6,
  title: "File I/O",
  subtitle: "Read and write files with ifstream, ofstream, and stringstream",
  tags: ["c++", "cpp", "file-io", "ifstream", "ofstream", "fstream", "stringstream", "csv"],
  aliases: [
    "c++ file io",
    "c++ read file",
    "c++ write file",
    "c++ fstream",
    "c++ stringstream",
  ],

  hook: `Programs that can only read from stdin and write to stdout can't persist anything. File I/O connects your program to the filesystem — read configs, write logs, process CSV data, save game state. C++ streams make it the same interface as cin/cout.`,

  mentalModel: [
    "**`ofstream` writes, `ifstream` reads.** Both follow RAII — the file is opened in the constructor and closed when the stream object goes out of scope. Use `if (!out)` to check if the file opened successfully before writing.",
    "**`getline(stream, string)` reads one line at a time.** Returns false at EOF, so `while (getline(in, line))` reads until the file is exhausted. The `>>` operator reads whitespace-delimited tokens — same as `cin >>`. Both work on any `istream`.",
    "**`stringstream` treats a string as a stream.** Use it to parse formatted strings (CSV fields) or build strings from multiple values. `getline(ss, field, ',')` reads up to a delimiter — perfect for CSV parsing.",
  ],

  intuition: {
    prose: [
      "**ofstream and ifstream are just cin/cout redirected to a file.** Everything you know about `cout << x` and `cin >> x` and `getline` works identically with file streams. The stream abstraction is the same — only the data source/sink changes.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Write and read — run it then explore:**\n\n- Change the student data. Re-run — does the file update?\n- Add a fourth student and read it back.\n- What happens if you open the file for reading before it's been written? (stream is in fail state)\n- Try `out << 42 << \" \" << 3.14 << \"\\n\"` — numbers work just like cout.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": WRITE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**CSV parsing — run it then explore:**\n\n- Add a fourth field (e.g., `major`) to the CSV and parse it.\n- What does `stoi` do with a non-numeric string? (throws invalid_argument)\n- Try `getline(ss, field, '|')` with pipe-separated data.\n- Sort the parsed students by score — store in a vector of structs.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PARSE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`stringstream` as string builder.** `stringstream ss; ss << \"x=\" << x << \" y=\" << y; return ss.str()` builds a formatted string. This is how `to_string` works under the hood, and is cleaner than concatenating with `+` for complex formatting. `ss.str(\"\")` resets the stream for reuse.",
      "**File open modes.** `ios::in` (read), `ios::out` (write+truncate), `ios::app` (append), `ios::binary` (binary mode), `ios::trunc` (truncate on open). Combine with `|`: `ios::out | ios::binary`. Default for `ofstream` is `ios::out | ios::trunc` — the file is created fresh every time. Use `ios::app` to add without destroying existing content.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**stringstream — run it then explore:**\n\n- Try `parser >> int_val >> double_val` on a string like `\"42 3.14\"` — does it work?\n- Use `stringstream` to split a comma-separated string into a vector of tokens.\n- Build a JSON-like string: `ss << \"{\\\"name\\\": \\\"\" << name << \"\\\"}\"` — escape quotes with `\\\"`.\n- `ss.str()` vs `ss.rdbuf()` — what's the difference?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": SSTREAM_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Append mode — run it then explore:**\n\n- Run the program twice — does Diana appear twice? (Yes — each run appends)\n- Change `ios::app` to `ios::out` — what happens to the file? (overwritten)\n- Count lines before and after appending to verify.\n- Try `ios::out | ios::app` — same as `ios::app`?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": APPEND_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Always check if file opened successfully",
        body: "`ifstream in(\"missing.txt\");` doesn't throw — it silently fails. Check: `if (!in) { cerr << \"File not found\\n\"; return; }`. Or check `.is_open()`. All reads from a failed stream return empty/zero values.",
      },
      {
        type: "tip",
        title: "RAII closes files automatically",
        body: "You don't need to call `.close()` explicitly — the destructor does it when the stream goes out of scope. Wrap in a block `{ ofstream out(\"f.txt\"); ... }` if you need to close before the end of the function.",
      },
    ],
  },

  examples: [
    {
      title: "Read lines into a vector",
      body: `vector<string> readLines(const string& path) {
    ifstream in(path);
    if (!in) throw runtime_error("Cannot open: " + path);

    vector<string> lines;
    string line;
    while (getline(in, line)) lines.push_back(line);
    return lines;
}

auto lines = readLines("data.txt");
cout << "Read " << lines.size() << " lines\\n";`,
    },
    {
      title: "Write a CSV from a struct",
      body: `struct Student { string name; int score; double gpa; };

void writeCSV(const string& path, const vector<Student>& students) {
    ofstream out(path);
    out << "name,score,gpa\\n";   // header
    for (const auto& s : students) {
        out << s.name << "," << s.score << "," << s.gpa << "\\n";
    }
}

vector<Student> s = {{"Alice",92,3.8}, {"Bob",87,3.5}};
writeCSV("out.csv", s);`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that reads a text file word by word (using `in >> word`) and prints: (1) the total word count, (2) the count of unique words using `set<string>`, (3) the longest word. Create a test file first by writing several sentences to it.",
      hint: "`set<string> unique; while (in >> word) { count++; unique.insert(word); ... }`. Longest: compare `word.length()` with current max.",
      walkthrough: [
        "Write test file: ofstream out; out << \"hello world hello foo\";",
        "Open for reading: ifstream in;",
        "while (in >> word): count++; unique.insert(word); if word.length() > longest.length(): longest = word",
        "Print count, unique.size(), longest",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a word frequency counter that reads a file and writes a sorted frequency report to another file. Format: `word: count` sorted by count descending, then alphabetically for ties. Use `map<string,int>` for counting and `vector<pair<string,int>>` for sorting.",
      hint: "Count: `map<string,int> freq; while (in >> w) freq[w]++;`. Sort: copy to vector, sort with custom comparator: higher count first, then alphabetical.",
      walkthrough: [
        "Read: ifstream in; string w; map<string,int> freq; while(in>>w) freq[w]++;",
        "Copy to vector: for (auto& p : freq) v.push_back(p);",
        "Sort: sort by -p.second, then p.first",
        "Write: ofstream out; for (auto& [w,c] : v) out << w << \": \" << c << \"\\n\";",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-006-q1",
        type: "choice",
        text: "What does `ofstream out(\"data.txt\")` do if `data.txt` already exists?",
        options: [
          "Throws an exception",
          "Opens in append mode by default",
          "Truncates (overwrites) the file by default",
          "Opens read-only",
        ],
        answer: 2,
        explanation:
          "`ofstream` defaults to `ios::out | ios::trunc` — it creates the file if it doesn't exist, and truncates (empties) it if it does. Use `ios::app` to append without truncating.",
      },
      {
        id: "cpp1-006-q2",
        type: "choice",
        text: "What does `while (getline(in, line))` do at end of file?",
        options: [
          "Throws an exception",
          "getline returns false/0 (stream in fail state), exiting the loop",
          "Loops forever reading empty strings",
          "The last line is read twice",
        ],
        answer: 1,
        explanation:
          "`getline` returns a reference to the stream, which converts to `false` when the stream is in a fail or EOF state. At end of file, the loop exits cleanly.",
      },
      {
        id: "cpp1-006-q3",
        type: "choice",
        text: "What does `stringstream ss(\"42,Alice\"); getline(ss, s, ',')`  give `s`?",
        options: [
          '"42,Alice"',
          '"42"',
          '"Alice"',
          "Throws an exception",
        ],
        answer: 1,
        explanation:
          "`getline(stream, string, delimiter)` reads up to the delimiter. Here it reads until the comma, giving `\"42\"`. The next call would give `\"Alice\"`.",
      },
      {
        id: "cpp1-006-q4",
        type: "choice",
        text: "What is the advantage of `ofstream` over C's `fopen`/`fprintf`?",
        options: [
          "ofstream is faster",
          "ofstream applies RAII — the file is automatically closed when the object goes out of scope",
          "ofstream supports binary mode; fopen does not",
          "ofstream is type-safe for all basic types",
        ],
        answer: 1,
        explanation:
          "`ofstream` (and all C++ streams) apply RAII — the destructor closes the file. You don't need to `fclose` explicitly. Even on exceptions or early returns, the file is closed correctly.",
      },
    ],
  },
};

export default lesson;

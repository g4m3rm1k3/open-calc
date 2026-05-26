const FILEIO_CODE = `#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

// __OUTPUT__: --- Writing a text file ---\\nWrote 3 students to students.txt\\n--- Reading back line by line ---\\nAlice,92,3.8\\nBob,87,3.5\\nCharlie,95,3.9\\n--- Parsing CSV data ---\\nName: Alice   Score: 92  GPA: 3.8\\nName: Bob     Score: 87  GPA: 3.5\\nName: Charlie Score: 95  GPA: 3.9\\n--- Checking file existence ---\\nstudents.txt exists\\n--- Appending to file ---\\nDiana,88,3.6\\n(now has 4 students)\\n--- stringstream for string parsing ---\\nTokens: hello world foo bar

int main() {
    // ── Writing text file ──────────────────────────────────────
    cout << "--- Writing a text file ---" << endl;
    {
        ofstream out("students.txt");
        if (!out) { cerr << "Cannot create file" << endl; return 1; }
        out << "Alice,92,3.8" << endl;
        out << "Bob,87,3.5"   << endl;
        out << "Charlie,95,3.9" << endl;
        cout << "Wrote 3 students to students.txt" << endl;
    }  // ofstream destructor closes the file

    // ── Reading line by line ───────────────────────────────────
    cout << "--- Reading back line by line ---" << endl;
    {
        ifstream in("students.txt");
        string line;
        while (getline(in, line)) {
            cout << line << endl;
        }
    }

    // ── Parsing CSV ────────────────────────────────────────────
    cout << "--- Parsing CSV data ---" << endl;
    {
        ifstream in("students.txt");
        string line;
        while (getline(in, line)) {
            stringstream ss(line);
            string name, scoreStr, gpaStr;
            getline(ss, name,     ',');
            getline(ss, scoreStr, ',');
            getline(ss, gpaStr,   ',');
            int    score = stoi(scoreStr);
            double gpa   = stod(gpaStr);
            printf("Name: %-8s Score: %-3d GPA: %.1f\\n",
                   name.c_str(), score, gpa);
        }
    }

    // ── File existence check ───────────────────────────────────
    cout << "--- Checking file existence ---" << endl;
    {
        ifstream test("students.txt");
        cout << (test.is_open() ? "students.txt exists" : "not found") << endl;
    }

    // ── Appending ─────────────────────────────────────────────
    cout << "--- Appending to file ---" << endl;
    {
        ofstream out("students.txt", ios::app);   // append mode
        out << "Diana,88,3.6" << endl;
    }
    {
        ifstream in("students.txt");
        string line;
        int count = 0;
        while (getline(in, line)) { cout << line << endl; count++; }
        cout << "(now has " << count << " students)" << endl;
    }

    // ── stringstream for string parsing ───────────────────────
    cout << "--- stringstream for string parsing ---" << endl;
    string sentence = "hello world foo bar";
    stringstream parser(sentence);
    string word;
    cout << "Tokens: ";
    while (parser >> word) cout << word << " ";
    cout << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-1-006",
  slug: "file-io",
  chapter: "cpp-1",
  order: 6,
  title: "File I/O with fstream",
  subtitle: "Read and write files using ifstream, ofstream, and stringstream",
  tags: ["c++", "cpp", "file-io", "fstream", "ifstream", "ofstream", "stringstream", "csv"],
  aliases: [
    "c++ file reading",
    "c++ write to file",
    "c++ fstream",
    "c++ read csv",
    "c++ file input output",
  ],

  hook: `Programs that can't persist data restart from scratch every run. File I/O bridges the gap between runtime and storage. C++'s stream library uses the same \`<<\` and \`>>\` interface as \`cout\`/\`cin\` — so once you know console I/O, file I/O is 90% familiar. The remaining 10% is about error handling, modes, and binary vs text.`,

  mentalModel: [
    "**`ifstream` is a file-backed input stream.** `ifstream in(\"data.txt\");` opens the file for reading. Then use `in >> x` or `getline(in, line)` exactly as you would with `cin`. The destructor closes the file when `in` goes out of scope (RAII). If the file doesn't exist, the stream is in a fail state — always check `if (!in)` after opening.",
    "**`ofstream` is a file-backed output stream.** `ofstream out(\"results.txt\");` creates/overwrites the file. Write with `out << data`. The file is flushed and closed when `out` destructs. Open modes: `ios::app` (append), `ios::binary` (binary mode), `ios::trunc` (truncate, default). Passing a non-existent path's parent directory causes failure — check the result.",
    "**`stringstream` treats a string like a stream.** Build a string using `<<`: `stringstream ss; ss << 3.14 << \" \" << 42;`. Parse a string using `>>`: `stringstream ss(\"3.14 42\"); double d; int i; ss >> d >> i;`. Excellent for type conversions and for parsing structured text (CSV lines, configuration files).",
  ],

  intuition: {
    prose: [
      "**All `*stream` classes share the same interface.** `cin`/`cout` use `basic_istream`/`basic_ostream` under the hood. `ifstream`/`ofstream` also inherit from these. `stringstream` also inherits from them. This means any function that takes `istream&` works with `cin`, `ifstream`, or `stringstream` — write once, use with any input source. This design pattern (stream abstraction) is extremely powerful for testing: pass a `stringstream` in tests instead of a real file.",
      "**Error handling for file operations.** Always check the stream state after opening: `if (!in) { cerr << \"Error: \" << ...; }`. After reads: `if (in.fail())` or just `if (!in)`. After writes: `if (!out.good())`. For production code, also handle `out.flush()` failing (full disk, network error). Using RAII (scoped streams) ensures files are always closed even on exceptions.",
      "**Text mode vs binary mode.** By default, `fstream` opens in text mode — on Windows, `\\n` in your string becomes `\\r\\n` on disk (CRLF). Open with `ios::binary` for exact byte-for-byte I/O: `ifstream in(\"image.png\", ios::binary)`. Always use binary mode for non-text files (images, binaries, compressed data) to prevent platform-specific newline translation.",
      "**`stringstream` for CSV parsing.** The classic pattern: `getline(fullStream, line)` reads one line; then `stringstream ss(line); getline(ss, field, ',')` extracts comma-separated fields. This is robust to spaces within fields and is cleaner than manually scanning for commas. `stoi(str)`, `stod(str)` convert field strings to numbers.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**File I/O hands-on:**\n\n1. Compile and run — watch the file create/read/append cycle\n2. After running: `cat students.txt` to see the file content\n3. Run `./app` twice — does it append or overwrite on second run?\n4. Modify to read binary: `ifstream in(\"students.txt\", ios::binary)` — use `in.read(buf, n)`\n5. Add error handling: what if you try to open `/root/secret.txt`?\n6. Use stringstream to build a formatted report string before writing it to a file",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": FILEIO_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Stream state flags.** Each stream maintains four state bits: `good()` (no errors), `eof()` (end-of-file), `fail()` (logical error, e.g., type mismatch), `bad()` (hardware/OS error). After a failed operation, the stream is 'stuck' — subsequent operations do nothing until you call `clear()` to reset flags. `eof()` alone doesn't mean failure — it means 'the last read hit end of file', which is a normal loop termination. The common pattern: `while (in >> x)` works because `>>` returns the stream reference, and a stream in fail/eof state converts to `false`.",
      "**Random access with `seekg`/`seekp`.** Streams support seeking: `in.seekg(0)` jumps to the beginning; `in.seekg(0, ios::end); in.tellg()` gives file size. This enables binary file editing, index-based lookup, and multi-pass parsing. For text files, byte offsets from `tellg()` are valid but line-counting requires full parsing. `seekg` (seek get) for reading, `seekp` (seek put) for writing.",
      "**`std::filesystem` (C++17).** The `<filesystem>` header provides portable file system operations: `fs::exists(path)`, `fs::file_size(path)`, `fs::create_directories(path)`, `fs::copy_file(src, dst)`, `fs::directory_iterator` for listing files. Before C++17, these operations required platform-specific code or Boost.Filesystem. Always prefer `std::filesystem` for portability.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Always check if the file opened successfully",
        body: "If `ifstream in(\"file.txt\")` fails (file not found, permission denied), the stream is in a fail state. Subsequent reads return nothing or empty. Always check: `if (!in) { cerr << \"Cannot open file\\n\"; return 1; }`. Don't silently process an empty stream as if data was read.",
      },
      {
        type: "info",
        title: "RAII closes files automatically",
        body: "You don't need to call `in.close()` manually — the ifstream/ofstream destructor closes the file. But explicitly closing before checking for write errors is correct: `out.close(); if (!out) { /* handle write error */ }`. For files opened in a loop, explicit close+reopen is necessary.",
      },
      {
        type: "tip",
        title: "getline vs >> for reading lines",
        body: "`in >> word` reads one whitespace-delimited token. `getline(in, line)` reads until newline (inclusive, but doesn't store the '\\n'). For reading lines of text: use `getline`. For reading structured tokens (numbers, words): use `>>`. Mix carefully — `>>` leaves the newline in the buffer; `getline` after `>>` reads an empty string. Use `in.ignore()` between them.",
      },
    ],
  },

  examples: [
    {
      title: "Write and read a binary file",
      body: `struct Record {
    int id;
    double value;
    char name[32];
};

// Write records in binary
ofstream out("data.bin", ios::binary);
Record r1{1, 3.14, "pi"};
Record r2{2, 2.72, "e"};
out.write(reinterpret_cast<const char*>(&r1), sizeof(r1));
out.write(reinterpret_cast<const char*>(&r2), sizeof(r2));
out.close();

// Read records back
ifstream in("data.bin", ios::binary);
Record r;
while (in.read(reinterpret_cast<char*>(&r), sizeof(r))) {
    cout << r.id << " " << r.value << " " << r.name << endl;
}`,
    },
    {
      title: "Generic stream function — works with file or cin",
      body: `// Works with any input stream: cin, ifstream, stringstream
int countWords(istream& in) {
    string word;
    int count = 0;
    while (in >> word) count++;
    return count;
}

// From file
ifstream file("story.txt");
if (file) cout << "File words: " << countWords(file) << endl;

// From string (for testing)
stringstream ss("the quick brown fox");
cout << "String words: " << countWords(ss) << endl;  // 4

// From stdin
// cout << "Type text (Ctrl+D to end): ";
// cout << "Stdin words: " << countWords(cin) << endl;`,
    },
    {
      title: "Config file parser",
      body: `// Parse key=value config files
map<string, string> parseConfig(const string& filename) {
    map<string, string> config;
    ifstream in(filename);
    string line;
    while (getline(in, line)) {
        // Skip empty lines and comments
        if (line.empty() || line[0] == '#') continue;
        auto eq = line.find('=');
        if (eq == string::npos) continue;
        string key   = line.substr(0, eq);
        string value = line.substr(eq + 1);
        // Trim whitespace
        key.erase(key.find_last_not_of(" \\t") + 1);
        value.erase(0, value.find_first_not_of(" \\t"));
        config[key] = value;
    }
    return config;
}

// Config file: "host = localhost\nport = 8080\n"
// auto cfg = parseConfig("app.conf");
// cout << cfg["host"] << ":" << cfg["port"] << endl;`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a word frequency counter that reads a text file (create it with `echo 'hello world hello foo bar foo foo' > words.txt`), counts how many times each word appears using `map<string, int>`, and writes the results to `freq.txt` as 'word: count' sorted alphabetically. Verify with `cat freq.txt`.",
      hint: "Use `ifstream in(\"words.txt\"); while (in >> word) freq[word]++;` Then `ofstream out(\"freq.txt\"); for (auto& [w,c] : freq) out << w << \": \" << c << endl;`",
      walkthrough: [
        "Create words.txt: `echo 'hello world hello foo' > words.txt`",
        "Open ifstream, while (in >> word) freq[word]++",
        "Open ofstream for output",
        "for (auto& [k,v] : freq) out << k << \": \" << v << endl",
        "map auto-sorts by key, so output is alphabetical",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a simple CSV student database. Write a `Student` struct and functions: `void saveCSV(const vector<Student>&, string filename)` and `vector<Student> loadCSV(string filename)`. Use `to_string`/`stoi`/`stod` for conversions. Round-trip test: save 3 students, load them back, verify the data is identical.",
      hint: "Save: `out << s.name << ',' << s.score << ',' << s.gpa << endl;`. Load: getline(in, line) then parse with stringstream + getline(ss, field, ',')",
      walkthrough: [
        "struct Student { string name; int score; double gpa; };",
        "saveCSV: for each student: out << name << ',' << score << ',' << gpa << endl;",
        "loadCSV: while (getline(in, line)) { parse with stringstream; stoi/stod; push_back }",
        "Test: save, load, compare field by field",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-006-q1",
        type: "choice",
        text: "What happens to an `ofstream` when it goes out of scope?",
        options: [
          "The file is left open and must be closed manually",
          "The destructor flushes the buffer and closes the file automatically (RAII)",
          "The file content is deleted",
          "The ofstream becomes an ifstream",
        ],
        answer: 1,
        explanation:
          "`ofstream` follows RAII — its destructor flushes any buffered data and closes the file when it goes out of scope. This is why putting file streams in their own `{}` blocks is a good pattern: the file is closed as soon as you're done with it.",
      },
      {
        id: "cpp1-006-q2",
        type: "choice",
        text: "What is `stringstream` used for?",
        options: [
          "Reading from stdin",
          "Treating a string as an input/output stream for parsing and formatting",
          "Writing to stderr",
          "Compressed string storage",
        ],
        answer: 1,
        explanation:
          "`stringstream` lets you use stream operations (`<<`, `>>`, `getline`) on a string. Use it to parse structured text (`\"3.14 42\"` → double + int), to build strings incrementally, or as a drop-in replacement for file/cin streams in testing.",
      },
      {
        id: "cpp1-006-q3",
        type: "choice",
        text: "How do you open a file for appending (adding to the end without overwriting)?",
        options: [
          "`ofstream out(\"file.txt\", ios::write)`",
          "`ofstream out(\"file.txt\", ios::app)`",
          "`ofstream out(\"file.txt\", ios::append_only)`",
          "`ifstream out(\"file.txt\")`",
        ],
        answer: 1,
        explanation:
          "`ios::app` (append) flag makes `ofstream` seek to the end before each write, preserving existing content. The default mode truncates the file on open. `ios::ate` also seeks to end initially but allows seeking elsewhere afterwards.",
      },
      {
        id: "cpp1-006-q4",
        type: "choice",
        text: "Why should you use `ios::binary` when reading/writing non-text files?",
        options: [
          "Binary mode is faster than text mode",
          "Binary mode prevents newline translation (\\n ↔ \\r\\n on Windows) and reads/writes exact bytes",
          "Binary mode is required for files larger than 4GB",
          "Binary mode enables random access",
        ],
        answer: 1,
        explanation:
          "In text mode, `\\n` may be translated to `\\r\\n` (CRLF) on Windows. For binary files (images, executables, compressed data), this translation corrupts the data. `ios::binary` disables translation and reads/writes exact byte sequences.",
      },
    ],
  },
};

export default lesson;

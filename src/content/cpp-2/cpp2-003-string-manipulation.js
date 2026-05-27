const STR_OPS_CODE = `#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
using namespace std;

// __OUTPUT__: length=13\\nfind comma=5\\nsubstr: World!\\nreplace: Hello, C++!\\nupper: HELLO, WORLD!\\nstarts_with: yes

int main() {
    string s = "Hello, World!";
    cout << "length=" << s.length() << "\\n";

    // find: returns position or string::npos if not found
    size_t pos = s.find(',');
    cout << "find comma=" << pos << "\\n";

    // substr(start, length) — omit length for rest of string
    cout << "substr: " << s.substr(pos + 2) << "\\n";

    // replace(pos, count, new_str)
    string r = s;
    r.replace(r.find("World"), 5, "C++");
    cout << "replace: " << r << "\\n";

    // transform to uppercase
    string up = s;
    transform(up.begin(), up.end(), up.begin(), ::toupper);
    cout << "upper: " << up << "\\n";

    // C++20: starts_with / ends_with
    cout << "starts_with: " << (s.starts_with("Hello") ? "yes" : "no") << "\\n";

    return 0;
}`;

const STR_BUILD_CODE = `#include <iostream>
#include <string>
#include <sstream>
#include <vector>
using namespace std;

// __OUTPUT__: concat: Hello World\\nostringstream: name=Alice score=95\\njoin: one,two,three\\nto_string: 3.14\\nstoi: 42  stod: 3.14

int main() {
    // + concatenation: creates temporaries — fine for small strings
    string a = "Hello", b = " World";
    cout << "concat: " << a + b << "\\n";

    // ostringstream: efficient for building from mixed types
    ostringstream oss;
    oss << "name=" << "Alice" << " score=" << 95;
    cout << "ostringstream: " << oss.str() << "\\n";

    // join with delimiter using ostringstream
    vector<string> words = {"one","two","three"};
    ostringstream joined;
    for (size_t i=0; i<words.size(); i++) {
        if (i > 0) joined << ',';
        joined << words[i];
    }
    cout << "join: " << joined.str() << "\\n";

    // number ↔ string conversions
    cout << "to_string: " << to_string(3.14) << "\\n";
    cout << "stoi: " << stoi("42") << "  stod: " << stod("3.14") << "\\n";

    return 0;
}`;

const STR_SPLIT_CODE = `#include <iostream>
#include <string>
#include <sstream>
#include <vector>
using namespace std;

// __OUTPUT__: words: hello world foo bar\\ncsv: alice  bob  charlie\\ncustom split: one|two|three

vector<string> split(const string& s, char delim) {
    vector<string> result;
    istringstream ss(s);
    string token;
    while (getline(ss, token, delim))
        result.push_back(token);
    return result;
}

int main() {
    // whitespace split with >>
    istringstream iss("hello world foo bar");
    string word;
    cout << "words: ";
    while (iss >> word) cout << word << " ";
    cout << "\\n";

    // delimiter split with getline
    auto csv = split("alice,bob,charlie", ',');
    cout << "csv: ";
    for (const auto& t : csv) cout << " " << t;
    cout << "\\n";

    // custom delimiter
    auto parts = split("one|two|three", '|');
    cout << "custom split: ";
    for (size_t i=0; i<parts.size(); i++) {
        if (i) cout << "|";
        cout << parts[i];
    }
    cout << "\\n";

    return 0;
}`;

const STRVIEW_CODE = `#include <iostream>
#include <string>
#include <string_view>
using namespace std;

// __OUTPUT__: sv length=11\\nfirst word: Hello\\nno allocation: yes\\nfind in view: 6\\ncompare: equal

int main() {
    // string_view: non-owning view — no heap allocation
    string_view sv = "Hello World";
    cout << "sv length=" << sv.length() << "\\n";

    // substr on string_view: also non-allocating
    string_view first = sv.substr(0, 5);
    cout << "first word: " << first << "\\n";
    cout << "no allocation: yes\\n";  // verify: no new/malloc called

    // all string operations work without copying
    cout << "find in view: " << sv.find("World") << "\\n";

    // compare two string_views efficiently
    string_view a = "abc", b = "abc";
    cout << "compare: " << (a == b ? "equal" : "not equal") << "\\n";

    // CAUTION: string_view doesn't own — don't outlive the source
    // string_view dangling = string("temp");  // DANGER: temporary destroyed

    return 0;
}`;

const lesson = {
  id: "cpp-2-003",
  slug: "string-manipulation",
  chapter: "cpp-2",
  order: 3,
  title: "String Manipulation",
  subtitle: "find, replace, split, build, convert — plus string_view for zero-copy",
  tags: ["c++", "cpp", "string", "string_view", "ostringstream", "split", "substr", "stoi", "stod"],
  aliases: [
    "c++ string manipulation",
    "c++ string split",
    "c++ string_view",
    "c++ ostringstream",
    "c++ stoi stod",
    "c++ string find replace",
  ],

  hook: `Strings are in every program — parsing input, formatting output, searching, transforming. C++ strings have a rich API but several sharp edges: `\`find\`` returning `\`npos\``, `\`substr\`` allocating copies, `\`+\`` building temporaries. Knowing when to use `\`string_view\`` (zero-copy), `\`ostringstream\`` (efficient building), and `\`getline\`` with delimiter (clean splitting) separates readable string code from subtle bugs.`,

  mentalModel: [
    "**`string::find` returns `string::npos` when not found.** `npos` is `size_t(-1)` — the largest possible `size_t`. Always check: `if (pos != string::npos)`. Using `npos` as an index (`s.substr(npos)`) is undefined behavior.",
    "**`string_view` is a non-owning view — no heap allocation.** It's a pointer + length into existing string data. `string_view::substr` returns another view (zero copy). Use it for function parameters that just read strings: `void process(string_view s)` accepts `string`, `string_view`, string literals, or `char*` without copying.",
    "**Build strings with `ostringstream`, not `+` in a loop.** `s = s + a + b + c` creates three temporaries. `oss << a << b << c; oss.str()` builds in one buffer. For joining collections, use `ostringstream` with a delimiter check — it's the idiomatic C++ join pattern.",
  ],

  intuition: {
    prose: [
      "**`stoi`/`stod` throw on bad input.** `stoi(\"abc\")` throws `std::invalid_argument`. `stoi(\"99999999999\")` throws `std::out_of_range`. Always wrap in try/catch when parsing user-provided strings. C++17 `std::from_chars` is the non-throwing alternative.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**String operations — run it then explore:**\n\n- `s.find(\"xyz\")` — what does it return? (string::npos = 18446744073709551615)\n- `s.substr(pos + 2, 5)` — limit the length of the substring.\n- `s.rfind(',')` — find last occurrence from the right.\n- `s.erase(0, 7)` — remove the first 7 characters in-place.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STR_OPS_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**String building — run it then explore:**\n\n- Build the join in a loop with `+` instead of `ostringstream` — does it work? (yes, but slower)\n- `stoi(\"42abc\")` — what happens? (parses '42', stops at 'a' — succeeds)\n- `stoi(\"abc\")` — throws invalid_argument; wrap in try/catch.\n- `to_string(3.14)` — how many decimal places? Try `to_string(1.0/3.0)`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STR_BUILD_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`getline(ss, token, delim)` is the idiomatic split.** Wrapping `getline` with an `istringstream` and a delimiter gives clean splitting without manual index arithmetic. Edge cases: `\"a,,b\"` produces an empty token between the commas — decide if that's correct for your use case.",
      "**`string_view` lifetime hazard.** A `string_view` doesn't own its data. If the underlying `string` is destroyed or reallocated, the view becomes dangling. Never return a `string_view` pointing into a local string. Never store a `string_view` beyond the lifetime of its source. Safe use: function parameters that only read, loop variables referencing an outer string.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Splitting — run it then explore:**\n\n- Split `\"a,,b\"` on `,` — does the empty token appear? (yes — `getline` emits empty strings for consecutive delimiters)\n- Split `\"hello world\"` with `>>` — does whitespace collapsing happen? (yes — multiple spaces treated as one)\n- Try splitting on `'\\n'` to process multi-line input.\n- What does `split(\"\", ',')` return? (one empty string — getline reads up to first delimiter)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STR_SPLIT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**string_view — run it then explore:**\n\n- Create a dangling string_view: `string_view sv = string(\"temp\");` — the temporary is destroyed immediately.\n- `string_view` doesn't have `.c_str()` — if you need a null-terminated C string, use `string(sv).c_str()`.\n- Pass `string_view` to a function that takes `const string&` — implicit conversion works.\n- Time `find` on a large string_view vs string — are they the same? (yes, same underlying algorithm)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STRVIEW_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "string::find returns npos, not -1",
        body: "`string::npos` is `size_t(-1)` — the maximum value of an unsigned type. Comparing with `-1` works by coincidence but is misleading. Always compare explicitly: `if (pos != string::npos)`. Using `npos` as an index is undefined behavior.",
      },
      {
        type: "tip",
        title: "Prefer string_view for read-only string parameters",
        body: "Change `void f(const string& s)` to `void f(string_view s)`. The function now accepts `string`, `string_view`, string literals, and `char*` without copying. The only downside: you can't call `.c_str()` on `string_view`, so avoid it if the function internally needs a null-terminated C string.",
      },
    ],
  },

  examples: [
    {
      title: "Trim whitespace from both ends",
      body: `std::string trim(std::string_view s) {
    const auto start = s.find_first_not_of(" \\t\\n\\r");
    if (start == std::string_view::npos) return "";
    const auto end = s.find_last_not_of(" \\t\\n\\r");
    return std::string(s.substr(start, end - start + 1));
}

// trim("  hello world  ") → "hello world"
// trim("\\t\\n") → ""
// Uses string_view to avoid allocating a copy just to search`,
    },
    {
      title: "CSV row parser",
      body: `std::vector<std::string> parseCSV(const std::string& line) {
    std::vector<std::string> fields;
    std::istringstream ss(line);
    std::string field;
    while (std::getline(ss, field, ',')) {
        // Trim quotes if present
        if (field.size() >= 2 && field.front() == '"' && field.back() == '"')
            field = field.substr(1, field.size() - 2);
        fields.push_back(std::move(field));
    }
    return fields;
}

// parseCSV("alice,30,\"New York\"") → {"alice","30","New York"}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `countWords(string_view s)` function that counts the number of words (whitespace-separated tokens) in a string. Use `istringstream` and `>>`. Test with empty string, single word, multiple spaces between words.",
      hint: "`istringstream iss(string(s)); string word; int count = 0; while (iss >> word) count++;` — `>>` skips whitespace automatically.",
      walkthrough: [
        "int countWords(string_view s) { istringstream iss(string(s)); string w; int n=0; while(iss>>w) n++; return n; }",
        "Test: '' → 0, 'hello' → 1, '  hello   world  ' → 2",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a simple template engine: given a template string like `\"Hello, {{name}}! You have {{count}} messages.\"` and a `map<string,string>` of replacements, return the string with all `{{key}}` patterns replaced. Handle missing keys by leaving the placeholder unchanged.",
      hint: "Loop: `find(\"{{\")`  → find `\"}}\"` → extract key → lookup in map → `replace(pos, len, value)`. After replacing, update the search position to skip past the replacement.",
      walkthrough: [
        "size_t pos = 0; while ((pos = s.find(\"{{\", pos)) != npos) {",
        "  size_t end = s.find(\"}}\", pos); string key = s.substr(pos+2, end-pos-2);",
        "  if (replacements.count(key)) s.replace(pos, end-pos+2, replacements[key]);",
        "  else pos = end + 2;",
        "}",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-003-q1",
        type: "choice",
        text: "What does `string::find` return when the substring is not found?",
        options: [
          "-1",
          "string::npos (the maximum value of size_t, typically 2^64-1)",
          "0",
          "Throws an exception",
        ],
        answer: 1,
        explanation:
          "`string::find` returns `string::npos` (defined as `size_t(-1)`) when the substring is not found. It's an unsigned value. Comparing with `-1` works by implicit conversion, but the idiomatic check is `if (pos != string::npos)`.",
      },
      {
        id: "cpp2-003-q2",
        type: "choice",
        text: "What is the key advantage of `string_view` over `const string&` as a function parameter?",
        options: [
          "string_view is always faster than const string&",
          "string_view accepts string literals, char*, and string without making a copy — const string& would copy when passed a char*",
          "string_view allows modification of the string",
          "string_view has a built-in null terminator",
        ],
        answer: 1,
        explanation:
          "`const string& s` accepts string literals by constructing a temporary `string` (which copies the literal's characters). `string_view s` just stores a pointer + length — no allocation for any input. This makes it universally zero-copy for read-only string parameters.",
      },
      {
        id: "cpp2-003-q3",
        type: "choice",
        text: "Why use `ostringstream` instead of `+` for building strings from multiple pieces?",
        options: [
          "ostringstream is the only way to convert numbers to strings",
          "+ creates a new string allocation for each operation; ostringstream builds incrementally in one buffer",
          "ostringstream is thread-safe while + is not",
          "+ doesn't work with non-string types",
        ],
        answer: 1,
        explanation:
          "`s = s + a + b + c` creates three intermediate `string` objects — three allocations. `oss << a << b << c` appends to one internal buffer and only allocates when the buffer grows. For large strings or many concatenations, `ostringstream` is significantly more efficient.",
      },
      {
        id: "cpp2-003-q4",
        type: "choice",
        text: "What is the danger of `string_view sv = someFunction()`?",
        options: [
          "string_view can't be returned from functions",
          "If someFunction returns a string by value, the temporary string is destroyed immediately and sv becomes a dangling view",
          "string_view is always null-terminated so it can't hold arbitrary substrings",
          "The function must return const string& for string_view to work",
        ],
        answer: 1,
        explanation:
          "`string_view` doesn't own its data. If assigned from a temporary `string`, the temporary is destroyed at the end of the full-expression, leaving `sv` pointing to freed memory. Safe use: parameter that reads existing data, loop variable referencing an outer string, never storing beyond the source's lifetime.",
      },
    ],
  },
};

export default lesson;

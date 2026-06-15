const PATH_CODE = `#include <iostream>
#include <filesystem>
using namespace std;
namespace fs = filesystem;

// __OUTPUT__: path: /home/user/data/report.txt\\nfilename: report.txt\\nstem: report\\nextension: .txt\\nparent: /home/user/data\\nconcat: /home/user/data/report.txt.bak\\nappend: /home/user/data/report.txt/v2

int main() {
    fs::path p = "/home/user/data/report.txt";

    // Decompose a path into its parts
    cout << "path: "      << p              << "\\n";
    cout << "filename: "  << p.filename()   << "\\n";
    cout << "stem: "      << p.stem()       << "\\n";
    cout << "extension: " << p.extension()  << "\\n";
    cout << "parent: "    << p.parent_path()<< "\\n";

    // Concatenate: + appends to the string (no separator)
    fs::path backup = p;
    backup += ".bak";
    cout << "concat: " << backup << "\\n";

    // Append: / adds with path separator
    fs::path versioned = p / "v2";
    cout << "append: " << versioned << "\\n";

    return 0;
}`;

const DIR_CODE = `#include <iostream>
#include <filesystem>
#include <fstream>
using namespace std;
namespace fs = filesystem;

// __OUTPUT__: created: work/2024/logs\\nwrote: work/2024/logs/app.log\\nexists: yes  is_dir: yes\\nfile size: 13\\nremoved file: yes\\nremoved dirs: yes

int main() {
    fs::path dir = "work/2024/logs";

    // create_directories: makes all intermediate dirs
    fs::create_directories(dir);
    cout << "created: " << dir << "\\n";

    // Write a file using the path
    fs::path logfile = dir / "app.log";
    { ofstream out(logfile); out << "Hello, world!"; }
    cout << "wrote: " << logfile << "\\n";

    // Query filesystem state
    cout << "exists: "  << (fs::exists(dir) ? "yes" : "no")
         << "  is_dir: " << (fs::is_directory(dir) ? "yes" : "no") << "\\n";
    cout << "file size: " << fs::file_size(logfile) << "\\n";

    // Cleanup
    fs::remove(logfile);
    cout << "removed file: " << (!fs::exists(logfile) ? "yes" : "no") << "\\n";
    fs::remove_all("work");
    cout << "removed dirs: " << (!fs::exists("work") ? "yes" : "no") << "\\n";

    return 0;
}`;

const DIRLIST_CODE = `#include <iostream>
#include <filesystem>
#include <fstream>
#include <vector>
using namespace std;
namespace fs = filesystem;

// __OUTPUT__: files in .: main.cpp  sub/\\nrecursive: a.txt b.txt sub/c.txt\\nfiltered .txt: a.txt b.txt sub/c.txt

int main() {
    // Create test structure
    fs::create_directory("sub");
    for (const char* f : {"a.txt","b.txt"}) { ofstream o(f); o << "x"; }
    { ofstream o("sub/c.txt"); o << "y"; }

    // directory_iterator: one level only
    cout << "files in .: ";
    for (const auto& e : fs::directory_iterator(".")) {
        if (e.is_regular_file()) cout << e.path().filename().string() << "  ";
        else if (e.is_directory()) cout << e.path().filename().string() << "/  ";
    }
    cout << "\\n";

    // recursive_directory_iterator: all subdirectories
    cout << "recursive: ";
    for (const auto& e : fs::recursive_directory_iterator(".")) {
        if (e.is_regular_file())
            cout << e.path().lexically_relative(".").string() << " ";
    }
    cout << "\\n";

    // Filter by extension
    cout << "filtered .txt: ";
    for (const auto& e : fs::recursive_directory_iterator(".")) {
        if (e.path().extension() == ".txt")
            cout << e.path().lexically_relative(".").string() << " ";
    }
    cout << "\\n";

    // Cleanup
    fs::remove_all("sub");
    fs::remove("a.txt"); fs::remove("b.txt");

    return 0;
}`;

const PATH_OPS_CODE = `#include <iostream>
#include <filesystem>
#include <fstream>
using namespace std;
namespace fs = filesystem;

// __OUTPUT__: copied: yes\\nrenamed: yes  old exists: no\\nfile_size: 5\\nequivalent: no\\nrelative: ../b.txt

int main() {
    // Write source files
    { ofstream o("src.txt"); o << "hello"; }
    { ofstream o("other.txt"); o << "world"; }

    // copy_file
    fs::copy_file("src.txt", "dst.txt", fs::copy_options::overwrite_existing);
    cout << "copied: " << (fs::exists("dst.txt") ? "yes" : "no") << "\\n";

    // rename (also works as move)
    fs::rename("dst.txt", "moved.txt");
    cout << "renamed: " << (fs::exists("moved.txt") ? "yes" : "no")
         << "  old exists: " << (fs::exists("dst.txt") ? "yes" : "no") << "\\n";

    cout << "file_size: " << fs::file_size("src.txt") << "\\n";

    // equivalent: same file?
    cout << "equivalent: "
         << (fs::equivalent("src.txt","other.txt") ? "yes" : "no") << "\\n";

    // relative path
    fs::path base = "/home/user/a";
    fs::path target = "/home/user/b.txt";
    cout << "relative: " << fs::relative(target, base) << "\\n";

    // Cleanup
    fs::remove("src.txt"); fs::remove("other.txt"); fs::remove("moved.txt");

    return 0;
}`;

const lesson = {
  id: "cpp-2-005",
  slug: "filesystem",
  chapter: "cpp-2",
  order: 5,
  title: "Filesystem",
  subtitle: "std::filesystem — paths, directories, file queries, copy/move/rename",
  tags: ["c++", "cpp", "filesystem", "path", "directory_iterator", "create_directories", "copy_file", "C++17"],
  aliases: [
    "c++ filesystem",
    "c++ path",
    "c++ directory iteration",
    "c++ create directory",
    "c++ copy file",
    "c++ std::filesystem",
  ],

  hook: `Before C++17, portable filesystem operations required platform-specific APIs or third-party libraries. \`std::filesystem\` brings a unified, portable interface: path manipulation, directory traversal, file queries, copy/move/rename — all with the same code on Windows, macOS, and Linux.`,

  mentalModel: [
    "**`fs::path` is an immutable value representing a filesystem path.** It's not a string — it understands separators, extensions, stems, and parent directories. Use `/` to append components (`p / \"subdir\" / \"file.txt\"`). Use `+` to concatenate without separator (`p += \".bak\"`).",
    "**`directory_iterator` and `recursive_directory_iterator` yield `directory_entry` objects.** Each entry has `.path()`, `.is_regular_file()`, `.is_directory()`, `.file_size()`. `directory_iterator` traverses one level; `recursive_directory_iterator` descends into subdirectories.",
    "**Filesystem operations throw `filesystem_error` on failure.** Use `fs::exists()` before operations to check. Or use the `error_code` overloads: `fs::copy_file(src, dst, ec)` — `ec` is set on failure instead of throwing. Use error_code variants in performance-critical or recoverable error paths.",
  ],

  intuition: {
    prose: [
      "**`fs::path` / operator builds portable paths.** `path(\"a\") / \"b\" / \"c.txt\"` produces `a/b/c.txt` (or `a\\b\\c.txt` on Windows). Never concatenate path strings with `+` or `string` — you'll break on Windows. Always use `/` for directory-level joins.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Path decomposition — run it then explore:**\n\n- Try `p.root_path()` and `p.root_name()` — what do they return on this system?\n- `p.replace_extension(\".csv\")` — what's the new path?\n- Build a path dynamically: `fs::path base = \"/home/user\"; base /= \"projects\"; base /= \"main.cpp\"`.\n- `p.is_absolute()` vs `fs::path(\"relative/path\").is_absolute()` — difference?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PATH_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Directories and file info — run it then explore:**\n\n- `fs::create_directory(\"a/b\")` on non-existent parent — throws? (yes, use create_directories)\n- After `remove_all`, check `fs::exists` — verify the directory is gone.\n- `fs::space(\".\")` — returns available, free, and capacity of the filesystem.\n- `fs::last_write_time(logfile)` — when was the file last modified?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": DIR_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`recursive_directory_iterator` can follow symlinks.** By default it doesn't follow symlinks (to avoid loops). Use `fs::directory_options::follow_directory_symlink` as an option. For cycle detection when you do follow symlinks, track visited inodes.",
      "**`fs::rename` is atomic on most filesystems when source and destination are on the same volume.** It's the portable equivalent of `mv`. Cross-volume rename may copy-then-delete. `fs::copy_file` is always non-atomic. For transactional file operations (write to temp, then rename), rename gives you atomic swap.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Directory listing — run it then explore:**\n\n- Filter only directories: `e.is_directory()` — list only folders.\n- Get file sizes during traversal: `e.file_size()` — total directory size.\n- `directory_entry` caches attributes — calling `e.file_size()` is cheaper than `fs::file_size(e.path())`.\n- Sort the entries alphabetically: collect into vector, then `std::sort`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": DIRLIST_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Copy, rename, relative paths — run it then explore:**\n\n- `copy_file` without `overwrite_existing` — what happens if dst exists? (throws)\n- `fs::rename` across directories — does it move the file? (yes)\n- `fs::equivalent(a, b)` returns true if both point to the same filesystem object (even via different paths/symlinks).\n- `fs::relative(target, base)` — try paths that share no common prefix.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PATH_OPS_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Filesystem operations can throw — always handle errors",
        body: "`fs::remove(path)` throws `filesystem_error` if it fails (e.g., permission denied). Either use try/catch or the `error_code` overload: `fs::remove(path, ec)`. Check `if (ec)` before continuing. Never assume filesystem operations succeed silently.",
      },
      {
        type: "tip",
        title: "Use / for path joining, not string concatenation",
        body: "`path(\"a\") / \"b\"` correctly inserts the platform separator. `\"a\" + \"/\" + \"b\"` breaks on Windows where the separator is `\\`. Always use `fs::path` and `/` for portable code.",
      },
    ],
  },

  examples: [
    {
      title: "Find all files with a given extension recursively",
      body: `#include <filesystem>
#include <vector>
namespace fs = std::filesystem;

std::vector<fs::path> findByExtension(const fs::path& root, std::string_view ext) {
    std::vector<fs::path> result;
    std::error_code ec;
    for (const auto& entry : fs::recursive_directory_iterator(root, ec)) {
        if (ec) break;  // handle permission errors gracefully
        if (entry.is_regular_file() && entry.path().extension() == ext)
            result.push_back(entry.path());
    }
    return result;
}

// auto headers = findByExtension("/home/user/project", ".h");`,
    },
    {
      title: "Atomic file write with rename",
      body: `#include <filesystem>
#include <fstream>
namespace fs = std::filesystem;

// Write to temp file, then atomically replace target
void atomicWrite(const fs::path& target, const std::string& content) {
    fs::path tmp = target;
    tmp += ".tmp";

    {
        std::ofstream out(tmp);
        if (!out) throw std::runtime_error("Cannot write temp file");
        out << content;
    }  // file closed here

    fs::rename(tmp, target);  // atomic on same filesystem
}

// If the process dies during write, target is either old or new — never partial`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a program that creates a directory structure `backup/2024/jan/` using `create_directories`, writes 3 files into it, then uses `recursive_directory_iterator` to print all files with their sizes. Clean up with `remove_all`.",
      hint: "`create_directories(\"backup/2024/jan\")`. Write files with `ofstream`. Use `recursive_directory_iterator` and `entry.file_size()` (faster than `fs::file_size(entry.path())`).",
      walkthrough: [
        "fs::create_directories(\"backup/2024/jan\")",
        "Write 3 files with ofstream into that directory",
        "Loop recursive_directory_iterator, print path + file_size for regular files",
        "fs::remove_all(\"backup\")",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `du` (disk usage) function: given a directory path, recursively sum the sizes of all regular files and return the total in bytes. Handle permission errors gracefully using `error_code` overloads (skip directories you can't read). Test with a directory you create.",
      hint: "`recursive_directory_iterator(path, ec)`. In the loop: `if (ec) { ec.clear(); continue; }`. Use `entry.file_size()` with an `error_code` parameter.",
      walkthrough: [
        "uintmax_t total = 0; error_code ec;",
        "for (auto& e : recursive_directory_iterator(path, ec))",
        "  if (e.is_regular_file()) { auto sz = e.file_size(ec); if (!ec) total += sz; }",
        "return total;",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp2-005-q1",
        type: "choice",
        text: "What is the difference between `fs::path p = \"a\"; p += \"b\"` and `p /= \"b\"`?",
        options: [
          "They produce the same result",
          "+= appends the string directly ('ab'); /= appends with a path separator ('a/b')",
          "/= creates a directory; += just modifies the string",
          "+= is for files; /= is for directories",
        ],
        answer: 1,
        explanation:
          "`+=` concatenates at the string level — no separator is added. `p += \".bak\"` gives `a.bak`. `/=` (and the `/` operator) appends with the platform path separator: `p /= \"b\"` gives `a/b` (or `a\\b` on Windows). Always use `/` for joining path components.",
      },
      {
        id: "cpp2-005-q2",
        type: "choice",
        text: "What does `fs::create_directories(\"a/b/c\")` do if `a/b` doesn't exist?",
        options: [
          "Throws an error because the parent doesn't exist",
          "Creates a, a/b, and a/b/c — all missing intermediate directories",
          "Creates only a/b/c, leaving a and a/b as-is",
          "Returns false without creating anything",
        ],
        answer: 1,
        explanation:
          "`create_directories` (plural) creates all missing intermediate directories in the path — equivalent to `mkdir -p`. `create_directory` (singular) only creates the final component and throws if the parent doesn't exist.",
      },
      {
        id: "cpp2-005-q3",
        type: "choice",
        text: "What is the advantage of `fs::rename` for atomic file replacement?",
        options: [
          "rename is faster than copy+delete",
          "On the same filesystem, rename is atomic — the target either has the old content or the new content, never partial",
          "rename doesn't require filesystem permissions",
          "rename preserves file timestamps",
        ],
        answer: 1,
        explanation:
          "On most filesystems (same volume), `rename` is atomic — it replaces the target in a single system call. If the process crashes mid-write, the target is either the old file or the new file. This is why the pattern 'write to temp, then rename' is used for safe file updates.",
      },
      {
        id: "cpp2-005-q4",
        type: "choice",
        text: "How do you handle permission errors in `recursive_directory_iterator` without throwing?",
        options: [
          "Use try/catch inside the loop",
          "Pass a std::error_code to the iterator constructor; check and clear ec in the loop",
          "Use directory_options::skip_permission_denied flag",
          "Filesystem operations never throw — they always return error codes",
        ],
        answer: 1,
        explanation:
          "Pass `std::error_code ec` to the constructor: `recursive_directory_iterator(path, ec)`. Check `if (ec)` after each increment to detect and handle errors without exceptions. Use `ec.clear()` to reset and continue. Alternatively, C++17 `directory_options::skip_permission_denied` skips inaccessible directories automatically.",
      },
    ],
  },
};

export default lesson;

const CIN_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Enter your age: You are 25 years old.\\nNext year: 26

int main() {
    int age;
    cout << "Enter your age: ";
    cin >> age;

    cout << "You are " << age << " years old." << endl;
    cout << "Next year: " << age + 1 << endl;

    return 0;
}`;

const MULTI_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Enter two numbers: 10 5\\nSum = 15\\nProduct = 50\\nAverage = 7.5

int main() {
    double a, b;
    cout << "Enter two numbers: ";
    cin >> a >> b;   // chain: reads both values

    cout << "Sum = "     << a + b       << endl;
    cout << "Product = " << a * b       << endl;
    cout << "Average = " << (a + b) / 2 << endl;

    return 0;
}`;

const GETLINE_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Enter your full name: Hello, Alice Smith!\\nLength: 11

int main() {
    string fullName;
    cout << "Enter your full name: ";
    getline(cin, fullName);   // reads the entire line — spaces included

    cout << "Hello, " << fullName << "!" << endl;
    cout << "Length: " << fullName.length() << endl;

    return 0;
}`;

const IGNORE_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Age: Name: Alice Smith\\nHello, Alice Smith, age 25!

int main() {
    int age;
    cout << "Age: ";
    cin >> age;

    cin.ignore(1000, '\\n');   // discard the leftover '\\n' before getline

    string name;
    cout << "Name: ";
    getline(cin, name);        // now reads the full line correctly

    cout << "Hello, " << name << ", age " << age << "!" << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-003",
  slug: "input-with-cin",
  chapter: "cpp-0",
  order: 3,
  title: "Reading Input with cin",
  subtitle: "Accept user input at runtime — cin, getline, and the newline trap",
  tags: ["c++", "cpp", "cin", "input", "getline", "stdin", "iostream"],
  aliases: [
    "c++ user input",
    "cin c++",
    "read from keyboard c++",
    "getline c++",
    "c++ interactive program",
  ],

  hook: `Programs that can't read input are just glorified printouts. \`cin\` connects your program to the keyboard. Learn it and your programs stop being hard-coded demos — they become tools that respond to the user.`,

  mentalModel: [
    "**`cin >>` reads one whitespace-delimited token.** When the user types `Alice Smith`, `cin >> name` stores `Alice` and leaves ` Smith` waiting in the buffer. The `>>` operator is type-aware — it converts characters to `int`, `double`, or `string` depending on the variable type.",
    "**`getline` reads the whole line.** `cin >> name` stops at the first space. `getline(cin, name)` reads everything up to the newline, including spaces. Use it for names, sentences, or any multi-word input.",
    "**Watch for the newline trap.** After `cin >> x`, the `\\n` from pressing Enter is still in the buffer. If you then call `getline`, it reads that leftover `\\n` and gives you an empty string. Fix: call `cin.ignore()` between them to discard it.",
  ],

  intuition: {
    prose: [
      "**Start with `cin >>`.** It's the simplest read — one variable, one value. The `>>` operator skips leading whitespace and reads until the next whitespace. The simulator pre-bakes the input in the `// __OUTPUT__:` annotation. On a real machine, the program pauses at `cin >>` and waits for you to type.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it. Then experiment:**\n\n- Change `int age` to `double age`. Enter `25.5` in the annotation — does it work?\n- What happens if the annotation implies non-numeric input (e.g., change the output to pretend the user typed `abc`)? What would happen on a real machine?\n- Add a second variable `string city` and read it: `cin >> city`. Update the output annotation to match.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CIN_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Chained extraction — run it then explore:**\n\n- Swap `double a, b` to `int a, b`. Does integer division trap you? Try `10 5` then `7 2`.\n- Add a third variable `double c` and chain it: `cin >> a >> b >> c`. Update the annotation.\n- Change to read `a`, `b`, and a `char op` (`+`, `-`, `*`, `/`). Print a result based on `op`.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": MULTI_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**`getline` reads the whole line — including spaces.** `cin >> name` would give you `Alice` from `Alice Smith`. `getline` gives you `Alice Smith`. The tradeoff: `getline` always reads a string — you can't use it to directly read an int or double.",
      "**The newline trap.** When you type `25` and press Enter, the buffer contains `2`, `5`, `\\n`. `cin >> age` consumes `25` but leaves `\\n`. The next `getline` reads that `\\n` immediately and returns an empty string. `cin.ignore(1000, '\\n')` discards up to 1000 characters until it hits a newline — clearing the trap.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**getline — run it then explore:**\n\n- Change the simulated name to `Bob Jones Jr.` — update the annotation. Does getline handle the space and the period?\n- Add `cout << fullName[0]` to print the first character. What does it print?\n- Use `fullName.substr(0, 5)` to print the first 5 characters.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": GETLINE_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**The newline trap and the fix — run it then experiment:**\n\n- Remove `cin.ignore(...)` and run again. What does the output show for the name?\n- Change `cin.ignore(1000, '\\n')` to just `cin.ignore()` — does it still work? What's the difference?\n- Add a second `cin >> ` read (e.g., `int score`) after the age, before the getline. Do you need two `cin.ignore()` calls or one?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": IGNORE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "The cin >> / getline mixing trap",
        body: "`cin >> x` leaves a `\\n` in the buffer. The next `getline` reads it and returns empty string. Always call `cin.ignore(1000, '\\n')` after your last `>>` before switching to `getline`.",
      },
      {
        type: "tip",
        title: "Check if input succeeded",
        body: "`if (cin >> x)` is true on success. For a validation loop: `while (!(cin >> value)) { cin.clear(); cin.ignore(1000, '\\n'); cout << \"Invalid, try again: \"; }` — reset the fail state, discard the bad input, prompt again.",
      },
    ],
  },

  examples: [
    {
      title: "Simple calculator with operator input",
      body: `double a, b;
char op;
cin >> a >> op >> b;   // reads: 10 + 5

if      (op == '+') cout << a + b;
else if (op == '-') cout << a - b;
else if (op == '*') cout << a * b;
else if (op == '/') {
    if (b == 0) cout << "Division by zero";
    else        cout << a / b;
}`,
    },
    {
      title: "Full name and age (correct pattern)",
      body: `int age;
cin >> age;
cin.ignore(1000, '\\n');   // clear the leftover newline

string name;
getline(cin, name);        // now reads "Alice Smith" correctly

cout << name << " is " << age << " years old.";`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a temperature converter. Read a Celsius value with `cin >>`, then print Fahrenheit (`F = C * 9.0/5.0 + 32`) and Kelvin (`K = C + 273.15`). Update the `__OUTPUT__` annotation to match your simulated input.",
      hint: "Use `double celsius; cin >> celsius;` then apply the formulas.",
      walkthrough: [
        "double celsius; cout << \"Celsius: \"; cin >> celsius;",
        "double f = celsius * 9.0/5.0 + 32;",
        "double k = celsius + 273.15;",
        "Print both with labels",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Read a person's age (int) and full name (string with possible spaces). Use `cin.ignore()` between them. Print: `Hello, [name]! In 10 years you will be [age+10].` Then add an input validation loop so the program rejects non-positive ages.",
      hint: "Read age with `cin >>`, call `cin.ignore(1000, '\\n')`, then `getline` for the name.",
      walkthrough: [
        "int age; while (!(cin >> age) || age <= 0) { cin.clear(); cin.ignore(1000, '\\n'); }",
        "cin.ignore(1000, '\\n'); — clear the newline",
        "string name; getline(cin, name);",
        "cout << \"Hello, \" << name << \"! In 10 years you will be \" << age + 10 << \".\"",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-003-q1",
        type: "choice",
        text: "What does `cin >> name` store when the user types `Alice Smith`?",
        options: [
          "Alice Smith",
          "Alice",
          "Smith",
          "AliceSmith",
        ],
        answer: 1,
        explanation:
          "`>>` reads one whitespace-delimited token. It stops at the first space, so `name` gets `Alice` and ` Smith\\n` remains in the buffer.",
      },
      {
        id: "cpp0-003-q2",
        type: "choice",
        text: "After `cin >> age;`, why does `getline(cin, name)` often give an empty string?",
        options: [
          "getline doesn't work after >> on the same cin",
          "The '\\n' from pressing Enter is still in the buffer and getline reads it immediately",
          "You need to flush cin first with cin.flush()",
          "getline always returns empty on the first call",
        ],
        answer: 1,
        explanation:
          "`cin >> age` consumes the number but leaves the `\\n` in the buffer. `getline` reads until a newline and finds it immediately, returning empty string. Fix: `cin.ignore()` between them.",
      },
      {
        id: "cpp0-003-q3",
        type: "choice",
        text: "Which statement reads an entire line including spaces into a string?",
        options: [
          "cin >> line;",
          "getline(cin, line);",
          "cin.read(line);",
          "scanf(\"%s\", line);",
        ],
        answer: 1,
        explanation:
          "`getline(cin, line)` reads all characters up to (but not including) the newline, including spaces. `cin >> line` stops at the first whitespace.",
      },
      {
        id: "cpp0-003-q4",
        type: "choice",
        text: "What does `cin.ignore(1000, '\\n')` do?",
        options: [
          "Clears the cin fail state",
          "Discards up to 1000 characters from the buffer until a newline is found",
          "Reads and ignores the next 1000 integers",
          "Disables echo so typed characters aren't shown",
        ],
        answer: 1,
        explanation:
          "`cin.ignore(n, delim)` discards up to `n` characters, stopping when it discards the delimiter. `cin.ignore(1000, '\\n')` is the standard way to consume the leftover newline (and any other junk) before calling `getline`.",
      },
    ],
  },
};

export default lesson;

const CIN_CODE = `#include <iostream>
#include <string>
using namespace std;

// Simulated run: user enters  25  and  "Alice"
// __OUTPUT__: Enter your age: Enter your name: Hello, Alice! You are 25 years old.\\nNext year you will be 26.

int main() {
    // Read an integer
    int age;
    cout << "Enter your age: ";
    cin >> age;             // reads one whitespace-delimited token as int

    // Read a string (single word — stops at whitespace)
    string name;
    cout << "Enter your name: ";
    cin >> name;            // reads "Alice" (stops at space)

    cout << "Hello, " << name << "! "
         << "You are " << age << " years old." << endl;
    cout << "Next year you will be " << (age + 1) << "." << endl;

    return 0;
}`;

const GETLINE_CODE = `#include <iostream>
#include <string>
using namespace std;

// Simulated run: user enters "Alice Smith"
// __OUTPUT__: Enter your full name: Hello, Alice Smith!\\nCharacters: 11

int main() {
    string fullName;
    cout << "Enter your full name: ";
    getline(cin, fullName);   // reads the entire line including spaces

    cout << "Hello, " << fullName << "!" << endl;
    cout << "Characters: " << fullName.length() << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-0-003",
  slug: "input-with-cin",
  chapter: "cpp-0",
  order: 3,
  title: "Reading Input with cin",
  subtitle: "Accept user input at runtime using cin, >>, and getline",
  tags: ["c++", "cpp", "cin", "input", "getline", "stdin", "iostream"],
  aliases: [
    "c++ user input",
    "cin c++",
    "read from keyboard c++",
    "getline c++",
    "c++ interactive program",
  ],

  hook: `Programs that can't read input are just glorified printouts. \`cin\` connects your program to the keyboard (standard input). Mastering \`cin\` is the bridge from hard-coded demos to real interactive programs — calculators, games, tools that respond to the user.`,

  mentalModel: [
    "`cin` is the standard input stream, connected to the keyboard. The `>>` operator extracts one whitespace-delimited **token** from the stream and converts it to the type on the right. `cin >> age` reads characters until whitespace, interprets them as an integer, and stores the result in `age`.",
    "**`cin >>` stops at whitespace. `getline` reads the whole line.** `cin >> name` gives you `Alice` but throws away ` Smith`. `getline(cin, name)` reads everything up to (but not including) the newline — including spaces. Use `getline` for full names, sentences, filenames.",
    "**The stream is a buffer.** Typed characters sit in a buffer until `Enter` is pressed. `cin >>` then pulls them out one token at a time. If you mix `cin >>` and `getline`, the newline `\\n` left in the buffer by `>>` will be consumed by the next `getline`, giving you an empty string. Fix: call `cin.ignore()` between them.",
  ],

  intuition: {
    prose: [
      "When you run a program and type `42` and press Enter, the characters `'4'`, `'2'`, `'\\n'` enter the standard input buffer. `cin >> x` reads past leading whitespace, grabs `42`, converts it to an `int`, stores it in `x`, and leaves the `\\n` in the buffer. The next `cin >>` call will skip that `\\n` (it's whitespace), which is why chaining multiple `>>` operations works naturally.",
      "**Type mismatches put `cin` in a fail state.** If `cin >> age` encounters `abc` instead of a number, the extraction fails: `age` is left unchanged, the characters stay in the buffer, and `cin` enters a fail state where all subsequent reads do nothing. You can check `if (cin.fail())` and recover with `cin.clear(); cin.ignore();`. For now, trust that input is valid and add validation once you know the language better.",
      "The `cin >> name` pattern reads a *word* — it stops at any whitespace (space, tab, newline). For a full name like `Alice Smith`, use `getline(cin, name)` which reads until the newline. But watch out: if you read an integer with `cin >> x` and then call `getline`, the `\\n` that ended the integer input is still in the buffer and `getline` will read an empty string. Insert `cin.ignore(1000, '\\n');` or `cin.ignore();` to discard that leftover newline.",
      "In the lab, the `// __OUTPUT__:` comment simulates the program's output for a specific pre-defined input. The simulator doesn't support interactive stdin, so the input is baked into the annotation. On a real machine, compile with `g++` and type your own input — the program will wait at `cin >>` for you to type something and press Enter.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**The code simulates age=25, name=\"Alice\". Experiment:**\n\n1. Compile and run: `g++ main.cpp -o greet && ./greet`\n2. Change the `__OUTPUT__` annotation to simulate different input (e.g., age=30, name=Bob)\n3. Switch to the getline version: copy `getline.cpp` code into the editor\n4. Practice the `cin.ignore()` pattern by reading an int THEN a full name\n5. Try `cin >> x >> y` — chained extraction reads two values",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": CIN_CODE,
            "/home/user/getline.cpp": GETLINE_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**The extraction operator `>>` does type-aware parsing.** For `cin >> age` where `age` is `int`, the stream reads characters and interprets them as a base-10 integer. For `cin >> x` where `x` is `double`, it accepts `3.14` or `3e-2`. For `cin >> c` where `c` is `char`, it skips whitespace and reads the next single character. This is not string-splitting — it's type-dispatched parsing.",
      "**Input validation is your responsibility.** `cin` by default trusts the user. In production code, you check: did the read succeed (`if (!cin)`)? Is the value in a valid range? `cin` entering a fail state silently is a common source of bugs. A robust input loop: `while (!(cin >> value)) { cin.clear(); cin.ignore(1000, '\\n'); cout << \"Try again: \"; }`. C++ gives you the tools — you wire them together.",
      "**`cout` buffering and `endl` vs `'\\n'`.** `cout` buffers output for efficiency. `endl` flushes the buffer (forces immediate write to the terminal) in addition to inserting a newline. `'\\n'` just inserts a newline without flushing. Use `endl` before a `cin >>` if you want the prompt to appear before the user types. Use `'\\n'` in tight loops where performance matters — `endl` is noticeably slower when called millions of times.",
    ],
    callouts: [
      {
        type: "warning",
        title: "The cin >> / getline mixing trap",
        body: "If you do `cin >> x` then immediately `getline(cin, line)`, the `getline` reads an empty string because the `\\n` from the previous Enter is still in the buffer. Fix: `cin.ignore(numeric_limits<streamsize>::max(), '\\n');` after the last `>>` before calling `getline`.",
      },
      {
        type: "info",
        title: "Reading multiple values on one line",
        body: "`cin >> a >> b >> c;` chains three extractions. The user can enter them on the same line separated by spaces, or on separate lines — `>>` skips all whitespace. This makes parsing structured input (like coordinates `3 4`) very clean.",
      },
      {
        type: "tip",
        title: "Check if input succeeded",
        body: '`if (cin >> x)` evaluates to true if extraction succeeded, false if it failed (wrong type or EOF). This lets you write validation loops: `while (!(cin >> age)) { cin.clear(); cin.ignore(1000, \'\\n\'); cout << "Invalid, enter a number: "; }`',
      },
    ],
  },

  examples: [
    {
      title: "Reading multiple values and doing arithmetic",
      body: `#include <iostream>
using namespace std;

// __OUTPUT__: Enter two numbers: Sum = 15\\nProduct = 50\\nAverage = 7.5

int main() {
    double a, b;
    cout << "Enter two numbers: ";
    cin >> a >> b;          // reads both on same line or separate lines

    cout << "Sum = "     << a + b       << endl;
    cout << "Product = " << a * b       << endl;
    cout << "Average = " << (a + b) / 2 << endl;
    return 0;
}`,
    },
    {
      title: "Mixed cin >> and getline (correct pattern)",
      body: `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Enter age: Enter full name: Name: Alice Smith, Age: 25

int main() {
    int age;
    cout << "Enter age: ";
    cin >> age;

    cin.ignore(1000, '\\n');   // discard leftover newline from cin >> age

    string fullName;
    cout << "Enter full name: ";
    getline(cin, fullName);    // now reads full line correctly

    cout << "Name: " << fullName << ", Age: " << age << endl;
    return 0;
}`,
    },
    {
      title: "Input validation loop",
      body: `#include <iostream>
using namespace std;

// __OUTPUT__: Enter a positive number: Got: 42

int main() {
    double value;
    cout << "Enter a positive number: ";

    // Keep asking until we get a valid positive number
    while (!(cin >> value) || value <= 0) {
        cin.clear();               // reset fail state
        cin.ignore(1000, '\\n');   // discard bad input
        cout << "Invalid. Try again: ";
    }

    cout << "Got: " << value << endl;
    return 0;
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a temperature converter. Read a temperature in Celsius from the user, then print the equivalent in Fahrenheit (`F = C * 9.0/5.0 + 32`) and Kelvin (`K = C + 273.15`). Update the `__OUTPUT__` annotation to match your simulated input.",
      hint: "Use `double celsius; cin >> celsius;` then apply the formulas.",
      walkthrough: [
        "Read celsius as a double",
        "Calculate fahrenheit = celsius * 9.0/5.0 + 32.0",
        "Calculate kelvin = celsius + 273.15",
        "Print all three with labels",
        "Update __OUTPUT__ to reflect your simulated temperature",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write a simple calculator. Read two doubles and an operator character (`+`, `-`, `*`, `/`). Print the result. Handle division by zero by printing an error message instead of dividing. Hint: you'll need an if-else chain for the operator.",
      hint: "Use `char op; cin >> op;` then if/else or switch on op.",
      walkthrough: [
        "Read: `double a, b; char op; cin >> a >> op >> b;`",
        "Use switch(op) with cases for '+', '-', '*', '/'",
        "For '/': first check `if (b == 0)` and print error, else print result",
        "Add a default case for unknown operators",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp0-003-q1",
        type: "choice",
        text: "What does `cin >> name` do when the user types `Alice Smith`?",
        options: [
          "Stores `Alice Smith` in name",
          "Stores `Alice` in name and leaves ` Smith` in the buffer",
          "Causes a compile error because strings have spaces",
          "Stores `Smith` in name and discards `Alice`",
        ],
        answer: 1,
        explanation:
          "`>>` extracts one whitespace-delimited token. It stops at the first space, so `name` gets `Alice` and ` Smith\\n` remains in the buffer for the next read.",
      },
      {
        id: "cpp0-003-q2",
        type: "choice",
        text: "After `cin >> age;`, why might `getline(cin, name)` give an empty string?",
        options: [
          "getline doesn't work after >> on the same cin",
          "The newline '\\n' from pressing Enter is still in the buffer and getline reads it immediately",
          "You need to flush cin first with cin.flush()",
          "getline always gives an empty string on the first call",
        ],
        answer: 1,
        explanation:
          "`cin >> age` consumes the number but leaves the `\\n` newline in the buffer. `getline` reads until a newline and finds it immediately, returning an empty string. Fix: `cin.ignore()` between them.",
      },
      {
        id: "cpp0-003-q3",
        type: "choice",
        text: "Why use `endl` instead of `'\\n'` before a `cin >>` prompt?",
        options: [
          "endl makes the prompt appear in a different color",
          "endl flushes the output buffer, ensuring the prompt appears before the user types",
          "endl is required before every cin call",
          "endl creates a blank line while '\\n' doesn't",
        ],
        answer: 1,
        explanation:
          "`cout` buffers output. Without flushing, the prompt text might stay in the buffer while the program waits for input. `endl` flushes the buffer so the user sees the prompt. `'\\n'` only inserts a newline without flushing.",
      },
      {
        id: "cpp0-003-q4",
        type: "choice",
        text: "What happens when `cin >> x` fails (e.g., user types `abc` for an `int x`)?",
        options: [
          "x is set to 0 automatically",
          "The program crashes with a runtime error",
          "cin enters a fail state, x is unchanged, and subsequent reads do nothing until cin is cleared",
          "The program prompts the user again automatically",
        ],
        answer: 2,
        explanation:
          "Failed extraction leaves cin in a fail state. All subsequent `>>` operations become no-ops. You must call `cin.clear()` to reset the fail flag and `cin.ignore()` to discard the bad input before trying again.",
      },
    ],
  },
};

export default lesson;

const STRUCT_CODE = `#include <iostream>
#include <cmath>
using namespace std;

// __OUTPUT__: A=(1, 2)  B=(4, 6)\\ndistance: 5

struct Point {
    double x, y;

    double distanceTo(const Point& other) const {
        double dx = x - other.x, dy = y - other.y;
        return sqrt(dx*dx + dy*dy);
    }

    void print() const { cout << "(" << x << ", " << y << ")"; }
};

int main() {
    Point A{1, 2}, B{4, 6};
    cout << "A="; A.print();
    cout << "  B="; B.print(); cout << endl;
    cout << "distance: " << A.distanceTo(B) << endl;
    return 0;
}`;

const CLASS_CODE = `#include <iostream>
#include <cmath>
using namespace std;

// __OUTPUT__: area=78.5398\\ncontains (3,4)? 1\\ncontains (6,0)? 0

class Circle {
private:
    double cx, cy, radius;   // private: only accessible inside the class

public:
    // Constructor: initializer list initializes before the body runs
    Circle(double x, double y, double r) : cx(x), cy(y), radius(r) {}

    double area() const { return 3.14159265 * radius * radius; }

    bool contains(double px, double py) const {
        double dx = px - cx, dy = py - cy;
        return sqrt(dx*dx + dy*dy) <= radius;
    }
};

int main() {
    Circle c(0, 0, 5);
    cout << "area=" << c.area() << endl;
    cout << "contains (3,4)? " << c.contains(3, 4) << endl;
    cout << "contains (6,0)? " << c.contains(6, 0) << endl;
    return 0;
}`;

const CONST_CODE = `#include <iostream>
using namespace std;

// __OUTPUT__: Counter: 0\\nafter increment: 1\\nvalue (const ref): 1

class Counter {
    int value;
public:
    Counter() : value(0) {}   // initializer list

    void increment() { value++; }         // non-const: modifies state
    int  get() const { return value; }    // const: safe on const objects
    void reset()     { value = 0; }
};

void printCounter(const Counter& c) {
    // c.increment();  // ERROR: can't call non-const on const ref
    cout << "value (const ref): " << c.get() << endl;
}

int main() {
    Counter c;
    cout << "Counter: " << c.get() << endl;
    c.increment();
    cout << "after increment: " << c.get() << endl;
    printCounter(c);
    return 0;
}`;

const ENCAP_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Alice: $100\\ndeposit $50: ok\\nwithdraw $200: denied\\nAlice: $150

class BankAccount {
    string owner;
    double balance;
public:
    BankAccount(string name, double initial)
        : owner(name), balance(initial > 0 ? initial : 0) {}

    bool deposit(double amount) {
        if (amount <= 0) return false;
        balance += amount; return true;
    }

    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount; return true;
    }

    void print() const {
        cout << owner << ": $" << balance << endl;
    }
};

int main() {
    BankAccount acc("Alice", 100);
    acc.print();
    cout << "deposit $50: " << (acc.deposit(50) ? "ok" : "denied") << endl;
    cout << "withdraw $200: " << (acc.withdraw(200) ? "ok" : "denied") << endl;
    acc.print();
    return 0;
}`;

const lesson = {
  id: "cpp-1-001",
  slug: "structs-and-classes",
  chapter: "cpp-1",
  order: 1,
  title: "Structs and Classes",
  subtitle: "Bundle data and behavior into user-defined types — the foundation of OOP",
  tags: ["c++", "cpp", "struct", "class", "oop", "encapsulation", "methods", "access-control"],
  aliases: [
    "c++ struct",
    "c++ class",
    "c++ object-oriented programming",
    "c++ member functions",
    "c++ encapsulation",
  ],

  hook: `Procedural programming (functions acting on separate data) breaks down as programs grow. Classes bundle related data and the functions that operate on it — and control who can access what. They're how C++ enforces invariants, organizes large codebases, and enables reuse.`,

  mentalModel: [
    "**A class is a user-defined type.** Just as `int` bundles 32 bits and operations `+`, `-`, `*`, `/`, a class bundles data (members) and operations (methods). `Circle c(0,0,5)` creates an instance. The type system ensures you can only call valid operations on a circle.",
    "**`struct` vs `class` — only the default access differs.** `struct` members are `public` by default; `class` members are `private`. Use `struct` for plain data bundles (no invariants), `class` for types with encapsulation. This is convention — the language doesn't enforce it.",
    "**`const` methods promise not to modify the object.** Mark every method that doesn't change state as `const`. This lets them be called on `const` objects and `const` references — critical for passing objects to read-only functions.",
  ],

  intuition: {
    prose: [
      "**Struct: group related data.** A `Point` with `x` and `y` is more expressive than two separate `double` variables. Adding a `distanceTo` method keeps the logic next to the data it operates on.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Run it — then build on Point:**\n\n- Add a `midpoint(const Point& other) const` method that returns the midpoint.\n- Add a `bool operator==(const Point& other) const` to compare two points.\n- Create a `vector<Point>` and sort by distance from the origin: `sqrt(x*x + y*y)`.\n- What happens if you try `Point p; p.x = 3;` — is that valid for a struct?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": STRUCT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Class with private members — run it then explore:**\n\n- Try `c.radius = 10;` — compile error (private). Why is this good?\n- Add a `setRadius(double r)` method that validates `r > 0` before setting.\n- Add `double perimeter() const { return 2 * 3.14159 * radius; }`.\n- Add a `static Circle unit()` factory method that returns a circle at (0,0) radius 1.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CLASS_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**const methods and the `this` pointer.** Inside every method, `this` is a pointer to the current object. In a `const` method, `this` is `const Circle*` — assignments to members become compile errors. The compiler enforces the `const` promise at compile time, not runtime. Any function taking a `const Circle&` can only call `const` methods on it.",
      "**Encapsulation enforces invariants.** `BankAccount` keeps `balance` private — external code can never set it to -$1000. Every modification goes through `deposit` or `withdraw`, which enforce the rules. This is the core benefit: the class owns its data and controls the rules. Public members bypass all of this.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**const methods — run it then explore:**\n\n- Try calling `c.increment()` from inside `printCounter` — what error do you get?\n- Add `void resetToValue(int v) const { value = v; }` — compile error because the method is const but modifies state.\n- Declare `const Counter cc; cc.get();` — works. `cc.increment();` — error.\n- Add `mutable int callCount;` to Counter and increment it inside `get()` — mutable bypasses const.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CONST_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Encapsulation with invariants — run it then explore:**\n\n- Try `acc.balance = 1000000;` — compile error (private). This is the point.\n- Add a `transfer(BankAccount& other, double amount)` method — withdraw from this, deposit to other.\n- Change the constructor to reject negative initial balances by setting them to 0. Does the current code do that?\n- Add a `string getOwner() const` getter — why make this const?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ENCAP_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "info",
        title: "struct vs class — only default access differs",
        body: "`struct S { int x; };` and `class C { public: int x; };` are identical in C++. The sole difference: `struct` defaults to `public`, `class` to `private`. Convention: `struct` for data aggregates, `class` for encapsulated types.",
      },
      {
        type: "tip",
        title: "Use member initializer lists",
        body: "`:  m_x(x), m_y(y)` in the constructor initializes members directly. The body `{ m_x = x; }` constructs-then-assigns — one extra operation. `const` members and references must use initializer lists — they can't be assigned in the body.",
      },
    ],
  },

  examples: [
    {
      title: "Rectangle class with area and comparison",
      body: `class Rectangle {
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}

    double area()      const { return width * height; }
    double perimeter() const { return 2 * (width + height); }
    bool   isSquare()  const { return width == height; }

    bool operator<(const Rectangle& other) const {
        return area() < other.area();
    }
};

Rectangle r1(3, 4), r2(5, 5);
cout << r1.area()    << endl;   // 12
cout << r2.isSquare() << endl;  // 1
cout << (r1 < r2)    << endl;   // 1`,
    },
    {
      title: "Static members: shared counter",
      body: `class Widget {
    static int instanceCount;  // shared by all instances
    int id;
public:
    Widget() : id(++instanceCount) {}
    ~Widget() { --instanceCount; }

    static int count() { return instanceCount; }
    int getId() const { return id; }
};

int Widget::instanceCount = 0;   // definition outside class

{ Widget a, b, c; cout << Widget::count(); }  // 3
cout << Widget::count();  // 0 — destructors ran`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write a `Temperature` class that stores a value in Celsius. Add: `double toCelsius() const`, `double toFahrenheit() const` (F = C * 9/5 + 32), `double toKelvin() const` (K = C + 273.15). Add a constructor and a `void print() const` method that shows all three. Make sure the internal value can't be set negative (below absolute zero: -273.15 C).",
      hint: "Private member `double celsius`. In constructor: `if (c < -273.15) celsius = -273.15; else celsius = c;`",
      walkthrough: [
        "class Temperature { double celsius; public: ... }",
        "Constructor validates: celsius = max(c, -273.15)",
        "toCelsius returns celsius; toFahrenheit returns celsius * 9.0/5.0 + 32; toKelvin returns celsius + 273.15",
        "print() calls all three",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a `Stack<int>` class using a `vector<int>` as the underlying storage. Implement: `void push(int)`, `int pop()` (error-handle empty), `int top() const` (peek without removing), `bool empty() const`, `int size() const`. Test with a sequence of pushes and pops.",
      hint: "Private `vector<int> data;`. push = push_back, pop = back + pop_back, top = back. Guard `pop` and `top` with empty checks.",
      walkthrough: [
        "private: vector<int> data;",
        "push: data.push_back(val)",
        "pop: if empty throw or return; val = data.back(); data.pop_back(); return val",
        "top: if empty throw or return; return data.back()",
        "empty: return data.empty(); size: return data.size()",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-001-q1",
        type: "choice",
        text: "What is the only difference between `struct` and `class` in C++?",
        options: [
          "struct can't have methods; class can",
          "struct defaults to public access; class defaults to private",
          "struct is on the stack; class is on the heap",
          "struct can't inherit; class can",
        ],
        answer: 1,
        explanation:
          "In C++, the only technical difference is default access: `struct` members are `public` by default, `class` members are `private`. Both can have methods, inheritance, and constructors.",
      },
      {
        id: "cpp1-001-q2",
        type: "choice",
        text: "Why mark a method `const` (e.g., `double area() const`)?",
        options: [
          "To make it faster",
          "So it can be called on const objects/references and signals it doesn't modify state",
          "To prevent it from being overridden",
          "To allow it to access private members",
        ],
        answer: 1,
        explanation:
          "`const` methods can be called on `const` objects and `const` references. Without `const`, you can't call the method through a const reference — even if it doesn't actually modify anything. It also signals intent to readers.",
      },
      {
        id: "cpp1-001-q3",
        type: "choice",
        text: "What advantage does making `balance` private in BankAccount give?",
        options: [
          "It makes the balance inaccessible from everywhere",
          "External code must go through deposit/withdraw, which enforce validation rules",
          "It prevents the balance from being read",
          "It makes the class faster",
        ],
        answer: 1,
        explanation:
          "Private members can only be modified by the class's own methods. This forces all modifications through `deposit` and `withdraw`, which enforce the 'balance can't go negative' invariant. Public access would let any code bypass these rules.",
      },
      {
        id: "cpp1-001-q4",
        type: "choice",
        text: "What does the member initializer list `Counter() : value(0) {}` do differently from `Counter() { value = 0; }`?",
        options: [
          "No functional difference for int members",
          "Initializer list constructs directly; body-assignment constructs then assigns — matters for complex types",
          "Initializer list is slower",
          "Body-assignment works for const members; initializer list doesn't",
        ],
        answer: 1,
        explanation:
          "For `int`, both are functionally identical. For complex types, the initializer list constructs the member directly from arguments (one step), while the body first default-constructs then assigns (two steps). `const` members and references MUST use the initializer list — they cannot be assigned in the body.",
      },
    ],
  },
};

export default lesson;

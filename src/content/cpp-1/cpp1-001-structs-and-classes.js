const STRUCT_CODE = `#include <iostream>
#include <string>
#include <cmath>
using namespace std;

// ── Struct: public by default ────────────────────────────────
struct Point {
    double x, y;

    double distanceTo(const Point& other) const {
        double dx = x - other.x;
        double dy = y - other.y;
        return sqrt(dx*dx + dy*dy);
    }

    void print() const {
        cout << "(" << x << ", " << y << ")";
    }
};

// ── Class: private by default ─────────────────────────────────
class Circle {
private:
    Point center;
    double radius;

public:
    // Constructor
    Circle(double cx, double cy, double r)
        : center{cx, cy}, radius{r} {}

    // Getters (const — don't modify the object)
    double getRadius() const { return radius; }
    Point  getCenter() const { return center; }
    double area()      const { return 3.14159265 * radius * radius; }
    double perimeter() const { return 2 * 3.14159265 * radius; }

    // Setter with validation
    void setRadius(double r) {
        if (r > 0) radius = r;
        else cout << "Error: radius must be positive" << endl;
    }

    bool contains(const Point& p) const {
        return center.distanceTo(p) <= radius;
    }

    void print() const {
        cout << "Circle at ";
        center.print();
        cout << " with radius " << radius << endl;
    }
};

// __OUTPUT__: --- Struct: Point ---\\nA = (1, 2)  B = (4, 6)\\nDistance A→B: 5\\n--- Class: Circle ---\\nCircle at (0, 0) with radius 5\\nArea: 78.5398  Perimeter: 31.4159\\nPoint (3, 4): inside? 1\\nPoint (6, 0): inside? 0\\nAfter setRadius(-1): Error: radius must be positive\\nAfter setRadius(10): radius = 10

int main() {
    // ── struct usage ───────────────────────────────────────────
    cout << "--- Struct: Point ---" << endl;
    Point A{1, 2};
    Point B{4, 6};
    cout << "A = "; A.print();
    cout << "  B = "; B.print(); cout << endl;
    cout << "Distance A→B: " << A.distanceTo(B) << endl;

    // ── class usage ────────────────────────────────────────────
    cout << "--- Class: Circle ---" << endl;
    Circle c(0, 0, 5);
    c.print();
    cout << "Area: " << c.area()
         << "  Perimeter: " << c.perimeter() << endl;

    Point p1{3, 4}, p2{6, 0};
    cout << "Point (3, 4): inside? " << c.contains(p1) << endl;
    cout << "Point (6, 0): inside? " << c.contains(p2) << endl;

    c.setRadius(-1);   // triggers validation
    c.setRadius(10);
    cout << "After setRadius(10): radius = " << c.getRadius() << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-1-001",
  slug: "structs-and-classes",
  chapter: "cpp-1",
  order: 1,
  title: "Structs and Classes",
  subtitle: "Bundle data and behavior together with structs and classes — the foundation of OOP",
  tags: ["c++", "cpp", "struct", "class", "oop", "encapsulation", "methods", "access-control"],
  aliases: [
    "c++ struct",
    "c++ class",
    "c++ object-oriented programming",
    "c++ member functions",
    "c++ encapsulation",
  ],

  hook: `Procedural programming (functions + data separately) works for small programs but doesn't scale. Object-oriented programming bundles related data and the functions that operate on it into a single unit — a class. This makes code more organized, safer (controlled access), and reusable. Every major C++ codebase uses classes. Understanding them deeply is the first step to being a professional C++ developer.`,

  mentalModel: [
    "**A struct/class is a user-defined type.** Just as `int` bundles a 32-bit integer and the operations `+`, `-`, `*`, `/`, a class bundles related data (members) and operations (methods). `Circle c(0,0,5)` creates an instance of the `Circle` type. The instance holds the data; the methods operate on it. The type system then guarantees you can only call valid operations on a circle.",
    "**The only difference between `struct` and `class` in C++ is default access.** `struct` members are `public` by default; `class` members are `private`. Conventionally: use `struct` for plain data aggregates (no invariants to maintain), `class` for types with behavior and encapsulation. The language doesn't enforce this — it's convention.",
    "**`const` member functions** promise not to modify the object. `double area() const` — the `const` at the end means `this` pointer is `const Circle*`. You can call `const` methods on `const` objects. Non-const methods cannot be called on const objects. Mark every method that doesn't modify state as `const` — it improves correctness, enables const objects, and signals intent.",
  ],

  intuition: {
    prose: [
      "**Encapsulation: hide implementation, expose interface.** By making `Circle`'s `radius` private, external code can't set it to -5 or NaN. Only the `setRadius` method can modify it — and it validates the input. This is the core benefit of encapsulation: the class maintains its *invariants* (rules that keep the data valid) regardless of how it's used. If `radius` were public, any caller could break the invariant by writing `c.radius = -3`.",
      "**The `this` pointer.** Inside every non-static method, `this` is a pointer to the current object. `this->radius` and just `radius` are equivalent inside a method. The implicit `this` parameter is why `area()` knows which circle's radius to use. In const methods, `this` is `const Circle*`, which is why you can't assign to members in const methods.",
      "**Member initializer lists** `Circle(double cx, double cy, double r) : center{cx, cy}, radius{r} {}` — the `: members` syntax initializes members before the constructor body runs. This is more efficient than assignment inside the body (which would default-construct the member first, then assign). For `const` members and references, initializer lists are required — they cannot be assigned in the body.",
      "**Getters and setters aren't always necessary.** If a class has no invariants to maintain (it's just a data bundle), use a `struct` with public members. Only add getters/setters when you need validation, caching, or to decouple the interface from the implementation. Over-engineering with trivial `getX()`/`setX()` for every field adds noise without value.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Build on the class system:**\n\n1. Compile and run — trace struct vs class behavior\n2. Add a `Rectangle` class with `width`, `height`, `area()`, `perimeter()`, `isSquare()`\n3. Add a `static` method to `Circle`: `static Circle unit()` returning a circle at (0,0) with radius 1\n4. Try accessing `c.radius` directly — compiler error (private)\n5. Add `bool operator==(const Circle& other) const` to compare circles\n6. Create a `vector<Circle>` and add multiple circles — class instances work naturally in STL containers",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": STRUCT_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Access specifiers: `public`, `private`, `protected`.** `public` members are accessible from anywhere. `private` members are only accessible within the class itself (and `friend` declarations). `protected` members are accessible in the class and its derived classes (relevant for inheritance). Access specifiers protect invariants by restricting what external code can touch. The default for `class` is `private`; for `struct` it's `public`.",
      "**`static` members belong to the class, not instances.** `static int count = 0` inside a class is shared by all instances — one copy exists regardless of how many objects are created. `static` methods can be called without an instance: `Circle::unit()`. They cannot access non-static members (no `this`). Use statics for factory methods, shared counters, or class-level constants.",
      "**Operator overloading** lets you define what `+`, `==`, `<<`, etc. mean for your types. `bool operator==(const Circle& other) const { return center.x == other.center.x && ... }`. The stream operator `friend ostream& operator<<(ostream& os, const Circle& c)` enables `cout << c`. Overload operators when the meaning is natural and unsurprising — don't make `+` do something that doesn't feel like addition.",
    ],
    callouts: [
      {
        type: "info",
        title: "struct vs class — only access default differs",
        body: "In C++, `struct S { int x; };` and `class C { public: int x; };` are identical. The sole difference is `struct` defaults to `public`, `class` defaults to `private`. Convention: use `struct` for data aggregates (no invariants), `class` for types with encapsulated state and methods.",
      },
      {
        type: "warning",
        title: "const correctness: mark methods const",
        body: "If a method doesn't modify the object, mark it `const`. This allows the method to be called on const objects and const references. Without `const`, `void print(const Circle& c) { c.area(); }` fails to compile if `area()` is not const. Rule: every method that doesn't modify state should be `const`.",
      },
      {
        type: "tip",
        title: "Use member initializer lists",
        body: "In constructors, initialize members in the initializer list rather than the body: `: m_x(x), m_y(y)` instead of `{ m_x = x; m_y = y; }`. The list initializes; the body assigns. For non-trivial types, the list avoids double-construction. `const` members and references MUST be in the initializer list — they can't be assigned.",
      },
    ],
  },

  examples: [
    {
      title: "BankAccount class with invariant enforcement",
      body: `class BankAccount {
private:
    string owner;
    double balance;

public:
    BankAccount(string name, double initial)
        : owner(name), balance(initial > 0 ? initial : 0) {}

    bool deposit(double amount) {
        if (amount <= 0) return false;
        balance += amount;
        return true;
    }

    bool withdraw(double amount) {
        if (amount <= 0 || amount > balance) return false;
        balance -= amount;
        return true;
    }

    double getBalance() const { return balance; }
    string getOwner()   const { return owner;   }

    void print() const {
        cout << owner << ": $" << balance << endl;
    }
};`,
    },
    {
      title: "Struct for plain data, class for behavior",
      body: `// Struct: just data, no invariants
struct RGB {
    int r, g, b;
};

// Class: behavior + invariants
class Color {
    RGB components;
public:
    Color(int r, int g, int b)
        : components{clamp(r), clamp(g), clamp(b)} {}

    RGB get() const { return components; }

    Color mix(const Color& other) const {
        return Color(
            (components.r + other.components.r) / 2,
            (components.g + other.components.g) / 2,
            (components.b + other.components.b) / 2
        );
    }

private:
    static int clamp(int v) { return max(0, min(255, v)); }
};`,
    },
    {
      title: "Static members and factory methods",
      body: `class Temperature {
private:
    double celsius;
    static int instanceCount;   // class-level counter

public:
    Temperature(double c) : celsius(c) { instanceCount++; }
    ~Temperature() { instanceCount--; }

    // Factory methods (static constructors)
    static Temperature fromFahrenheit(double f) {
        return Temperature((f - 32) * 5.0 / 9.0);
    }
    static Temperature fromKelvin(double k) {
        return Temperature(k - 273.15);
    }

    double toCelsius()    const { return celsius; }
    double toFahrenheit() const { return celsius * 9.0/5.0 + 32; }

    static int count() { return instanceCount; }
};
int Temperature::instanceCount = 0;   // define outside class`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Design a `Vector2D` class representing a 2D mathematical vector (not `std::vector`). Include: `double x, y` (private), constructor, `length()`, `normalize()` (returns a unit vector), `dot(const Vector2D&)`, and `operator+`. Test all operations in main.",
      hint: "Length = sqrt(x*x + y*y). Normalize: return Vector2D(x/length(), y/length()). Dot: return x*other.x + y*other.y.",
      walkthrough: [
        "Private members: double x, y. Constructor: Vector2D(double x, double y) : x(x), y(y) {}",
        "length(): return sqrt(x*x + y*y)",
        "normalize(): double l = length(); return Vector2D(x/l, y/l)",
        "dot(): return x*o.x + y*o.y",
        "operator+: return Vector2D(x+o.x, y+o.y)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a `Stack<int>` class (not using std::stack) backed by a `vector<int>`. Implement: `push(int)`, `pop()` (returns and removes top), `peek()` (returns top without removing), `isEmpty()`, `size()`. Make `pop()` and `peek()` throw `std::runtime_error` if the stack is empty. Test with a sequence of pushes and pops.",
      hint: "Use a private `vector<int> data`. push: `data.push_back(val)`. pop: check empty, then `int top = data.back(); data.pop_back(); return top;`",
      walkthrough: [
        "Private: vector<int> data",
        "push: data.push_back(val)",
        "peek: if (isEmpty()) throw; return data.back()",
        "pop: if (isEmpty()) throw; int top = data.back(); data.pop_back(); return top",
        "isEmpty: return data.empty(). size: return data.size()",
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
          "struct cannot have methods; class can",
          "struct members are public by default; class members are private by default",
          "struct is stack-allocated; class is heap-allocated",
          "struct cannot use inheritance; class can",
        ],
        answer: 1,
        explanation:
          "In C++, `struct` and `class` are identical except for default access: `struct` defaults to `public`, `class` defaults to `private`. Both can have methods, constructors, inheritance, and all OOP features.",
      },
      {
        id: "cpp1-001-q2",
        type: "choice",
        text: "What does marking a method `const` (e.g., `double area() const`) guarantee?",
        options: [
          "The method runs at compile time",
          "The method cannot modify any member variables of the object",
          "The method's return value cannot be modified by the caller",
          "The method can only be called on const pointers",
        ],
        answer: 1,
        explanation:
          "A `const` method promises not to modify the object's state — `this` is treated as `const T*`. This allows calling the method on const objects and const references. Any attempt to modify a member inside a const method is a compile error.",
      },
      {
        id: "cpp1-001-q3",
        type: "choice",
        text: "Why is encapsulation (making members private) valuable?",
        options: [
          "It makes programs run faster",
          "It prevents external code from putting the object in an invalid state",
          "It allows the object to be copied more efficiently",
          "It is required to use templates",
        ],
        answer: 1,
        explanation:
          "Private members can only be modified through the class's own methods. Those methods can validate inputs and enforce invariants (rules that keep the object in a valid state). External code can't bypass these checks. This is the fundamental value of encapsulation.",
      },
      {
        id: "cpp1-001-q4",
        type: "choice",
        text: "What is the purpose of a member initializer list `Circle(double r) : radius(r) {}`?",
        options: [
          "It's just alternative syntax for `{ radius = r; }` with no difference",
          "It initializes members before the constructor body runs, which is required for const members and references, and more efficient for complex types",
          "It allows initializing private members from outside the class",
          "It makes the constructor run at compile time",
        ],
        answer: 1,
        explanation:
          "Initializer lists initialize members directly — they don't default-construct then assign. For `const` members and reference members, initializer lists are required (you can't assign to them in the body). For complex types, it avoids double-construction.",
      },
    ],
  },
};

export default lesson;

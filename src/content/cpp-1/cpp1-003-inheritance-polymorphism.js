const INHERIT_CODE = `#include <iostream>
#include <string>
#include <vector>
#include <memory>
using namespace std;

// ── Base class ─────────────────────────────────────────────────
class Shape {
protected:
    string color;

public:
    Shape(const string& c) : color(c) {}
    virtual ~Shape() {}   // ALWAYS virtual destructor in base

    virtual double area()      const = 0;   // pure virtual
    virtual double perimeter() const = 0;   // pure virtual
    virtual string name()      const = 0;

    void describe() const {
        cout << name() << " [" << color << "]: "
             << "area=" << area()
             << " perimeter=" << perimeter() << endl;
    }
};

// ── Derived: Circle ────────────────────────────────────────────
class Circle : public Shape {
    double radius;
public:
    Circle(double r, const string& c = "red")
        : Shape(c), radius(r) {}

    double area()      const override { return 3.14159 * radius * radius; }
    double perimeter() const override { return 2 * 3.14159 * radius; }
    string name()      const override { return "Circle"; }
};

// ── Derived: Rectangle ────────────────────────────────────────
class Rectangle : public Shape {
    double w, h;
public:
    Rectangle(double w, double h, const string& c = "blue")
        : Shape(c), w(w), h(h) {}

    double area()      const override { return w * h; }
    double perimeter() const override { return 2*(w+h); }
    string name()      const override { return "Rectangle"; }

    bool isSquare() const { return w == h; }
};

// ── Derived: Triangle ─────────────────────────────────────────
class Triangle : public Shape {
    double a, b, c;
public:
    Triangle(double a, double b, double c, const string& col = "green")
        : Shape(col), a(a), b(b), c(c) {}

    double perimeter() const override { return a + b + c; }
    double area()      const override {
        double s = perimeter() / 2;
        return sqrt(s*(s-a)*(s-b)*(s-c));  // Heron's formula
    }
    string name()      const override { return "Triangle"; }
};

// __OUTPUT__: --- Polymorphism via base pointer ---\\nCircle [red]: area=78.5397 perimeter=31.4159\\nRectangle [blue]: area=24 perimeter=20\\nTriangle [green]: area=6 perimeter=12\\n--- Total area of all shapes ---\\nTotal area: 108.54\\n--- Runtime type detection ---\\nRectangle isSquare? 0

int main() {
    // ── Polymorphism: hold different types via base pointer ────
    cout << "--- Polymorphism via base pointer ---" << endl;
    vector<unique_ptr<Shape>> shapes;
    shapes.push_back(make_unique<Circle>(5.0));
    shapes.push_back(make_unique<Rectangle>(4.0, 6.0));
    shapes.push_back(make_unique<Triangle>(3.0, 4.0, 5.0));

    for (const auto& s : shapes) {
        s->describe();   // virtual dispatch — calls correct subclass method
    }

    // ── Process all shapes uniformly ──────────────────────────
    cout << "--- Total area of all shapes ---" << endl;
    double total = 0;
    for (const auto& s : shapes) total += s->area();
    cout << "Total area: " << total << endl;

    // ── Dynamic cast for subclass-specific operations ──────────
    cout << "--- Runtime type detection ---" << endl;
    for (const auto& s : shapes) {
        Rectangle* r = dynamic_cast<Rectangle*>(s.get());
        if (r) cout << "Rectangle isSquare? " << r->isSquare() << endl;
    }

    return 0;
}`;

const lesson = {
  id: "cpp-1-003",
  slug: "inheritance-polymorphism",
  chapter: "cpp-1",
  order: 3,
  title: "Inheritance and Polymorphism",
  subtitle: "Build class hierarchies and write code that works with any derived type",
  tags: ["c++", "cpp", "inheritance", "polymorphism", "virtual", "override", "abstract", "base-class"],
  aliases: [
    "c++ inheritance",
    "c++ polymorphism",
    "c++ virtual functions",
    "c++ override keyword",
    "c++ base derived class",
  ],

  hook: `Inheritance lets you define a new type in terms of an existing one — inheriting its interface and optionally overriding its behavior. Polymorphism lets you write code against a base class interface that works automatically with any derived class. Together, they're the foundation of extensible, maintainable software: add a new shape without changing the rendering loop; add a new payment method without changing the checkout code.`,

  mentalModel: [
    "**Inheritance models 'is-a' relationships.** A `Circle` IS-A `Shape`. A `Dog` IS-A `Animal`. Derived classes inherit all public and protected members of the base, and can add new members or override virtual methods. Public inheritance (`class Circle : public Shape`) preserves the interface — a `Circle*` can be used wherever a `Shape*` is expected.",
    "**`virtual` enables runtime dispatch.** Without `virtual`, `Shape* s = new Circle(); s->area()` calls `Shape::area()`. With `virtual`, it calls `Circle::area()` — the actual runtime type determines which function runs. This is **dynamic dispatch** via the vtable (virtual function table). `virtual` functions have a small overhead but enable the power of polymorphism.",
    "**Pure virtual functions (`= 0`) create abstract classes.** `virtual double area() const = 0;` says 'every derived class must provide this'. You can't instantiate `Shape` directly — only concrete derived classes. Abstract base classes define interfaces: any class that implements all pure virtual methods can be used anywhere the interface is expected.",
  ],

  intuition: {
    prose: [
      "**The vtable mechanism.** When a class has virtual functions, the compiler adds a hidden pointer to a 'virtual function table' (vtable) in each object. The vtable is an array of function pointers for each virtual method. When you call `s->area()`, the CPU: (1) loads the vtable pointer from `s`, (2) indexes into the table to find `area`, (3) calls through the pointer. This one extra indirection is the entire cost of polymorphism — typically negligible.",
      "**`override` is your safety net.** Writing `double area() const override` tells the compiler: 'I intend to override a base class virtual'. If you misspell the method name or change the signature, the compiler errors instead of silently creating a new non-virtual method. Always use `override` in derived classes — it catches signature mismatches that would otherwise lead to subtle bugs where the 'override' is actually a new function that the vtable never uses.",
      "**Why `virtual` destructor in the base class?** If you delete a derived object through a base pointer `Shape* s = new Circle(); delete s;`, without a virtual destructor, only `Shape::~Shape()` runs — `Circle::~Circle()` is never called, leaking Circle's resources. With `virtual ~Shape()`, the correct destructor chain runs. Rule: any class with virtual functions must have a virtual destructor.",
      "**`dynamic_cast` for safe downcasting.** `static_cast<Circle*>(ptr)` is a forced cast — undefined behavior if `ptr` doesn't actually point to a Circle. `dynamic_cast<Circle*>(ptr)` checks the actual runtime type and returns `nullptr` if it's not a Circle (for pointer) or throws `std::bad_cast` (for reference). Use `dynamic_cast` when you genuinely don't know the runtime type; otherwise, the design might need rethinking to avoid casting down the hierarchy.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge:
          "**Extend the hierarchy:**\n\n1. Compile and run — observe virtual dispatch in the loop\n2. Add a `Square` class inheriting from `Rectangle` — constructor takes one side\n3. Add `virtual void draw() const` to Shape that prints an ASCII shape\n4. Try `Shape s;` — compile error, Shape is abstract (has pure virtuals)\n5. Add a free function `void printAll(const vector<Shape*>& v)` — it works with any mix of shapes\n6. Try `dynamic_cast<Circle*>(&rect)` where rect is a Rectangle — returns nullptr",
        props: {
          mainFile: "main.cpp",
          initialFiles: {
            "/home/user/main.cpp": INHERIT_CODE,
          },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Object slicing.** If you store a derived object by value in a base variable — `Shape s = circle` — the derived part is 'sliced off'. Only the `Shape` portion is copied. Any data or vtable from `Circle` is lost. This is why polymorphism requires pointers or references: `Shape* s = &circle` or `Shape& s = circle`. A `vector<Shape>` would slice all elements. Always use `vector<shared_ptr<Shape>>` or `vector<unique_ptr<Shape>>` for heterogeneous collections.",
      "**Multiple inheritance and the diamond problem.** C++ allows inheriting from multiple base classes: `class FlyingCar : public Car, public Airplane`. If both `Car` and `Airplane` inherit from `Vehicle`, `FlyingCar` gets two copies of `Vehicle`'s data — the diamond problem. Virtual inheritance (`class Car : public virtual Vehicle`) solves this by ensuring only one shared copy of the base. Multiple inheritance is powerful but complex — avoid unless the design clearly calls for it.",
      "**Liskov Substitution Principle (LSP).** A derived class should be usable wherever its base class is expected without breaking the program's correctness. If `Circle::area()` returns a negative number, it violates LSP. If `Square` overrides `Rectangle::setWidth` and also changes the height, it violates LSP (Rectangle's contract says width and height are independent). LSP violations are subtle design bugs that inheritance doesn't prevent automatically — they require discipline.",
    ],
    callouts: [
      {
        type: "warning",
        title: "Always virtual destructor in polymorphic base classes",
        body: "If any method is virtual (the class is meant to be used polymorphically), the destructor must also be virtual. Otherwise, `delete basePtr` where `basePtr` points to a derived object only calls the base destructor — the derived destructor is never called, leaking resources. Rule: polymorphic base class = virtual destructor.",
      },
      {
        type: "info",
        title: "override and final keywords (C++11)",
        body: "`override` on a derived method verifies it actually overrides a base virtual. `final` prevents further overriding: `class Concrete final : public Base` (class can't be subclassed) or `void f() final` (method can't be overridden). Both improve clarity and catch mistakes. Always use `override`.",
      },
      {
        type: "tip",
        title: "Prefer composition over inheritance",
        body: "Inheritance creates tight coupling. Before inheriting, ask: 'Is this truly an is-a relationship?' If you're inheriting to reuse code rather than to model a type relationship, prefer composition (holding a member). E.g., a `Car` HAS-A `Engine` (composition) rather than IS-A `Engine` (inheritance). Composition is more flexible and easier to change.",
      },
    ],
  },

  examples: [
    {
      title: "Animal hierarchy with virtual dispatch",
      body: `class Animal {
public:
    virtual ~Animal() {}
    virtual string speak() const = 0;
    virtual string name()  const = 0;

    void introduce() const {
        cout << "I am a " << name() << " and I say: " << speak() << endl;
    }
};

class Dog : public Animal {
public:
    string speak() const override { return "Woof!"; }
    string name()  const override { return "Dog"; }
};

class Cat : public Animal {
public:
    string speak() const override { return "Meow!"; }
    string name()  const override { return "Cat"; }
};

// Works with any Animal — no need to know the actual type
void makeNoise(const vector<unique_ptr<Animal>>& animals) {
    for (const auto& a : animals) a->introduce();
}`,
    },
    {
      title: "Protected members and constructor chaining",
      body: `class Employee {
protected:
    string name;
    double salary;

public:
    Employee(string n, double s) : name(n), salary(s) {}
    virtual ~Employee() {}

    virtual double bonus() const { return 0; }
    double totalComp() const { return salary + bonus(); }

    virtual void print() const {
        cout << name << ": $" << salary << " + $" << bonus() << " bonus" << endl;
    }
};

class Manager : public Employee {
    int reports;
public:
    Manager(string n, double s, int r)
        : Employee(n, s), reports(r) {}   // chain to base constructor

    double bonus() const override {
        return salary * 0.10 * reports;   // 10% per report
    }
    void print() const override {
        Employee::print();                // call base version
        cout << "  Manages " << reports << " people" << endl;
    }
};`,
    },
    {
      title: "Interface via pure abstract class",
      body: `// Pure interface — no data, all pure virtual
class Serializable {
public:
    virtual ~Serializable() {}
    virtual string serialize()         const = 0;
    virtual void   deserialize(string) = 0;
};

class Printable {
public:
    virtual ~Printable() {}
    virtual void print() const = 0;
};

// Multiple interface inheritance
class Config : public Serializable, public Printable {
    map<string, string> data;
public:
    string serialize() const override {
        string result;
        for (auto& [k, v] : data) result += k + "=" + v + ";";
        return result;
    }
    void deserialize(string s) override { /* parse s */ }
    void print() const override {
        for (auto& [k, v] : data) cout << k << "=" << v << endl;
    }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "medium",
      problem:
        "Build a mini calculator using polymorphism. Define abstract class `Operation` with `virtual double apply(double a, double b) const = 0` and `virtual string symbol() const = 0`. Create derived classes `Add`, `Subtract`, `Multiply`, `Divide`. Write `double compute(double a, double b, const Operation& op)` that takes any operation. Test all four operations.",
      hint: "Store operations as `unique_ptr<Operation>` in a vector. For Divide, check if b == 0 and return 0 or print error.",
      walkthrough: [
        "Abstract base: virtual double apply(double, double) const = 0;",
        "Derived Add: return a + b; symbol: return \"+\"",
        "Free function: compute(a, b, op) { return op.apply(a, b); }",
        "Test: for each op in ops: cout << a << op.symbol() << b << \" = \" << compute(a,b,op)",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Design a payment system. Abstract `PaymentMethod` with `virtual bool process(double amount) = 0` and `virtual string name() const = 0`. Derive: `CreditCard` (succeeds if `balance >= amount`), `PayPal` (succeeds if email is not empty and amount > 0), `CryptoWallet` (50% chance of 'network error'). Process a list of payments using base class references.",
      hint: "Use `rand() % 2 == 0` for the CryptoWallet random failure. Store in `vector<unique_ptr<PaymentMethod>>`.",
      walkthrough: [
        "Abstract base with process() and name()",
        "CreditCard: has double balance; process deducts if enough",
        "PayPal: has string email; process validates email",
        "CryptoWallet: random failure; process returns rand()%2==0",
        "Main: loop through payments, call process(), report success/fail",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-003-q1",
        type: "choice",
        text: "What is object slicing?",
        options: [
          "A technique to slice arrays using iterators",
          "When a derived object is assigned to a base class value, losing the derived-class members",
          "When a virtual function is not overridden in a derived class",
          "When dynamic_cast returns nullptr",
        ],
        answer: 1,
        explanation:
          "Object slicing occurs when a derived object is stored by value in a base class variable. The base class copy constructor/assignment is called, copying only the base portion — the derived data and vtable pointer are lost. Always use pointers or references for polymorphism.",
      },
      {
        id: "cpp1-003-q2",
        type: "choice",
        text: "What does `= 0` after a virtual function declaration mean?",
        options: [
          "The function returns 0 by default",
          "The function is pure virtual — derived classes must implement it, and the class cannot be instantiated",
          "The function cannot be overridden",
          "The function is initialized to do nothing",
        ],
        answer: 1,
        explanation:
          "`virtual double f() = 0;` declares a pure virtual function. The class is now abstract — you cannot create instances of it. Any derived class must override this function to be concrete (instantiable).",
      },
      {
        id: "cpp1-003-q3",
        type: "choice",
        text: "Why must a polymorphic base class have a virtual destructor?",
        options: [
          "Virtual destructors make the destructor run faster",
          "Without it, `delete basePtr` only runs the base destructor — the derived destructor is never called, leaking resources",
          "Virtual destructors are required by the C++ standard for all classes",
          "Virtual destructors prevent object slicing",
        ],
        answer: 1,
        explanation:
          "When you delete a derived object through a base pointer, the destructor called is determined by dynamic dispatch — but only if the destructor is virtual. Without `virtual ~Base()`, the base destructor runs but the derived destructor doesn't, potentially leaking the derived class's resources.",
      },
      {
        id: "cpp1-003-q4",
        type: "choice",
        text: "What does `override` do in C++11?",
        options: [
          "Forces the method to override the base implementation even if the signature doesn't match",
          "Tells the compiler to verify that this method actually overrides a base class virtual function — compile error if it doesn't",
          "Makes the function non-virtual",
          "Prevents the base class version from being called",
        ],
        answer: 1,
        explanation:
          "`override` is a specifier that tells the compiler 'this is intended to override a base class virtual function'. If there's no matching virtual function in the base (misspelled name, wrong signature), the compiler errors. This catches bugs where you think you're overriding but are actually defining a new function.",
      },
    ],
  },
};

export default lesson;

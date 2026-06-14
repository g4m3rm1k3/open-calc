const INHERIT_CODE = `#include <iostream>
#include <string>
using namespace std;

// __OUTPUT__: Animal says: ...\\nDog says: Woof!\\nDog runs

class Animal {
protected:
    string name;
public:
    Animal(string n) : name(n) {}
    void speak()  const { cout << name << " says: ..." << endl; }
    void breathe()const { cout << name << " breathes" << endl; }
};

class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    void speak() const { cout << name << " says: Woof!" << endl; }  // override
    void run()   const { cout << name << " runs" << endl; }         // new method
};

int main() {
    Animal a("Animal");
    Dog d("Dog");
    a.speak();
    d.speak();   // calls Dog::speak, not Animal::speak
    d.run();
    return 0;
}`;

const VIRTUAL_CODE = `#include <iostream>
#include <vector>
#include <memory>
using namespace std;

// __OUTPUT__: Woof!\\nMeow!\\nWoof!\\nMeow!

class Animal {
public:
    virtual ~Animal() {}
    virtual void speak() const { cout << "..." << endl; }
};

class Dog : public Animal {
public:
    void speak() const override { cout << "Woof!" << endl; }
};

class Cat : public Animal {
public:
    void speak() const override { cout << "Meow!" << endl; }
};

int main() {
    // Polymorphism: different objects, same call site
    vector<unique_ptr<Animal>> animals;
    animals.push_back(make_unique<Dog>());
    animals.push_back(make_unique<Cat>());

    for (const auto& a : animals) a->speak();  // virtual dispatch

    Animal* p = new Dog();
    p->speak();    // Woof! — virtual, calls Dog::speak
    delete p;

    Animal* q = new Cat();
    q->speak();    // Meow!
    delete q;

    return 0;
}`;

const ABSTRACT_CODE = `#include <iostream>
#include <cmath>
using namespace std;

// __OUTPUT__: Circle area=78.5398\\nRect area=24

class Shape {
public:
    virtual ~Shape() {}
    virtual double area() const = 0;        // pure virtual — must override
    virtual string name() const = 0;

    void describe() const {
        cout << name() << " area=" << area() << endl;
    }
};

// Shape s;  // ERROR: can't instantiate abstract class

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
    string name() const override { return "Circle"; }
};

class Rect : public Shape {
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
    string name() const override { return "Rect"; }
};

int main() {
    Circle c(5);
    Rect   r(4, 6);
    c.describe();
    r.describe();
    return 0;
}`;

const CAST_CODE = `#include <iostream>
#include <memory>
using namespace std;

// __OUTPUT__: Dog barks\\nCat is not a Dog

class Animal { public: virtual ~Animal() {} };
class Dog : public Animal { public: void bark() { cout << "Dog barks\\n"; } };
class Cat : public Animal { public: void meow() { cout << "Cat meows\\n"; } };

int main() {
    unique_ptr<Animal> a = make_unique<Dog>();

    // dynamic_cast: safe downcast — returns nullptr if wrong type
    Dog* d = dynamic_cast<Dog*>(a.get());
    if (d) d->bark();

    Cat* c = dynamic_cast<Cat*>(a.get());
    if (!c) cout << "Cat is not a Dog" << endl;

    return 0;
}`;

const lesson = {
  id: "cpp-1-003",
  slug: "inheritance-polymorphism",
  chapter: "cpp-1",
  order: 3,
  title: "Inheritance and Polymorphism",
  subtitle: "Extend existing classes and write code that works on any subtype",
  tags: ["c++", "cpp", "inheritance", "polymorphism", "virtual", "override", "abstract", "dynamic-cast"],
  aliases: [
    "c++ inheritance",
    "c++ virtual functions",
    "c++ polymorphism",
    "c++ abstract class",
    "c++ override",
  ],

  hook: `Inheritance lets you build new types by extending existing ones — reusing code, expressing 'is-a' relationships. Polymorphism lets you write code that works on a base type but automatically calls the right derived type's method at runtime. Together they enable extensible, flexible designs.`,

  mentalModel: [
    "**Inheritance: derived class gets all base class members.** `Dog : public Animal` means Dog has everything Animal has, plus its own additions. The derived class can override methods to change behavior, and add new methods. The base class constructor must be called explicitly in the derived constructor's initializer list.",
    "**`virtual` enables runtime dispatch.** Without `virtual`, `Animal* p = new Dog(); p->speak()` calls `Animal::speak` — the call is resolved at compile time based on the pointer type. With `virtual`, the call is resolved at runtime based on the actual object type — calling `Dog::speak`. This is the core mechanism of polymorphism.",
    "**Pure virtual (`= 0`) makes a class abstract.** A class with any pure virtual method can't be instantiated. It defines an interface that all derived classes must implement. Abstract classes enable 'program to an interface, not an implementation'.",
  ],

  intuition: {
    prose: [
      "**Inheritance without virtual is just code reuse.** Dog inherits Animal's `breathe()` method without rewriting it. But `speak()` is overridden — Dog defines its own version. Without `virtual`, the version that runs depends on the pointer/reference type at compile time.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Inheritance — run it then explore:**\n\n- Call `d.breathe()` — Dog inherits it from Animal without declaring it.\n- Try `Animal* ap = &d; ap->speak();` — which speak runs? (Animal's — not virtual yet)\n- Add `virtual void speak()` to Animal — now `ap->speak()` calls Dog's version.\n- Add a `Cat` class that inherits from Animal and overrides speak.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": INHERIT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Virtual dispatch — run it then explore:**\n\n- Remove `virtual ~Animal()` — what happens to derived object cleanup when deleting via base pointer?\n- Remove `override` from Dog::speak — does it still work? (yes, but override catches typos)\n- Add a `Parrot` class that overrides speak differently. Add it to the vector.\n- What does `animals[0]->speak()` resolve to at compile time vs runtime?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": VIRTUAL_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Abstract classes define interfaces.** A `Shape` with pure virtual `area()` can't be instantiated — it's a contract. Any class that inherits from `Shape` must implement `area()` or it too becomes abstract. This enforces consistency: everything that's a `Shape` must provide `area()`. You can hold `Shape*` pointers to any concrete shape and call `area()` without knowing the concrete type.",
      "**`dynamic_cast` for safe downcasting.** If you have a `Animal*` and suspect it's a `Dog*`, `dynamic_cast<Dog*>(ptr)` returns the pointer if correct, `nullptr` if not. For references, it throws `bad_cast` on failure. `dynamic_cast` requires at least one virtual function in the hierarchy (for RTTI). Use it sparingly — needing to downcast often signals a design problem.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Abstract class — run it then explore:**\n\n- Try `Shape s;` — what error do you get?\n- Add `class Triangle : public Shape` that computes area with Heron's formula.\n- What happens if you forget to implement `name()` in a derived class?\n- Add a `totalArea(vector<Shape*>& shapes)` free function that sums all areas using polymorphism.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ABSTRACT_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**dynamic_cast — run it then explore:**\n\n- Try `dynamic_cast<Dog&>(*a.get())` (reference form) — what happens when it fails?\n- What happens if Animal has no virtual functions and you try dynamic_cast? (compile error)\n- Remove `virtual ~Animal()` — what destructors run when deleting through a base pointer?\n- Add a `makeAnimal(bool isDog)` function that returns `unique_ptr<Animal>` — caller uses dynamic_cast to get the specific type.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CAST_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Always use virtual destructor in base classes",
        body: "If you delete a derived object through a base pointer without a virtual destructor, only the base destructor runs — the derived destructor is skipped, leaking resources. Rule: if a class has ANY virtual methods (i.e., it's designed for inheritance), its destructor must be virtual.",
      },
      {
        type: "tip",
        title: "Use override — catch typos at compile time",
        body: "`void speak() const override` tells the compiler: 'this must match a virtual method in the base class'. If you typo the signature (wrong const, wrong return type), the compiler catches it. Without `override`, the typo silently creates a new method instead of overriding, and polymorphism breaks invisibly.",
      },
    ],
  },

  examples: [
    {
      title: "Polymorphic collection processing",
      body: `// Function works on any Shape — polymorphism
double totalArea(const vector<unique_ptr<Shape>>& shapes) {
    double total = 0;
    for (const auto& s : shapes) total += s->area();
    return total;
}

vector<unique_ptr<Shape>> shapes;
shapes.push_back(make_unique<Circle>(5));
shapes.push_back(make_unique<Rect>(4, 6));

cout << totalArea(shapes) << endl;   // 78.5 + 24 = 102.5

// Adding a Triangle later requires no changes to totalArea`,
    },
    {
      title: "Interface (abstract class) pattern",
      body: `class Serializable {
public:
    virtual ~Serializable() {}
    virtual string serialize() const = 0;
    virtual void deserialize(const string& s) = 0;
};

class Config : public Serializable {
    map<string, string> data;
public:
    string serialize() const override {
        string result;
        for (auto& [k, v] : data) result += k + "=" + v + ";";
        return result;
    }
    void deserialize(const string& s) override { /* parse */ }
};`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Build an `Employee` hierarchy. Base class: `Employee` with `name` and `baseSalary`. Derived: `Manager` (adds `bonus`) and `Developer` (adds `overtimeHours` at $50/hr). Each has a virtual `salary()` method. Print each employee's total salary using a `vector<unique_ptr<Employee>>`.",
      hint: "Manager::salary = baseSalary + bonus. Developer::salary = baseSalary + overtimeHours * 50.",
      walkthrough: [
        "class Employee { protected: string name; double baseSalary; public: virtual double salary() const = 0; }",
        "class Manager : public Employee { double bonus; double salary() const override { return baseSalary + bonus; } }",
        "class Developer : public Employee { int overtime; double salary() const override { return baseSalary + overtime * 50; } }",
        "vector<unique_ptr<Employee>> employees; use push_back to add; loop and call salary()",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Implement a `Logger` abstract class with pure virtual `void log(const string& msg)`. Create three derived classes: `ConsoleLogger` (prints to cout), `FileLogger` (writes to a file), and `MultiLogger` (holds a vector of Loggers and forwards to all of them). Test with MultiLogger containing both Console and File loggers.",
      hint: "MultiLogger::log calls `for (auto& l : loggers) l->log(msg);`. Use `unique_ptr<Logger>` in the MultiLogger's vector.",
      walkthrough: [
        "class Logger { public: virtual void log(string msg) = 0; virtual ~Logger(){} }",
        "ConsoleLogger: cout << msg;",
        "FileLogger: ofstream file; write msg;",
        "MultiLogger: vector<unique_ptr<Logger>> loggers; log() iterates all",
        "Test: multi->addLogger(make_unique<ConsoleLogger>()); multi->log('hello');",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp1-003-q1",
        type: "choice",
        text: "Without `virtual`, what does `Animal* p = new Dog(); p->speak();` call?",
        options: [
          "Dog::speak — because the actual object is a Dog",
          "Animal::speak — because the pointer type is Animal*",
          "Compilation error",
          "It depends on which was defined first",
        ],
        answer: 1,
        explanation:
          "Without `virtual`, method calls are resolved at compile time based on the static type of the pointer/reference (`Animal*`), not the runtime type of the object. `Animal::speak` is called. Adding `virtual` to Animal::speak enables runtime dispatch.",
      },
      {
        id: "cpp1-003-q2",
        type: "choice",
        text: "What does a pure virtual method (`= 0`) do to a class?",
        options: [
          "Makes the method private",
          "Makes the class abstract — it cannot be instantiated directly",
          "Removes the method from the vtable",
          "Makes the method inline",
        ],
        answer: 1,
        explanation:
          "A class with at least one pure virtual method is abstract — you can't create instances of it. Derived classes must implement all pure virtuals (or they too become abstract). Abstract classes define interfaces.",
      },
      {
        id: "cpp1-003-q3",
        type: "choice",
        text: "Why must base classes with virtual methods have a virtual destructor?",
        options: [
          "To enable calling delete on derived objects",
          "Without it, deleting a derived object through a base pointer only calls the base destructor — the derived destructor is skipped",
          "To prevent memory fragmentation",
          "C++ requires it for all classes",
        ],
        answer: 1,
        explanation:
          "When you `delete base_ptr` where base_ptr points to a Derived object, if the destructor is non-virtual, only `Base::~Base` runs. `Derived::~Derived` is skipped — leaking any resources the derived class owns. Virtual destructor ensures the correct derived destructor is called.",
      },
      {
        id: "cpp1-003-q4",
        type: "choice",
        text: "What does `dynamic_cast<Dog*>(animal_ptr)` return if `animal_ptr` actually points to a Cat?",
        options: [
          "A Dog* pointer to the Cat object",
          "nullptr",
          "Throws std::bad_cast",
          "Undefined behavior",
        ],
        answer: 1,
        explanation:
          "`dynamic_cast` for pointers returns `nullptr` if the cast fails (wrong type). For references, it throws `std::bad_cast`. This makes it safe to attempt downcasts and check the result.",
      },
    ],
  },
};

export default lesson;

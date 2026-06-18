export default {
  id: 'py-4-10-solid-principles',
  slug: 'oop-solid',
  chapter: 4.10,
  order: 10,
  title: 'SOLID Principles',
  subtitle: 'Five rules for writing OOP code that stays maintainable as it grows',
  tags: ['SOLID', 'SRP', 'OCP', 'LSP', 'ISP', 'DIP', 'dependency injection', 'single responsibility'],

  hook: {
    question: 'Why does well-designed OOP code stay easy to change, while poorly designed code becomes fragile the moment you try to extend it?',
    realWorldContext:
      'SOLID is an acronym for five design principles introduced by Robert C. Martin. ' +
      'They are not rules about syntax — they are guidelines about **how to structure classes and relationships** ' +
      'so that your code remains understandable, flexible, and testable as it grows. ' +
      'Violating these principles does not cause immediate errors. ' +
      'It causes **accumulated pain**: a change in one place breaks something unrelated, ' +
      'adding a new feature requires touching five files, and tests become impossible to write ' +
      'because every class depends on every other. ' +
      'Learning to spot and fix these violations is what separates maintainable software from legacy code.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**S — Single Responsibility Principle**: a class should have only one reason to change. ' +
      'If a `UserManager` creates users, saves to a database, sends emails, AND logs — ' +
      'it changes for four different reasons. Split each concern into its own class.',

      '**O — Open/Closed Principle**: software entities should be open for extension, closed for modification. ' +
      'Adding a new shape should not require editing `total_area()`. ' +
      'Define the interface once (an ABC), then extend by adding new subclasses — never by editing existing ones.',

      '**L — Liskov Substitution Principle**: a subclass must be substitutable for its base class everywhere. ' +
      'If code written to work with `Rectangle` breaks when given a `Square`, ' +
      'then `Square` violates LSP. The fix is usually to redesign the hierarchy.',

      '**I — Interface Segregation Principle**: clients should not be forced to depend on methods they don\'t use. ' +
      'A `RobotWorker` should not be forced to implement `eat()` just because it inherits from `Worker`. ' +
      'Split large interfaces into small, focused ones.',

      '**D — Dependency Inversion Principle**: high-level modules should not depend on low-level modules; ' +
      'both should depend on abstractions. ' +
      'Inject the dependency (database, email service) rather than hard-coding it. ' +
      'This makes the high-level class testable with a mock and swappable without changes.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'LSP is the most subtle — and most commonly violated',
        body: 'The Square-inherits-Rectangle example is the classic LSP violation. Square overrides `set_width` to also change the height, breaking the independence that Rectangle implies. Any code written to the Rectangle contract will produce wrong results with a Square. The fix: give Square and Rectangle separate hierarchies both inheriting from an abstract `Shape`.',
      },
      {
        type: 'insight',
        title: 'DIP enables testability',
        body: 'When an `OrderService` accepts a `Database` abstraction instead of creating a `MySQLDatabase` internally, you can pass an `InMemoryDB` in tests — no database setup required. This is dependency injection, and it is the single biggest enabler of testable code.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'OOP 4.10 — SOLID Principles',
        mathBridge: 'For each principle, study the BAD example first. Identify exactly what breaks before reading the GOOD example.',
        caption: 'See each SOLID violation alongside its clean solution.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'S — Single Responsibility Principle',
              prose:
                '`BadUserManager.create_user` does four things: creates the user object, saves it, sends email, and logs. ' +
                'It has four reasons to change. ' +
                'The fix: split into `UserRepository` (storage), `EmailService` (email), `Logger` (logging), ' +
                'and `UserService` (coordination). Each class has exactly one reason to change.',
              code: [
                '# BAD — one class doing too many things',
                'class BadUserManager:',
                '    def create_user(self, username, email):',
                '        user = {"username": username, "email": email}',
                '        print(f"Saving {user} to DB")       # persistence',
                '        print(f"Sending welcome to {email}") # email',
                '        print(f"Log: Created {username}")    # logging',
                '        return user',
                '',
                '',
                '# GOOD — each class has one responsibility',
                'class UserRepository:',
                '    def save(self, user):',
                '        print(f"DB: Saving {user[\'username\']}")',
                '',
                'class EmailService:',
                '    def send_welcome_email(self, email):',
                '        print(f"Email: Welcome to {email}")',
                '',
                'class Logger:',
                '    def log(self, msg):',
                '        from datetime import datetime',
                '        print(f"[{datetime.now().strftime(\'%H:%M:%S\')}] {msg}")',
                '',
                'class UserService:',
                '    """Coordination only — delegates everything else."""',
                '    def __init__(self, repo, email, logger):',
                '        self.repo = repo',
                '        self.email = email',
                '        self.logger = logger',
                '',
                '    def create_user(self, username, email):',
                '        user = {"username": username, "email": email}',
                '        self.repo.save(user)',
                '        self.email.send_welcome_email(email)',
                '        self.logger.log(f"Created user: {username}")',
                '        return user',
                '',
                '',
                'svc = UserService(UserRepository(), EmailService(), Logger())',
                'svc.create_user("alice", "alice@example.com")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'O — Open/Closed Principle',
              prose:
                '`bad_area_calculator` uses if/elif to handle each shape type. ' +
                'Adding a new shape requires modifying this function — it is closed for extension and open for modification (backwards). ' +
                'The fix: define an `ABC` with an `area()` method. Each new shape adds a class, no existing code changes.',
              code: [
                'from abc import ABC, abstractmethod',
                '',
                '# BAD — adding triangle requires editing this function',
                'def bad_area_calculator(shape):',
                '    if shape["type"] == "circle":',
                '        return 3.14 * shape["radius"] ** 2',
                '    elif shape["type"] == "rectangle":',
                '        return shape["width"] * shape["height"]',
                '    # Adding triangle means editing here — violation!',
                '',
                '',
                '# GOOD — add shapes without touching existing code',
                'class Shape(ABC):',
                '    @abstractmethod',
                '    def area(self) -> float: pass',
                '',
                'class Circle(Shape):',
                '    def __init__(self, r): self.r = r',
                '    def area(self): return 3.14159 * self.r ** 2',
                '',
                'class Rectangle(Shape):',
                '    def __init__(self, w, h): self.w = w; self.h = h',
                '    def area(self): return self.w * self.h',
                '',
                '# Adding Triangle requires ZERO changes to Circle, Rectangle, or total_area',
                'class Triangle(Shape):',
                '    def __init__(self, base, height): self.base = base; self.height = height',
                '    def area(self): return 0.5 * self.base * self.height',
                '',
                'def total_area(shapes):',
                '    return sum(s.area() for s in shapes)',
                '',
                'shapes = [Circle(5), Rectangle(4, 6), Triangle(3, 8)]',
                'print(f"Total area: {total_area(shapes):.2f}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'L — Liskov Substitution Principle',
              prose:
                '`BadSquare` inherits from `BadRectangle` and overrides `set_width` to also change height. ' +
                'Code that expects a `Rectangle` (set width=5, height=4, get area=20) silently breaks when given a `Square`. ' +
                'The fix: give `Square` and `Rectangle` separate classes under a shared `Shape` ABC — no substitution, no violation.',
              code: [
                'from abc import ABC, abstractmethod',
                '',
                '# BAD — Square breaks Rectangle\'s contract',
                'class BadRectangle:',
                '    def __init__(self, w, h): self.width = w; self.height = h',
                '    def set_width(self, w): self.width = w',
                '    def set_height(self, h): self.height = h',
                '    def area(self): return self.width * self.height',
                '',
                'class BadSquare(BadRectangle):',
                '    def set_width(self, w):',
                '        self.width = self.height = w   # breaks independence!',
                '    def set_height(self, h):',
                '        self.width = self.height = h',
                '',
                'def check_rectangle(rect):',
                '    rect.set_width(5)',
                '    rect.set_height(4)',
                '    assert rect.area() == 20, f"Expected 20, got {rect.area()}"',
                '    print("Rectangle contract satisfied.")',
                '',
                'check_rectangle(BadRectangle(1, 1))   # passes',
                'try:',
                '    check_rectangle(BadSquare(1, 1))  # fails — LSP violation',
                'except AssertionError as e:',
                '    print(f"LSP violated: {e}")',
                '',
                '',
                '# GOOD — separate, unrelated classes under a shared Shape',
                'class Shape(ABC):',
                '    @abstractmethod',
                '    def area(self): pass',
                '',
                'class GoodRectangle(Shape):',
                '    def __init__(self, w, h): self.w = w; self.h = h',
                '    def area(self): return self.w * self.h',
                '',
                'class GoodSquare(Shape):',
                '    def __init__(self, side): self.side = side',
                '    def area(self): return self.side ** 2',
                '',
                'print(GoodRectangle(5, 4).area())  # 20',
                'print(GoodSquare(5).area())         # 25',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'I — Interface Segregation + D — Dependency Inversion',
              prose:
                'ISP: `BadWorker` forces a `RobotWorker` to implement `eat()` and `sleep()` it doesn\'t need. ' +
                'Fix: split into small focused interfaces (`Workable`, `Eatable`, `Sleepable`). ' +
                'DIP: `BadOrderService` hard-codes `MySQLDatabase` — you cannot test it without a real database. ' +
                'Fix: accept an abstract `Database` and inject the concrete implementation from outside.',
              code: [
                'from abc import ABC, abstractmethod',
                '',
                '# ---- INTERFACE SEGREGATION ----',
                '',
                '# BAD — robots forced to implement eat() and sleep()',
                'class BadWorker(ABC):',
                '    @abstractmethod',
                '    def work(self): pass',
                '    @abstractmethod',
                '    def eat(self): pass    # robots don\'t eat!',
                '    @abstractmethod',
                '    def sleep(self): pass  # robots don\'t sleep!',
                '',
                '# GOOD — small, focused interfaces',
                'class Workable(ABC):',
                '    @abstractmethod',
                '    def work(self): pass',
                '',
                'class Eatable(ABC):',
                '    @abstractmethod',
                '    def eat(self): pass',
                '',
                'class Sleepable(ABC):',
                '    @abstractmethod',
                '    def sleep(self): pass',
                '',
                'class HumanWorker(Workable, Eatable, Sleepable):',
                '    def work(self):  print("Human working.")',
                '    def eat(self):   print("Human eating.")',
                '    def sleep(self): print("Human sleeping.")',
                '',
                'class RobotWorker(Workable):  # only what it needs!',
                '    def work(self): print("Robot working 24/7!")',
                '',
                'HumanWorker().work(); HumanWorker().eat()',
                'RobotWorker().work()',
                '',
                '',
                '# ---- DEPENDENCY INVERSION ----',
                '',
                'class Database(ABC):',
                '    @abstractmethod',
                '    def save(self, data): pass',
                '',
                'class MySQLDB(Database):',
                '    def save(self, data): print(f"MySQL: {data}")',
                '',
                'class PostgreSQLDB(Database):',
                '    def save(self, data): print(f"PostgreSQL: {data}")',
                '',
                'class InMemoryDB(Database):  # great for testing!',
                '    def __init__(self): self.data = []',
                '    def save(self, data): self.data.append(data)',
                '',
                'class OrderService:',
                '    def __init__(self, database: Database):  # inject abstraction',
                '        self.db = database',
                '',
                '    def place_order(self, order):',
                '        self.db.save(order)',
                '',
                'OrderService(MySQLDB()).place_order({"id": 1})',
                'OrderService(PostgreSQLDB()).place_order({"id": 2})',
                'mem = InMemoryDB()',
                'OrderService(mem).place_order({"id": 3})',
                'print("In-memory orders:", mem.data)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      id: 'q1',
      type: 'choice',
      text: 'The Single Responsibility Principle says a class should have:',
      options: [
        'Only one method',
        'Only one reason to change',
        'Only one instance',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'The Open/Closed Principle says code should be:',
      options: [
        'Open for modification, closed for extension',
        'Open for extension, closed for modification',
        'Open for both extension and modification',
      ],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Why does `BadSquare` violate the Liskov Substitution Principle?',
      options: [
        'It does not implement all methods of `BadRectangle`',
        'Code written for `BadRectangle` produces wrong results when given a `BadSquare`',
        'It uses multiple inheritance',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'The Dependency Inversion Principle says high-level modules should depend on:',
      options: [
        'Concrete low-level implementations for maximum performance',
        'Abstractions (interfaces/ABCs), with concrete implementations injected from outside',
        'Global variables shared across modules',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'S: one reason to change — split classes by concern.',
    'O: extend by adding new classes, not by editing existing ones.',
    'L: a subclass must fulfil the contract of its base class everywhere it is used.',
    'I: split large interfaces so classes only implement what they actually need.',
    'D: depend on abstractions; inject concrete implementations from outside.',
    'SOLID violations don\'t crash your code — they make it painful to change over time.',
  ],

  checkpoints: ['read-intuition'],
}

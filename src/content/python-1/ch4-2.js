export default {
  id: 'py-4-2-methods-and-self',
  slug: 'oop-methods',
  chapter: 4.2,
  order: 2,
  title: 'Methods, self, and String Representation',
  subtitle: 'How objects act, communicate, and display themselves',
  tags: ['methods', 'self', '__str__', '__repr__', 'method chaining', 'instance methods'],

  hook: {
    question: 'What is `self`, really — and why does every method have it as its first parameter?',
    realWorldContext:
      'Methods are what make objects useful. Without methods, a class is just a named container for data. ' +
      'Methods are how objects do things: a `BankAccount` deposits money, a `GameCharacter` attacks, ' +
      'a `Rectangle` computes its area. Understanding `self` — the implicit link from every method back to ' +
      'the specific object that called it — is the key conceptual leap in OOP. Alongside that, knowing how ' +
      'Python displays your objects (via `__str__` and `__repr__`) makes debugging dramatically easier.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **method** is simply a function defined inside a class. The only special thing about it: the first ' +
      'parameter is always `self`, which refers to the specific instance the method is called on. ' +
      'When you write `rex.bark()`, Python translates that to `Dog.bark(rex)` — it passes the object as the first argument automatically.',

      '`self` is not a keyword — it is a convention. You could name it anything, but every professional ' +
      'Python programmer uses `self`. Changing it would confuse every reader of your code.',

      'Methods can **return new objects** (immutable pattern) or **modify `self` in place** (mutable pattern). ' +
      'The **method chaining** pattern returns `self` from each method, allowing calls to be chained: ' +
      '`query.select("name").where("age > 18").limit(10).build()`.',

      '`__str__` and `__repr__` are two special methods that control how Python converts your object to text. ' +
      '`__repr__` is for developers — it should be unambiguous. `__str__` is for end users — it should be readable. ' +
      'If you only define one, define `__repr__` — Python will fall back to it for `__str__` as well.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Methods are just functions with an automatic first argument',
        body: '`rex.bark()` and `Dog.bark(rex)` are identical. Python\'s method mechanism just automates the passing of `self`. This is why every instance method must declare `self` — it\'s where Python puts the object.',
      },
      {
        type: 'sequencing',
        title: 'Immutable vs mutable methods',
        body: 'Methods that end with `return self` or `return None` and modify data in place are "mutable" — they change the object. Methods that return a new object without touching `self` are "immutable" — the original is preserved. Both patterns are valid; the choice depends on whether the caller needs the original intact.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'OOP 4.2 — Methods, self, __str__, __repr__',
        mathBridge: 'Run each cell and read the output carefully. Predict results before running.',
        caption: 'Learn how methods give objects behavior and how __str__/__repr__ control display.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Instance methods — the Rectangle class',
              prose:
                'An instance method receives `self` as its first parameter automatically. ' +
                'It can read instance variables with `self.x`, compute results, or modify the object. ' +
                '`scale()` modifies the object in place (no return value). ' +
                '`scaled()` returns a brand-new `Rectangle` without touching the original.',
              code: [
                'class Rectangle:',
                '    def __init__(self, width, height):',
                '        self.width = width',
                '        self.height = height',
                '',
                '    def area(self):',
                '        return self.width * self.height',
                '',
                '    def perimeter(self):',
                '        return 2 * (self.width + self.height)',
                '',
                '    def is_square(self):',
                '        return self.width == self.height',
                '',
                '    def scale(self, factor):',
                '        """Modify self in place — mutable pattern."""',
                '        self.width *= factor',
                '        self.height *= factor',
                '',
                '    def scaled(self, factor):',
                '        """Return a new Rectangle — immutable pattern."""',
                '        return Rectangle(self.width * factor, self.height * factor)',
                '',
                'r1 = Rectangle(4, 6)',
                'print(r1.area())        # 24',
                'print(r1.perimeter())   # 20',
                'print(r1.is_square())   # False',
                '',
                'r2 = r1.scaled(2)       # new object — r1 unchanged',
                'print(r1.width, r1.height)  # 4 6',
                'print(r2.width, r2.height)  # 8 12',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Method chaining — returning self',
              prose:
                'When a method returns `self`, the caller gets the object back and can immediately call another method on it. ' +
                'This creates a readable **fluent interface**. You see this pattern constantly in libraries like pandas (`.filter().groupby().agg()`) ' +
                'and SQLAlchemy (`.select().where().limit()`). The key: every non-terminal method must `return self`.',
              code: [
                'class QueryBuilder:',
                '    """Build a SQL query with a fluent interface."""',
                '',
                '    def __init__(self, table):',
                '        self.table = table',
                '        self._columns = ["*"]',
                '        self._conditions = []',
                '        self._limit = None',
                '',
                '    def select(self, *columns):',
                '        self._columns = list(columns)',
                '        return self   # <-- enables chaining',
                '',
                '    def where(self, condition):',
                '        self._conditions.append(condition)',
                '        return self',
                '',
                '    def limit(self, n):',
                '        self._limit = n',
                '        return self',
                '',
                '    def build(self):',
                '        cols = ", ".join(self._columns)',
                '        query = f"SELECT {cols} FROM {self.table}"',
                '        if self._conditions:',
                '            query += " WHERE " + " AND ".join(self._conditions)',
                '        if self._limit:',
                '            query += f" LIMIT {self._limit}"',
                '        return query',
                '',
                'sql = (QueryBuilder("users")',
                '       .select("id", "name", "email")',
                '       .where("age > 18")',
                '       .where("active = 1")',
                '       .limit(10)',
                '       .build())',
                'print(sql)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'What self really is',
              prose:
                '`self` is not magic — it is just the first positional argument to every instance method, ' +
                'and Python fills it in automatically when you call the method on an instance. ' +
                'The two calls below are **identical** in behavior. Python translates the first form into the second internally.',
              code: [
                'class Dog:',
                '    def __init__(self, name):',
                '        self.name = name',
                '',
                '    def bark(self):',
                '        print(f"{self.name} says: Woof!")',
                '',
                '    def greet(self, other_dog):',
                '        print(f"{self.name} greets {other_dog.name}!")',
                '',
                'rex = Dog("Rex")',
                'bella = Dog("Bella")',
                '',
                '# These two lines are IDENTICAL:',
                'rex.bark()          # standard way — Python sets self = rex',
                'Dog.bark(rex)       # explicit way — you pass self manually',
                '',
                'rex.greet(bella)    # self = rex, other_dog = bella',
                'Dog.greet(rex, bella)  # identical',
                '',
                '# A function in a class becomes a "bound method" when accessed via an instance',
                'print(type(Dog.bark))   # <class "function">',
                'print(type(rex.bark))   # <class "method"> — bound to rex',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Methods calling other methods via self',
              prose:
                'Methods can call other methods on the same object using `self.method_name()`. ' +
                'This lets you build complex behaviour from simple building blocks. ' +
                '`circumference()` calls `self.diameter()` rather than duplicating the formula — ' +
                'if you later change `diameter()`, circumference automatically uses the new version.',
              code: [
                'class Circle:',
                '    PI = 3.141592653589793',
                '',
                '    def __init__(self, radius):',
                '        if radius <= 0:',
                '            raise ValueError("Radius must be positive")',
                '        self.radius = radius',
                '',
                '    def diameter(self):',
                '        return 2 * self.radius',
                '',
                '    def area(self):',
                '        return Circle.PI * self.radius ** 2',
                '',
                '    def circumference(self):',
                '        # calls self.diameter() rather than duplicating 2 * radius',
                '        return Circle.PI * self.diameter()',
                '',
                '    def is_larger_than(self, other):',
                '        return self.area() > other.area()',
                '',
                'c1 = Circle(5)',
                'c2 = Circle(3)',
                'print(f"Area: {c1.area():.2f}")',
                'print(f"Circumference: {c1.circumference():.2f}")',
                'print(f"c1 larger than c2? {c1.is_larger_than(c2)}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: '__str__ and __repr__ — controlling display',
              prose:
                '`__repr__` is the **developer** representation — unambiguous, ideally eval-able back to the object. ' +
                '`__str__` is the **user** representation — readable and pretty. ' +
                '`print(obj)` uses `__str__`. `repr(obj)` and the interactive console use `__repr__`. ' +
                'Inside an f-string, `{obj}` calls `__str__` and `{obj!r}` calls `__repr__`.',
              code: [
                'class Point:',
                '    def __init__(self, x, y):',
                '        self.x = x',
                '        self.y = y',
                '',
                '    def __repr__(self):',
                '        """Developer representation — shows how to reconstruct the object."""',
                '        return f"Point({self.x!r}, {self.y!r})"',
                '',
                '    def __str__(self):',
                '        """User-friendly representation."""',
                '        return f"({self.x}, {self.y})"',
                '',
                'p = Point(3, 4)',
                'print(str(p))    # (3, 4)       — __str__',
                'print(repr(p))   # Point(3, 4)  — __repr__',
                'print(p)         # (3, 4)        — print() uses __str__',
                '',
                '# In a list, repr() is used for each element',
                'points = [Point(1, 2), Point(3, 4)]',
                'print(points)    # [Point(1, 2), Point(3, 4)] — __repr__',
                '',
                'print(f"Location: {p}")    # Location: (3, 4)    — __str__',
                'print(f"Debug: {p!r}")     # Debug: Point(3, 4)  — __repr__',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'A richer example — Book with __format__',
              prose:
                '`__format__` lets you define custom behaviour for format specifiers inside f-strings: `f"{book:short}"`. ' +
                'This is the same mechanism Python uses for numbers (`f"{3.14:.2f}"`) — your class can participate in the same protocol. ' +
                'If only `__repr__` is defined (no `__str__`), then `str(obj)` falls back to `__repr__`.',
              code: [
                'class Book:',
                '    def __init__(self, title, author, year):',
                '        self.title = title',
                '        self.author = author',
                '        self.year = year',
                '',
                '    def __repr__(self):',
                '        return f"Book({self.title!r}, {self.author!r}, {self.year!r})"',
                '',
                '    def __str__(self):',
                '        return f\'"{self.title}" by {self.author} ({self.year})\'',
                '',
                '    def __format__(self, spec):',
                '        if spec == "short":',
                '            return f\'"{self.title}"\'',
                '        if spec == "author":',
                '            return self.author',
                '        return str(self)',
                '',
                'book = Book("Clean Code", "Robert Martin", 2008)',
                'print(book)                     # "Clean Code" by Robert Martin (2008)',
                'print(repr(book))               # Book("Clean Code", "Robert Martin", 2008)',
                'print(f"Reading: {book}")',
                'print(f"Short:  {book:short}")',
                'print(f"Author: {book:author}")',
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
      text: 'What does Python do with `rex.bark()` internally?',
      options: [
        'It looks up `bark` on the instance and calls it with no arguments',
        'It translates the call to `Dog.bark(rex)`, passing the instance as `self`',
        'It copies the method into the instance before calling it',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'What must a method return to enable method chaining?',
      options: [
        'The result of the operation (e.g. the computed value)',
        '`None` — chaining works automatically',
        '`self` — so the caller gets the object back and can call another method',
      ],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'Which dunder method is called by `print(obj)`?',
      options: ['`__repr__`', '`__str__`', '`__print__`'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'You define a class with only `__repr__` and no `__str__`. What happens when you call `str(obj)`?',
      options: [
        'Python raises AttributeError — `__str__` is required',
        'Python returns the raw memory address string',
        'Python falls back to `__repr__` — it is used as `__str__` when `__str__` is absent',
      ],
      correct: 2,
    },
  ],

  mentalModel: [
    '`self` is the instance that called the method — Python passes it automatically.',
    '`obj.method()` and `ClassName.method(obj)` are identical.',
    'Mutable methods modify `self` in place; immutable methods return a new object.',
    'Method chaining requires returning `self` from each intermediate method.',
    '`__repr__` is for developers (unambiguous); `__str__` is for users (readable).',
    'If only `__repr__` exists, `str(obj)` falls back to it.',
  ],

  checkpoints: ['read-intuition'],
}

export default {
  id: 'py-4-1-oop-intro',
  slug: 'oop-intro',
  chapter: 4.1,
  order: 1,
  title: 'Classes and Objects',
  subtitle: 'The blueprint model that powers modern Python',
  tags: ['OOP', 'class', 'object', 'instance', '__init__', 'instance variables', 'class variables'],

  hook: {
    question: 'Why do professional Python programs use classes instead of just functions and variables?',
    realWorldContext:
      'Every piece of software you interact with — a bank app, a video game, a web server — is built around ' +
      'objects: accounts, players, requests. Object-Oriented Programming (OOP) is the discipline of modelling ' +
      'your program as a collection of objects that have data and behavior. Python was designed with OOP at its ' +
      'core. Once you understand classes, you unlock the way that the entire standard library and every major ' +
      'framework is structured — from Django web apps to PyTorch neural networks.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'A **class** is a blueprint. It describes what data an object will hold and what actions it can perform. ' +
      'An **object** (also called an **instance**) is a specific thing built from that blueprint. ' +
      'You might have a single `Dog` class, but hundreds of individual Dog objects — each with its own name and age.',

      'The analogy is a cookie cutter vs. cookies. The cutter (class) defines the shape. Each cookie (object) is ' +
      'an independent thing you can decorate differently. Changing one cookie does not affect the others.',

      'The `__init__` method is the **constructor** — it runs automatically when you create a new object. ' +
      'You use it to set the initial state of every instance. The first parameter, **`self`**, refers to the ' +
      'specific object being created. You attach data to the object by writing `self.attribute = value`.',

      '**Instance variables** are unique to each object. **Class variables** are shared by all instances of ' +
      'the class. Mixing them up is one of the most common bugs in beginner OOP code.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'OOP is a mental model, not just syntax',
        body: 'Before writing a single line of class code, ask: "what things does my program work with, and what does each thing know and do?" Identify the nouns (objects) and verbs (methods). That mental model IS the design.',
      },
      {
        type: 'warning',
        title: 'Mutable class variables are a classic bug',
        body: 'If you define a list or dict as a class variable, ALL instances share that same list. Modifying it through one instance modifies it for every instance. Always put mutable data inside `__init__` as an instance variable.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'OOP 4.1 — Classes and Objects',
        mathBridge: 'Run each cell in order. Read the prose before running — predict the output first.',
        caption: 'Build your mental model of classes, instances, and the __init__ constructor.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Your first class',
              prose:
                'The `class` keyword defines a class. By convention class names use **PascalCase** (each word capitalised). ' +
                'The `pass` keyword is a placeholder — it means "nothing here yet". ' +
                'To create an object you "call" the class like a function. Each call produces an independent object.',
              code: [
                'class Dog:',
                '    """A simple class representing a Dog."""',
                '    pass  # body is empty for now',
                '',
                'my_dog = Dog()        # creates one Dog object',
                'your_dog = Dog()      # creates a DIFFERENT Dog object',
                '',
                'print(type(my_dog))           # <class "__main__.Dog">',
                'print(isinstance(my_dog, Dog)) # True',
                'print(my_dog is your_dog)      # False — different objects in memory',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Variables hold references, not objects',
              prose:
                'A Python variable does not contain an object — it holds a **reference** (pointer) to an object in memory. ' +
                'When you write `dog_b = dog_a`, both names point to the **same object**. ' +
                'Changing the object through one name is visible through the other. ' +
                'Use `copy.copy()` to create a truly independent copy.',
              code: [
                'class Dog:',
                '    pass',
                '',
                'dog_a = Dog()',
                'dog_a.name = "Buddy"',
                '',
                'dog_b = dog_a          # dog_b points to the SAME object!',
                'dog_b.name = "Max"',
                '',
                'print(dog_a.name)      # "Max" — same object!',
                'print(dog_a is dog_b)  # True',
                '',
                'import copy',
                'dog_c = copy.copy(dog_a)   # independent copy',
                'dog_c.name = "Charlie"',
                'print(dog_a.name)          # "Max" — unaffected',
                'print(dog_a is dog_c)      # False',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'The __init__ constructor',
              prose:
                '`__init__` is called automatically when you create a new object. ' +
                'The **double underscores** (called "dunders") signal that this is a special Python method. ' +
                '`self` always refers to the object being initialised. ' +
                '`self.name = name` stores the value as an **instance variable** — data that belongs to this specific object.',
              code: [
                'class Dog:',
                '    """A well-defined Dog class with proper initialisation."""',
                '',
                '    def __init__(self, name, breed, age):',
                '        self.name = name    # instance variable',
                '        self.breed = breed  # instance variable',
                '        self.age = age      # instance variable',
                '',
                'rex = Dog("Rex", "German Shepherd", 3)',
                'bella = Dog("Bella", "Golden Retriever", 5)',
                '',
                'print(rex.name)    # Rex',
                'print(bella.name)  # Bella',
                'print(rex.age)     # 3   — each object has its own data',
                'print(bella.age)   # 5',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Default parameters and validation in __init__',
              prose:
                'Just like regular functions, `__init__` can have **default parameter values**, making arguments optional. ' +
                'You can also **validate** data inside `__init__` before storing it — this guarantees your objects are always in a valid state. ' +
                'If the data is bad, raise a `ValueError` immediately rather than letting bad data corrupt the object silently later.',
              code: [
                'class BankAccount:',
                '    def __init__(self, owner, balance=0.0):',
                '        if not isinstance(owner, str) or not owner.strip():',
                '            raise ValueError("Owner must be a non-empty string")',
                '        if balance < 0:',
                '            raise ValueError(f"Balance cannot be negative: {balance}")',
                '        self.owner = owner.strip()    # strip whitespace',
                '        self.balance = float(balance)  # always store as float',
                '        self.transactions = []          # start with empty history',
                '',
                'account = BankAccount("Alice", 1000)',
                'print(account.balance)   # 1000.0',
                'print(account.owner)     # Alice',
                '',
                'try:',
                '    bad = BankAccount("Bob", -500)',
                'except ValueError as e:',
                '    print(f"Error: {e}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Class variables vs instance variables',
              prose:
                'An **instance variable** is defined inside `__init__` with `self.x = ...`. Each object gets its own copy. ' +
                'A **class variable** is defined inside the class but outside any method. It is **shared** by all instances. ' +
                'Class variables are perfect for data that is the same for every instance — like a species name or a count of objects created.',
              code: [
                'class Dog:',
                '    # CLASS VARIABLE — shared by ALL Dog instances',
                '    species = "Canis lupus familiaris"',
                '    dog_count = 0',
                '',
                '    def __init__(self, name, age):',
                '        self.name = name    # INSTANCE variable',
                '        self.age = age      # INSTANCE variable',
                '        Dog.dog_count += 1  # increment the shared counter',
                '',
                'rex = Dog("Rex", 3)',
                'bella = Dog("Bella", 5)',
                'max_dog = Dog("Max", 2)',
                '',
                'print(rex.species)     # Canis lupus familiaris (from class)',
                'print(Dog.species)     # Same — accessed directly on the class',
                'print(Dog.dog_count)   # 3 — we created 3 dogs',
                'print(rex.dog_count)   # 3 — same value via instance',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'The mutable class variable bug',
              prose:
                'If you assign `self.class_variable = value`, Python creates a **new instance variable** that shadows the class variable. ' +
                'The class variable is untouched — other instances are not affected. ' +
                'But if you **mutate** a mutable class variable (like a list) via `.append()`, you modify the shared object directly. ' +
                'All instances see the change. This is one of the most common bugs in early OOP code.',
              code: [
                '# BAD: grades is a class variable (shared list!)',
                'class BadStudent:',
                '    grades = []  # shared by ALL instances',
                '',
                '    def __init__(self, name):',
                '        self.name = name',
                '',
                '    def add_grade(self, grade):',
                '        self.grades.append(grade)  # modifies the SHARED list!',
                '',
                's1 = BadStudent("Alice")',
                's2 = BadStudent("Bob")',
                's1.add_grade(95)',
                's2.add_grade(80)',
                'print(s1.grades)  # [95, 80] — bug! Bob\'s grade is in Alice\'s list',
                'print(s2.grades)  # [95, 80] — same list!',
                '',
                '# GOOD: each instance gets its own list',
                'class GoodStudent:',
                '    def __init__(self, name):',
                '        self.name = name',
                '        self.grades = []  # instance variable — each student gets their own',
                '',
                '    def add_grade(self, grade):',
                '        self.grades.append(grade)',
                '',
                's1 = GoodStudent("Alice")',
                's2 = GoodStudent("Bob")',
                's1.add_grade(95)',
                's2.add_grade(80)',
                'print(s1.grades)  # [95]',
                'print(s2.grades)  # [80]',
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
      text: 'What is the difference between a class and an object?',
      options: [
        'They are the same thing — "class" and "object" are synonyms in Python',
        'A class is the blueprint; an object is a specific instance built from it',
        'A class stores data; an object stores code',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'When is `__init__` called?',
      options: [
        'You must call it manually after creating an object',
        'Only when you explicitly write `__init__()`',
        'Automatically when you create a new instance with `ClassName()`',
      ],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'What happens when you write `dog_b = dog_a` (where `dog_a` is a Dog object)?',
      options: [
        '`dog_b` becomes an independent copy of `dog_a`',
        '`dog_b` points to the same object as `dog_a` — they are the same thing in memory',
        'Python raises a TypeError because objects cannot be assigned to variables',
      ],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'A class defines `grades = []` at the class level. Two instances both call `.append()` on it. How many items does each instance see?',
      options: [
        'Each instance sees only the items it appended — they have independent lists',
        'Both instances see all appended items — they share the same list',
        'Python raises an AttributeError — you cannot append to a class variable',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'A class is a blueprint; an object (instance) is a thing built from that blueprint.',
    'Variables hold references — two variables can point to the same object.',
    '`__init__` runs automatically on creation; use it to set initial state with `self.attr = value`.',
    'Instance variables (defined via `self.x`) are unique to each object.',
    'Class variables (defined at class level) are shared by all instances.',
    'Never use a mutable object (list, dict) as a class variable — put it in `__init__` instead.',
  ],

  checkpoints: ['read-intuition'],
}

export default {
  id: 'py-4-3-inheritance',
  slug: 'oop-inheritance',
  chapter: 4.1,
  order: 3,
  title: 'Inheritance and super()',
  subtitle: 'Building specialised classes from general ones',
  tags: ['inheritance', 'super()', 'override', 'subclass', 'MRO', 'multiple inheritance', 'isinstance'],

  hook: {
    question: 'How do you add a new type of thing to your program without rewriting everything from scratch?',
    realWorldContext:
      'Every real codebase grows. You start with a general `User` class, then need `AdminUser`, `PremiumUser`, `GuestUser`. ' +
      'Without inheritance you copy-paste the common code and watch bugs diverge across copies. ' +
      'Inheritance solves this: a `GuideDog` IS-A `Dog` IS-AN `Animal`. It inherits everything the parent knows, ' +
      'and you only write what is different. `super()` is the bridge — it calls the parent\'s version of a method ' +
      'so you can extend rather than replace behaviour. Python also supports inheriting from multiple parents, ' +
      'resolved with a deterministic Method Resolution Order (MRO).',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Inheritance models the **IS-A** relationship. A `Dog` is an `Animal`. A `GuideDog` is a `Dog`. ' +
      'The child class (subclass) automatically has every method and attribute of the parent class (superclass), ' +
      'and you only define what is new or different.',

      '`super()` returns a proxy that delegates method calls to the **parent class** in the Method Resolution Order. ' +
      'Calling `super().__init__(...)` in a child\'s `__init__` ensures the parent initialises its own attributes first. ' +
      'Without that call, the child\'s object would be missing the parent\'s instance variables.',

      '**Method overriding** lets a child redefine a method inherited from the parent. ' +
      'You can call `super().method()` inside the override to get the parent\'s behaviour and then add to it — ' +
      'rather than replacing it entirely.',

      '**Multiple inheritance** lets a class inherit from more than one parent. Python resolves method conflicts ' +
      'with the **C3 linearisation algorithm** (MRO). You can inspect the resolution order with `ClassName.__mro__`. ' +
      'When every class in the hierarchy calls `super()`, the MRO ensures each class in the chain runs exactly once.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Always call super().__init__() in child classes',
        body: 'If you override `__init__` in a child class and forget `super().__init__(...)`, the parent\'s instance variables never get set up. Your object will be missing attributes and you\'ll get confusing AttributeErrors.',
      },
      {
        type: 'insight',
        title: 'Use cls() not the class name in class methods',
        body: 'When writing factory class methods, use `cls(...)` rather than `ParentClass(...)`. This means subclasses that inherit the method will produce the right type, not the parent type.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'OOP 4.3 — Inheritance and super()',
        mathBridge: 'Run each cell. Trace through the inheritance chain manually before running.',
        caption: 'Build hierarchies of classes and learn how super() threads the chain together.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Basic inheritance — Animal hierarchy',
              prose:
                'Syntax: `class Child(Parent):`. The child inherits ALL methods and attributes from the parent. ' +
                'In `__init__`, call `super().__init__(...)` to run the parent\'s initialiser before adding child-specific attributes. ' +
                'Both `Dog` and `Cat` inherit `breathe()`, `eat()`, and `sleep()` from `Animal` without rewriting them.',
              code: [
                'class Animal:',
                '    """Base class for all animals."""',
                '',
                '    def __init__(self, name, species, age):',
                '        self.name = name',
                '        self.species = species',
                '        self.age = age',
                '',
                '    def breathe(self):',
                '        print(f"{self.name} breathes...")',
                '',
                '    def eat(self, food):',
                '        print(f"{self.name} eats {food}.")',
                '',
                '    def describe(self):',
                '        print(f"{self.name} is a {self.species}, age {self.age}.")',
                '',
                '',
                'class Dog(Animal):',
                '    def __init__(self, name, breed, age):',
                '        super().__init__(name, species="Dog", age=age)  # parent init first!',
                '        self.breed = breed   # dog-specific attribute',
                '        self.tricks = []',
                '',
                '    def bark(self):',
                '        print(f"{self.name} says: Woof!")',
                '',
                '    def learn_trick(self, trick):',
                '        self.tricks.append(trick)',
                '        print(f"{self.name} learned: {trick}!")',
                '',
                'rex = Dog("Rex", "German Shepherd", 3)',
                'rex.breathe()       # inherited from Animal',
                'rex.eat("kibble")   # inherited from Animal',
                'rex.bark()          # Dog-specific',
                'rex.learn_trick("sit")',
                'rex.describe()      # inherited',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'Method overriding — extending parent behaviour',
              prose:
                'When a child class defines a method with the same name as the parent\'s, the child\'s version **overrides** it. ' +
                'Inside the override, call `super().method()` to first run the parent\'s version, then add child-specific output. ' +
                'The parent\'s `describe()` prints the general info; the Dog\'s `describe()` adds breed and tricks.',
              code: [
                'class Animal:',
                '    def __init__(self, name, species, age):',
                '        self.name = name',
                '        self.species = species',
                '        self.age = age',
                '',
                '    def describe(self):',
                '        print(f"{self.name} is a {self.species}, age {self.age}.")',
                '',
                '',
                'class Dog(Animal):',
                '    def __init__(self, name, breed, age):',
                '        super().__init__(name, "Dog", age)',
                '        self.breed = breed',
                '        self.tricks = []',
                '',
                '    def describe(self):',
                '        super().describe()   # run Animal.describe() first',
                '        print(f"  Breed: {self.breed}")',
                '        print(f"  Tricks: {len(self.tricks)} learned")',
                '',
                'rex = Dog("Rex", "German Shepherd", 3)',
                'rex.tricks = ["sit", "shake", "roll over"]',
                'rex.describe()',
                '# Rex is a Dog, age 3.',
                '# Breed: German Shepherd',
                '# Tricks: 3 learned',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'isinstance() and issubclass()',
              prose:
                '`isinstance(obj, Class)` checks if an object is an instance of a class **or any of its subclasses**. ' +
                'This is why `isinstance(rex, Animal)` is True even though `rex` is a `Dog`. ' +
                '`issubclass(Child, Parent)` checks the class relationship itself. ' +
                'Every Python class ultimately inherits from `object`.',
              code: [
                'class Animal:',
                '    pass',
                '',
                'class Dog(Animal):',
                '    pass',
                '',
                'class Cat(Animal):',
                '    pass',
                '',
                'rex = Dog()',
                '',
                'print(isinstance(rex, Dog))     # True',
                'print(isinstance(rex, Animal))  # True — Dog IS-A Animal',
                'print(isinstance(rex, Cat))     # False',
                '',
                'print(issubclass(Dog, Animal))  # True',
                'print(issubclass(Cat, Animal))  # True',
                'print(issubclass(Dog, Cat))     # False — no relationship',
                '',
                '# All Python classes ultimately inherit from object',
                'print(issubclass(Dog, object))  # True',
                'print(isinstance(rex, object))  # True',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'Multi-level inheritance — GuideDog chain',
              prose:
                'A subclass can itself be subclassed. `GuideDog` extends `Dog` which extends `Animal`. ' +
                'The full chain is `GuideDog → Dog → Animal → object`. ' +
                'Each `super()` call follows this chain upward. ' +
                '`GuideDog.bark()` checks work status before deciding whether to call `super().bark()` (which is `Dog.bark()`).',
              code: [
                'class Animal:',
                '    def __init__(self, name, species, age):',
                '        self.name = name',
                '        self.species = species',
                '        self.age = age',
                '',
                'class Dog(Animal):',
                '    def __init__(self, name, breed, age):',
                '        super().__init__(name, "Dog", age)',
                '        self.breed = breed',
                '        self.tricks = []',
                '',
                '    def bark(self):',
                '        print(f"{self.name} says: Woof!")',
                '',
                '',
                'class GuideDog(Dog):',
                '    def __init__(self, name, breed, age, handler):',
                '        super().__init__(name, breed, age)  # calls Dog.__init__',
                '        self.handler = handler',
                '        self.is_working = False',
                '',
                '    def start_work(self):',
                '        self.is_working = True',
                '        print(f"{self.name} is now guiding {self.handler}.")',
                '',
                '    def bark(self):',
                '        if self.is_working:',
                '            print(f"{self.name} is working — no barking!")',
                '        else:',
                '            super().bark()  # delegate to Dog.bark when off duty',
                '',
                'buddy = GuideDog("Buddy", "Labrador", 4, "John")',
                'buddy.start_work()',
                'buddy.bark()       # suppressed',
                'buddy.is_working = False',
                'buddy.bark()       # normal Woof!',
                'print(GuideDog.__mro__)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 5,
              cellTitle: 'Multiple inheritance — Duck inherits from two classes',
              prose:
                'Python allows inheriting from multiple parents: `class Duck(Flyable, Swimmable)`. ' +
                'The child gets all methods from all parents. The **MRO** (Method Resolution Order) determines ' +
                'which version of a method is used when there is a name conflict — left-to-right among listed parents.',
              code: [
                'class Flyable:',
                '    def fly(self):',
                '        print(f"{self.name} is flying!")',
                '',
                '    def land(self):',
                '        print(f"{self.name} lands.")',
                '',
                '',
                'class Swimmable:',
                '    def swim(self):',
                '        print(f"{self.name} is swimming!")',
                '',
                '    def dive(self, depth):',
                '        print(f"{self.name} dives to {depth}m.")',
                '',
                '',
                'class Duck(Flyable, Swimmable):',
                '    def __init__(self, name):',
                '        self.name = name',
                '',
                '    def quack(self):',
                '        print(f"{self.name} says: Quack!")',
                '',
                'donald = Duck("Donald")',
                'donald.quack()      # Duck-specific',
                'donald.fly()        # from Flyable',
                'donald.swim()       # from Swimmable',
                'donald.dive(2)      # from Swimmable',
                'donald.land()       # from Flyable',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 6,
              cellTitle: 'MRO and cooperative super() with multiple inheritance',
              prose:
                'Python uses the **C3 linearisation** algorithm to build a consistent method search order. ' +
                'Each `super()` call goes to the **next class in the MRO**, not necessarily the direct parent. ' +
                'When every class calls `super()` cooperatively, the full chain executes exactly once per class, ' +
                'in MRO order — solving the classic "diamond problem" of multiple inheritance.',
              code: [
                'class Vehicle:',
                '    def start(self):',
                '        print("Vehicle: starting engine...")',
                '',
                'class Car(Vehicle):',
                '    def start(self):',
                '        print("Car: turning key...")',
                '        super().start()',
                '',
                'class ElectricMixin:',
                '    def start(self):',
                '        print("Electric: powering up battery...")',
                '        super().start()',
                '',
                'class ElectricCar(ElectricMixin, Car):',
                '    def start(self):',
                '        print("ElectricCar: initiating startup...")',
                '        super().start()',
                '',
                'tesla = ElectricCar()',
                'print("MRO:", [c.__name__ for c in ElectricCar.__mro__])',
                'tesla.start()',
                '# ElectricCar -> ElectricMixin -> Car -> Vehicle',
                '# Each class in the MRO runs exactly once',
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
      text: 'Why must a child class call `super().__init__(...)` in its own `__init__`?',
      options: [
        'To avoid a SyntaxError — Python requires it',
        'To ensure the parent\'s instance variables get set up; without it they are missing',
        'It is optional — the parent\'s __init__ runs automatically',
      ],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: '`rex` is a `Dog` which inherits from `Animal`. What does `isinstance(rex, Animal)` return?',
      options: ['False — rex is a Dog, not directly an Animal', 'True — inheritance makes rex an instance of Animal too', 'It raises TypeError'],
      correct: 1,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'A child class defines the same method as its parent. When you call that method on a child instance, which version runs?',
      options: [
        'The parent\'s version — children cannot override parent methods',
        'Both run simultaneously',
        'The child\'s version — it overrides the parent\'s',
      ],
      correct: 2,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'Given `class D(B, C)`, when a method is not found on `D`, where does Python look next according to the MRO?',
      options: ['`C` first, then `B`', '`B` first — left-to-right in the parent list', 'Both `B` and `C` simultaneously'],
      correct: 1,
    },
  ],

  mentalModel: [
    'Inheritance models IS-A: a Dog is an Animal.',
    'Child classes inherit all parent methods and attributes automatically.',
    'Always call `super().__init__(...)` in a child\'s `__init__` to initialise the parent\'s attributes.',
    'Method overriding replaces a parent method; call `super().method()` to extend rather than replace.',
    '`isinstance(obj, Parent)` is True for any class in the inheritance chain, not just the direct class.',
    'The MRO (C3 linearisation) defines the search order for methods across multiple parents.',
  ],

  checkpoints: ['read-intuition'],
}

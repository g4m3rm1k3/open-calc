export default {
  id: 'py-4-8-metaclasses',
  slug: 'oop-metaclasses',
  chapter: 4.8,
  order: 8,
  title: 'Metaclasses',
  subtitle: 'Classes that control how other classes are created',
  tags: ['metaclass', 'type', '__new__', '__call__', 'singleton', 'class registry', 'interface enforcement'],

  hook: {
    question: 'If a class is an instance of `type`, can you customise the process of creating a class itself?',
    realWorldContext:
      'Everything in Python is an object — including classes. ' +
      'A class is an instance of its **metaclass**, and the default metaclass is `type`. ' +
      'When Python reads `class Dog: ...`, it calls `type("Dog", (object,), {...})` behind the scenes. ' +
      'By replacing `type` with your own metaclass, you intercept that creation process. ' +
      'Django\'s ORM uses metaclasses to turn plain class attributes (`name = CharField()`) into a full model definition. ' +
      'The Singleton pattern, plugin registries, and interface enforcement at class-definition time ' +
      'are all implemented with metaclasses. ' +
      'You will rarely write metaclasses in daily code — but understanding them explains ' +
      'how frameworks do their apparent magic.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Every object has a type. Every class is also an object, so every class has a type too. ' +
      '`type(Dog)` returns `<class "type">`. `type` is the metaclass of almost every class in Python. ' +
      'You can call `type(name, bases, dict)` directly to create a class at runtime — ' +
      'that is what Python does when it processes a `class` statement.',

      'To write a custom metaclass, subclass `type`. Override `__new__` to intercept class **creation** ' +
      '(this is where you can inspect or modify the class body before the class object exists), ' +
      'or override `__call__` to intercept **instantiation** (every time someone calls `ClassName(...)`). ' +
      'Apply a metaclass with `class MyClass(metaclass=MyMeta):` syntax.',

      'The **Singleton pattern** via metaclass: override `__call__` to check a registry. ' +
      'If the class has been instantiated before, return the existing instance instead of creating a new one. ' +
      'The calling code is completely unaware — it uses normal constructor syntax.',

      'The **class registry pattern**: override `__new__` so that whenever a subclass is defined, ' +
      'its name is automatically added to a registry dict. ' +
      'Plugin systems use this to discover all available plugins without any manual registration.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Prefer simpler alternatives before reaching for metaclasses',
        body: 'Class decorators, `__init_subclass__`, and `ABC` solve most of the same problems with less complexity. Use a metaclass when you genuinely need to intercept the class-creation process itself — not just to add behaviour to instances.',
      },
      {
        type: 'insight',
        title: '__init_subclass__ is the modern lighter alternative',
        body: 'Python 3.6 added `__init_subclass__` — a hook on the *base class* that fires whenever a subclass is defined. For simple auto-registration or validation, it is cleaner and easier to understand than a full metaclass.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'OOP 4.8 — Metaclasses',
        mathBridge: 'Run cells in order. Pay attention to WHEN each hook fires — at class definition or at instantiation.',
        caption: 'Understand type(), build a Singleton metaclass, enforce interfaces at class-definition time, and auto-register plugins.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'type() — creating classes at runtime',
              prose:
                '`type(name, bases, dict)` creates a class object. This is exactly what Python does when it processes ' +
                'a `class` statement. Every class is an instance of `type` unless a custom metaclass is specified. ' +
                '`type(Dog)` returns `<class "type">`. `isinstance(Dog, type)` is `True`.',
              code: [
                '# type(name, bases, namespace_dict) creates a class at runtime',
                'MyClass = type("MyClass", (object,), {',
                '    "x": 42,',
                '    "greet": lambda self: f"Hello from {self.__class__.__name__}"',
                '})',
                '',
                'obj = MyClass()',
                'print(obj.x)         # 42',
                'print(obj.greet())   # Hello from MyClass',
                '',
                '# Every class is an instance of type',
                'print(type(MyClass))          # <class "type">',
                'print(type(int))              # <class "type">',
                'print(isinstance(MyClass, type))  # True',
                '',
                '# The class statement is syntactic sugar for type()',
                'class Dog:',
                '    species = "Canis lupus"',
                '',
                '# Equivalent to:',
                'Dog2 = type("Dog2", (object,), {"species": "Canis lupus"})',
                '',
                'print(Dog.species == Dog2.species)   # True',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 2,
              cellTitle: 'SingletonMeta — one instance per class',
              prose:
                'Override `__call__` on the metaclass to intercept instantiation. ' +
                '`__call__` fires every time you write `ClassName(...)`. ' +
                'The registry lives on the metaclass itself (`cls._instances`), not on the class. ' +
                'From the caller\'s perspective nothing changes — normal constructor syntax returns the same object every time.',
              code: [
                'class SingletonMeta(type):',
                '    """Any class with metaclass=SingletonMeta can only have ONE instance."""',
                '    _instances = {}',
                '',
                '    def __call__(cls, *args, **kwargs):',
                '        """Intercepts ClassName(...) calls."""',
                '        if cls not in cls._instances:',
                '            cls._instances[cls] = super().__call__(*args, **kwargs)',
                '        return cls._instances[cls]',
                '',
                '',
                'class AppConfig(metaclass=SingletonMeta):',
                '    def __init__(self):',
                '        self.debug = False',
                '        self.database_url = "sqlite:///app.db"',
                '        self.secret_key = "change-me"',
                '',
                '',
                'config1 = AppConfig()',
                'config2 = AppConfig()',
                '',
                'print(config1 is config2)   # True — same object',
                'config1.debug = True',
                'print(config2.debug)        # True — same object!',
                '',
                '# Each class using SingletonMeta gets its own singleton',
                'class DatabasePool(metaclass=SingletonMeta):',
                '    def __init__(self):',
                '        self.connections = []',
                '',
                'db1 = DatabasePool()',
                'db2 = DatabasePool()',
                'print(db1 is db2)           # True',
                'print(config1 is db1)       # False — different classes, different singletons',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 3,
              cellTitle: 'InterfaceEnforcerMeta — catch missing methods at class definition',
              prose:
                'Override `__new__` on the metaclass to intercept class **creation**. ' +
                'This runs when Python processes the `class` statement — before any instance is created. ' +
                'If a required method is missing, raise `TypeError` immediately. ' +
                'This catches the bug at *definition time*, not at runtime when the method is called.',
              code: [
                'class InterfaceEnforcerMeta(type):',
                '    def __new__(mcs, name, bases, namespace):',
                '        cls = super().__new__(mcs, name, bases, namespace)',
                '        if bases:  # only check subclasses, not the base class itself',
                '            required = getattr(cls, "REQUIRED_METHODS", [])',
                '            missing = [m for m in required if m not in namespace]',
                '            if missing:',
                '                raise TypeError(f"Class \'{name}\' must implement: {missing}")',
                '        return cls',
                '',
                '',
                'class Plugin(metaclass=InterfaceEnforcerMeta):',
                '    REQUIRED_METHODS = ["setup", "execute", "teardown"]',
                '',
                '',
                '# Missing execute and teardown — fails AT DEFINITION TIME',
                'try:',
                '    class IncompletePlugin(Plugin):',
                '        def setup(self): pass',
                'except TypeError as e:',
                '    print(f"Caught at class definition: {e}")',
                '',
                '',
                '# Complete — succeeds',
                'class CompletePlugin(Plugin):',
                '    def setup(self):    print("Setting up...")',
                '    def execute(self):  print("Executing...")',
                '    def teardown(self): print("Tearing down...")',
                '',
                'p = CompletePlugin()',
                'p.setup()',
                'p.execute()',
                'p.teardown()',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },
            {
              id: 4,
              cellTitle: 'PluginRegistry — auto-register subclasses',
              prose:
                'Use `__new__` to automatically record each subclass in a central registry. ' +
                'Any class that sets `plugin_name` gets registered immediately when its class body is processed. ' +
                'The plugin system can then look up and instantiate any plugin by name — ' +
                'new plugins register themselves just by being defined, no manual registration needed.',
              code: [
                'class PluginRegistry(type):',
                '    registry = {}',
                '',
                '    def __new__(mcs, name, bases, namespace):',
                '        cls = super().__new__(mcs, name, bases, namespace)',
                '        if "plugin_name" in namespace:',
                '            plugin_name = namespace["plugin_name"]',
                '            mcs.registry[plugin_name] = cls',
                '            print(f"Auto-registered: \'{plugin_name}\' → {name}")',
                '        return cls',
                '',
                '',
                'class BasePlugin(metaclass=PluginRegistry):',
                '    pass',
                '',
                '',
                '# Each class self-registers just by being defined',
                'class AudioPlugin(BasePlugin):',
                '    plugin_name = "audio"',
                '    def run(self): return "Processing audio..."',
                '',
                'class VideoPlugin(BasePlugin):',
                '    plugin_name = "video"',
                '    def run(self): return "Processing video..."',
                '',
                'class ImagePlugin(BasePlugin):',
                '    plugin_name = "image"',
                '    def run(self): return "Processing image..."',
                '',
                '',
                'print("\\n=== Plugin Registry ===")',
                'for name, cls in PluginRegistry.registry.items():',
                '    plugin = cls()',
                '    print(f"  {name}: {plugin.run()}")',
                '',
                '# Add a new plugin — instantly available in the registry',
                'class PDFPlugin(BasePlugin):',
                '    plugin_name = "pdf"',
                '    def run(self): return "Generating PDF..."',
                '',
                'pdf = PluginRegistry.registry["pdf"]()',
                'print(pdf.run())',
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
      text: 'What is the default metaclass of every Python class?',
      options: ['`object`', '`type`', '`class`'],
      correct: 1,
    },
    {
      id: 'q2',
      type: 'choice',
      text: 'In a metaclass, which method do you override to intercept `ClassName(...)` — instantiation?',
      options: ['`__new__`', '`__init__`', '`__call__`'],
      correct: 2,
    },
    {
      id: 'q3',
      type: 'choice',
      text: 'In a metaclass, which method fires when the `class` statement itself is processed?',
      options: ['`__call__`', '`__new__`', '`__init__`'],
      correct: 1,
    },
    {
      id: 'q4',
      type: 'choice',
      text: 'What simpler alternative to a metaclass was added in Python 3.6 for reacting to subclass creation?',
      options: ['`@classmethod` on the base class', '`__init_subclass__` hook on the base class', '`@staticmethod` on the metaclass'],
      correct: 1,
    },
  ],

  mentalModel: [
    'A class is an object — it is an instance of its metaclass. The default metaclass is `type`.',
    '`type(name, bases, dict)` creates a class at runtime — this is what the `class` statement does.',
    'Override `__call__` on a metaclass to intercept instantiation (`ClassName(...)`).',
    'Override `__new__` on a metaclass to intercept class creation (the `class` statement itself).',
    'Prefer `__init_subclass__` or class decorators over metaclasses for simpler use cases.',
  ],

  checkpoints: ['read-intuition'],
}

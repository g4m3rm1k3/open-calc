class Dog:
    def __init__(self, name):
        self.name = name
        self.is_hungry = True

    def feed(self):
        self.is_hungry = False

fido = Dog("Fido")
print(fido.is_hungry)
fido.feed()
print(fido.is_hungry)

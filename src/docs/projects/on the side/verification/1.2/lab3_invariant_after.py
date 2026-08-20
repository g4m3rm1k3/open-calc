class Dog:
    def __init__(self, name):
        self.name = name
        self.is_hungry = True

    def feed(self):
        if not self.is_hungry:
            return False
        self.is_hungry = False
        return True

fido = Dog("Fido")
print(fido.feed())
print(fido.feed())
print(fido.feed())

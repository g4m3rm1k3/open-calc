class Dog:
    def __init__(self, name):
        self.name = name
        self.is_hungry = True

fido = Dog("Fido")
rex = Dog("Rex")
print(fido.is_hungry)
print(rex.is_hungry)

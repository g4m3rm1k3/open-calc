class Dog:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Woof! My name is {self.name}."

fido = Dog("Fido")
print(fido.greet())

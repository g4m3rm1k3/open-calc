class Dog:
    tricks = []

    def __init__(self, name):
        self.name = name

    def learn_trick(self, trick):
        self.tricks.append(trick)

fido = Dog("Fido")
fido.learn_trick("sit")
print(fido.__dict__)
print(Dog.__dict__["tricks"])

class Dog:
    tricks = []

    def __init__(self, name):
        self.name = name

    def learn_trick(self, trick):
        self.tricks.append(trick)

fido = Dog("Fido")
rex = Dog("Rex")
fido.learn_trick("sit")
print(fido.tricks)
print(rex.tricks)
print(fido.tricks is rex.tricks)

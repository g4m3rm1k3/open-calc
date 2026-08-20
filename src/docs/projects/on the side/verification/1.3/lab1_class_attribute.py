class Dog:
    species = "Canis familiaris"

fido = Dog()
rex = Dog()
print(fido.species)
print(rex.species)
print(fido.species is rex.species)
print(Dog.species)

class Dog:
    species = "Canis familiaris"

fido = Dog()
rex = Dog()
fido.species = "Wolf"
print(fido.species)
print(rex.species)
print(Dog.species)

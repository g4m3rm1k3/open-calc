class Owner:
    def __init__(self, name, email):
        self.name = name
        self.email = email

jane = Owner("Jane Doe", "jane.doe@example.com")
print(jane.name)
print(jane.email)
print(type(jane))

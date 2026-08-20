class Owner:
    def __init__(self, name: str, email: str):
        self.name = name
        self.email = email


class Asset:
    def __init__(self, name: str, serial_number: str, category: str, owner: Owner):
        self.name = name
        self.serial_number = serial_number
        self.category = category
        self.is_retired = False
        self.owner = owner

    def describe(self):
        return f"{self.name} — {self.category} (S/N {self.serial_number})"

    def mark_retired(self):
        if self.is_retired:
            return False
        self.is_retired = True
        return True


jane = Owner("Jane Doe", "jane.doe@example.com")
laptop = Asset("ThinkPad X1", "SN-48213", "Laptop", jane)

print(laptop.describe())
print(laptop.mark_retired())
print(Asset.__init__.__annotations__)
print(Owner.__init__.__annotations__)

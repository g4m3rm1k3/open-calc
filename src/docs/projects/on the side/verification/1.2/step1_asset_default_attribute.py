class Asset:
    def __init__(self, name, serial_number, category):
        self.name = name
        self.serial_number = serial_number
        self.category = category
        self.is_retired = False

    def describe(self):
        return f"{self.name} — {self.category} (S/N {self.serial_number})"

laptop = Asset("ThinkPad X1", "SN-48213", "Laptop")
print(laptop.is_retired)
print(laptop.describe())

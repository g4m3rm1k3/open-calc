class Asset:
    def __init__(self, name, serial_number, category):
        self.name = name
        self.serial_number = serial_number
        self.category = category

laptop = Asset("ThinkPad X1", "SN-48213", "Laptop")
print(laptop.name)
print(laptop.serial_number)
print(laptop.category)

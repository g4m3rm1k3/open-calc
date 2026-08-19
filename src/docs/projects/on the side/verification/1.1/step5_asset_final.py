class Asset:
    def __init__(self, name, serial_number, category):
        self.name = name
        self.serial_number = serial_number
        self.category = category

    def describe(self):
        return f"{self.name} — {self.category} (S/N {self.serial_number})"

laptop = Asset("ThinkPad X1", "SN-48213", "Laptop")
monitor = Asset("UltraSharp 27\"", "SN-77190", "Monitor")

print(laptop.name)
print(laptop.serial_number)
print(laptop.category)
print(laptop.describe())
print(monitor.describe())
print(laptop == monitor)
print(type(laptop))

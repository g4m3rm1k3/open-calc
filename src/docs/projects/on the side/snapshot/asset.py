class Asset:
    def __init__(self, name, serial_number, category):
        self.name = name
        self.serial_number = serial_number
        self.category = category

    def describe(self):
        return f"{self.name} — {self.category} (S/N {self.serial_number})"

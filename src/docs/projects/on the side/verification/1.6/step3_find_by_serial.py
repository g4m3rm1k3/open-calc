from typing import Optional


class Owner:
    def __init__(self, name: str, email: str) -> None:
        self.name = name
        self.email = email


class Asset:
    def __init__(self, name: str, serial_number: str, category: str, owner: Owner) -> None:
        self.name = name
        self.serial_number = serial_number
        self.category = category
        self.is_retired = False
        self.owner = owner

    def describe(self) -> str:
        return f"{self.name} — {self.category} (S/N {self.serial_number})"

    def mark_retired(self) -> bool:
        if self.is_retired:
            return False
        self.is_retired = True
        return True


def find_by_serial(assets: list[Asset], serial_number: str) -> Optional[Asset]:
    for asset in assets:
        if asset.serial_number == serial_number:
            return asset
    return None


jane = Owner("Jane Doe", "jane.doe@example.com")
laptop = Asset("ThinkPad X1", "SN-48213", "Laptop", jane)
monitor = Asset("UltraWide 34", "SN-99120", "Monitor", jane)
inventory = [laptop, monitor]

found = find_by_serial(inventory, "SN-99120")
missing = find_by_serial(inventory, "SN-00000")

print(found is monitor)
print(found.describe())
print(missing)
print(find_by_serial.__annotations__)

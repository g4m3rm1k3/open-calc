from dataclasses import dataclass
from typing import Optional


@dataclass
class Owner:
    name: str
    email: str


@dataclass
class Asset:
    name: str
    serial_number: str
    category: str
    owner: Owner
    is_retired: bool = False

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Asset name must not be empty")
        if not self.serial_number.strip():
            raise ValueError("Asset serial number must not be empty")
        if not self.category.strip():
            raise ValueError("Asset category must not be empty")

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

print(laptop.describe())
print(laptop.mark_retired())

inventory = [laptop]
print(find_by_serial(inventory, "SN-48213") is laptop)

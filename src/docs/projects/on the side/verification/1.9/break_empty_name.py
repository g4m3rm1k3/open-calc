from dataclasses import dataclass


@dataclass
class Asset:
    name: str
    serial_number: str
    category: str

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise ValueError("Asset name must not be empty")
        if not self.serial_number.strip():
            raise ValueError("Asset serial number must not be empty")
        if not self.category.strip():
            raise ValueError("Asset category must not be empty")


bad_asset = Asset("   ", "SN-1", "Laptop")

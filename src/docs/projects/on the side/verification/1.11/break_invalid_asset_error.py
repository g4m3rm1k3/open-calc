from dataclasses import dataclass


class InvalidAssetError(ValueError):
    def __init__(self, field: str, message: str) -> None:
        self.field = field
        super().__init__(message)


@dataclass
class Asset:
    name: str
    serial_number: str
    category: str

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise InvalidAssetError("name", "Asset name must not be empty")
        if not self.serial_number.strip():
            raise InvalidAssetError("serial_number", "Asset serial number must not be empty")
        if not self.category.strip():
            raise InvalidAssetError("category", "Asset category must not be empty")


bad_asset = Asset("   ", "SN-1", "Laptop")

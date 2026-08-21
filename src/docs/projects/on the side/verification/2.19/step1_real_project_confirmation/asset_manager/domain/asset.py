from dataclasses import dataclass
from typing import Optional

from .owner import Owner


class InvalidAssetError(ValueError):
    def __init__(self, field: str, message: str) -> None:
        self.field = field
        super().__init__(message)


@dataclass
class Asset:
    name: str
    serial_number: str
    category: str
    owner: Owner
    is_retired: bool = False

    def __post_init__(self) -> None:
        if not self.name.strip():
            raise InvalidAssetError("name", "Asset name must not be empty")
        if not self.serial_number.strip():
            raise InvalidAssetError("serial_number", "Asset serial number must not be empty")
        if not self.category.strip():
            raise InvalidAssetError("category", "Asset category must not be empty")

    @property
    def display_name(self) -> str:
        if self.is_retired:
            return f"{self.name} (Retired)"
        return self.name

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

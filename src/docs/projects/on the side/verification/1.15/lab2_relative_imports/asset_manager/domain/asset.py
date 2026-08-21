from dataclasses import dataclass

from .owner import Owner


@dataclass
class Asset:
    name: str
    owner: Owner

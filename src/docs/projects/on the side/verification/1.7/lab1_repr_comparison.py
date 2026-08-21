from dataclasses import dataclass


class PlainPoint:
    def __init__(self, x: int, y: int) -> None:
        self.x = x
        self.y = y


@dataclass
class Point:
    x: int
    y: int


plain = PlainPoint(3, 4)
print(repr(plain))

dc = Point(3, 4)
print(repr(dc))

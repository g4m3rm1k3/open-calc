class Point:
    def __init__(self, x: float, y: float) -> None:
        self.x = x
        self.y = y


def sum_of_x(points: list[Point]) -> float:
    total = 0.0
    for point in points:
        total = total + point.x
    return total


a = Point(1.0, 2.0)
b = Point(3.0, 4.0)
print(sum_of_x([a, b]))
print(sum_of_x.__annotations__)

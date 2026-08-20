class Shape:
    def __init__(self, name):
        self.name = name

    def describe(self):
        return f"This is a {self.name}."

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

circle = Circle(5)
print(circle.describe())

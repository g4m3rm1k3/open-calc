class Shape:
    def __init__(self, name):
        self.name = name

    def describe(self):
        return f"This is a {self.name}."

class Circle(Shape):
    def describe(self):
        return f"This is a circle-shaped {self.name}."

shape = Shape("shape")
circle = Circle("circle")
print(shape.describe())
print(circle.describe())

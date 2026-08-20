class Shape:
    def __init__(self, name):
        self.name = name

    def describe(self):
        return f"This is a {self.name}."

class Circle(Shape):
    def __init__(self, radius):
        super().__init__("circle")
        self.radius = radius

    def describe(self):
        base_description = super().describe()
        return f"{base_description} Its radius is {self.radius}."

circle = Circle(5)
print(circle.name)
print(circle.radius)
print(circle.describe())

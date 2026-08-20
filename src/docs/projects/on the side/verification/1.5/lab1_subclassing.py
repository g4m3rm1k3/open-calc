class Shape:
    def __init__(self, name):
        self.name = name

class Circle(Shape):
    pass

circle = Circle("circle")
print(circle.name)
print(Circle.__bases__)

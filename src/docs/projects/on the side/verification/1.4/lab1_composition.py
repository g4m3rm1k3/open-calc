class Engine:
    def __init__(self, horsepower):
        self.horsepower = horsepower

class Car:
    def __init__(self, engine):
        self.engine = engine

engine = Engine(300)
car = Car(engine)
print(car.engine.horsepower)
print(car.engine is engine)

#include <iostream>
#include <vector>

class Shape {
public:
    virtual double area() const = 0;
};

class Square : public Shape {
public:
    Square(double side) : side(side) {}
    double area() const override {
        return side * side;
    }
private:
    double side;
};

class CompositeShape : public Shape {
public:
    void add(Shape* shape) {
        parts.push_back(shape);
    }

    double area() const override {
        double sum = 0;
        for (Shape* part : parts) {
            sum += part->area();
        }
        return sum;
    }

private:
    std::vector<Shape*> parts;
};

int main() {
    Square* a = new Square(2.0);
    Square* b = new Square(3.0);

    CompositeShape* group = new CompositeShape();
    group->add(a);
    group->add(b);

    std::cout << "group area: " << group->area() << std::endl;
    return 0;
}

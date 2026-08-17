#include <iostream>

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

int main() {
    Square s(4.0);
    Shape& shape = s;
    std::cout << "area: " << shape.area() << std::endl;
    return 0;
}

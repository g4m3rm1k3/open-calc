#include <iostream>

class Greeter {
public:
    virtual void greet() = 0;
    virtual ~Greeter() = default;
};

class FriendlyGreeter : public Greeter {
public:
    void greet() override {
        std::cout << "hello!" << std::endl;
    }
};

class FormalGreeter : public Greeter {
public:
    void greet() override {
        std::cout << "good evening." << std::endl;
    }
};

void announce(Greeter& g) {
    g.greet();
}

int main() {
    FriendlyGreeter f;
    FormalGreeter form;

    announce(f);
    announce(form);
    return 0;
}

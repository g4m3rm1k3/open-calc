#include <iostream>

class Counter {
public:
    void tally() {
        count++;
    }
    int count = 0;
};

int main() {
    Counter c;
    c.tally();
    c.tally();
    c.tally();

    std::cout << "count after three calls: " << c.count << std::endl;
    return 0;
}

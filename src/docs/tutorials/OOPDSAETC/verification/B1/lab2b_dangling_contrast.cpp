#include <iostream>

int* makeOnStack(int value) {
    int local = value;
    return &local;
}

int main() {
    int* dangling = makeOnStack(42);
    std::cout << "reading after the function returned: " << *dangling << std::endl;
    return 0;
}

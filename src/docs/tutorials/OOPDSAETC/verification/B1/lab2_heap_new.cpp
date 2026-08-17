#include <iostream>

int* makeOnHeap(int value) {
    int* p = new int;
    *p = value;
    return p;
}

int main() {
    int* fromHeap = makeOnHeap(42);
    std::cout << "value survives the function call: " << *fromHeap << std::endl;
    return 0;
}

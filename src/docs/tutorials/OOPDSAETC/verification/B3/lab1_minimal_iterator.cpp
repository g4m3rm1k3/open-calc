#include <iostream>

class NumberIterator {
public:
    NumberIterator(int* pointer) : pointer(pointer) {}

    int& operator*() {
        return *pointer;
    }

    NumberIterator& operator++() {
        pointer++;
        return *this;
    }

    bool operator!=(const NumberIterator& other) const {
        return pointer != other.pointer;
    }

private:
    int* pointer;
};

class NumberRange {
public:
    NumberRange(int* data, int count) : data(data), count(count) {}

    NumberIterator begin() { return NumberIterator(data); }
    NumberIterator end() { return NumberIterator(data + count); }

private:
    int* data;
    int count;
};

int main() {
    int values[] = {10, 20, 30};
    NumberRange range(values, 3);

    for (int& v : range) {
        std::cout << v << " ";
    }
    std::cout << std::endl;

    return 0;
}

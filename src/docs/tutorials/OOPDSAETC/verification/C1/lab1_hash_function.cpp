#include <cstdint>
#include <iostream>
#include <string>

// djb2 string hash: a small, well-known, deterministic hash function.
size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

int main() {
    std::cout << "djb2(\"a\")      = " << djb2("a") << std::endl;
    std::cout << "djb2(\"a\")      = " << djb2("a") << " (again, same input)" << std::endl;
    std::cout << "djb2(\"ab\")     = " << djb2("ab") << std::endl;
    std::cout << "djb2(\"Apple\")  = " << djb2("Apple") << std::endl;
    std::cout << "djb2(\"Banana\") = " << djb2("Banana") << std::endl;
    std::cout << "djb2(\"Cheese\") = " << djb2("Cheese") << std::endl;

    size_t capacity = 4;
    std::cout << "\nWith capacity " << capacity << ":" << std::endl;
    std::cout << "djb2(\"Apple\")  % " << capacity << " = " << djb2("Apple") % capacity << std::endl;
    std::cout << "djb2(\"Banana\") % " << capacity << " = " << djb2("Banana") % capacity << std::endl;
    std::cout << "djb2(\"Cheese\") % " << capacity << " = " << djb2("Cheese") % capacity << std::endl;

    std::cout << "\nProof that unsigned wraparound is well-defined, not undefined behavior:" << std::endl;
    size_t maxVal = SIZE_MAX;
    std::cout << "SIZE_MAX       = " << maxVal << std::endl;
    std::cout << "SIZE_MAX + 1   = " << (maxVal + 1) << " (wraps to 0, does not crash or corrupt)" << std::endl;

    return 0;
}

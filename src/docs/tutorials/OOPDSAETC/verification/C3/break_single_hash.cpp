#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) hash = hash * 33 + static_cast<unsigned char>(c);
    return hash;
}
size_t fnv1a(const std::string& key) {
    size_t hash = 14695981039346656037ULL;
    for (char c : key) { hash ^= static_cast<unsigned char>(c); hash *= 1099511628211ULL; }
    return hash;
}

// BROKEN: indexFor ignores h2 and i -- every "index" is the same bit.
size_t brokenIndexFor(const std::string& key, int /*i*/, size_t numBits) {
    return djb2(key) % numBits;
}

size_t correctIndexFor(const std::string& key, int i, size_t numBits) {
    size_t h1 = djb2(key), h2 = fnv1a(key);
    return (h1 + static_cast<size_t>(i) * h2) % numBits;
}

int main() {
    std::vector<std::string> catalog = {"Apple", "Banana", "Cheese", "Bread", "Cherry", "Pea", "Peach"};
    const size_t numBits = 42;

    std::cout << "Correct (double-hashed) indices -- 3 checks per product:" << std::endl;
    for (auto& p : catalog) {
        std::cout << p << ": ";
        for (int i = 0; i < 3; ++i) std::cout << correctIndexFor(p, i, numBits) << " ";
        std::cout << std::endl;
    }

    std::cout << "\nBroken (single-hash) indices -- 3 checks per product:" << std::endl;
    for (auto& p : catalog) {
        std::cout << p << ": ";
        for (int i = 0; i < 3; ++i) std::cout << brokenIndexFor(p, i, numBits) << " ";
        std::cout << std::endl;
    }
    return 0;
}

#include <iostream>
#include <string>

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t fnv1a(const std::string& key) {
    size_t hash = 14695981039346656037ULL;
    for (char c : key) {
        hash ^= static_cast<unsigned char>(c);
        hash *= 1099511628211ULL;
    }
    return hash;
}

int main() {
    std::string word = "cat";
    size_t h1 = djb2(word);
    size_t h2 = fnv1a(word);
    const size_t m = 10;

    std::cout << word << ": h1=" << h1 << " h2=" << h2 << std::endl;
    for (int i = 0; i < 3; ++i) {
        size_t index = (h1 + static_cast<size_t>(i) * h2) % m;
        std::cout << "i=" << i << " -> (h1 + " << i << "*h2) % " << m << " = " << index << std::endl;
    }
    return 0;
}

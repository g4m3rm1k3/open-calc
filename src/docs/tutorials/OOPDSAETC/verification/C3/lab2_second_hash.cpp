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
    for (const std::string& word : {std::string("cat"), std::string("dog")}) {
        size_t h1 = djb2(word);
        size_t h2 = fnv1a(word);
        std::cout << word << ": djb2=" << h1 << " fnv1a=" << h2
                  << "  djb2%10=" << (h1 % 10) << " fnv1a%10=" << (h2 % 10) << std::endl;
    }
    return 0;
}

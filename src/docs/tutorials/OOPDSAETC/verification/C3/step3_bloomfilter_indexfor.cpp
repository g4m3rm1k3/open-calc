#include <cstdint>
#include <iostream>
#include <string>
#include <vector>

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

class BloomFilter {
public:
    BloomFilter(size_t numBits)
        : bits((numBits + 63) / 64, 0), numBits(numBits) {}

    void printBits() const {
        for (size_t i = 0; i < numBits; ++i) {
            std::cout << (testBit(i) ? '1' : '0');
        }
        std::cout << std::endl;
    }

    void debugSetBit(size_t pos) { setBit(pos); }

private:
    size_t indexFor(const std::string& key, int i) const {
        size_t h1 = djb2(key);
        size_t h2 = fnv1a(key);
        return (h1 + static_cast<size_t>(i) * h2) % numBits;
    }

    void setBit(size_t pos) {
        bits[pos / 64] |= (uint64_t(1) << (pos % 64));
    }

    bool testBit(size_t pos) const {
        return (bits[pos / 64] & (uint64_t(1) << (pos % 64))) != 0;
    }

    std::vector<uint64_t> bits;
    size_t numBits;
};

int main() {
    BloomFilter presence(20);
    presence.debugSetBit(3);
    presence.debugSetBit(10);
    std::cout << "bits unchanged, still: ";
    presence.printBits();
    std::cout << "indexFor exists now but is private and unused -- nothing calls it until add() in the next unit" << std::endl;
    return 0;
}

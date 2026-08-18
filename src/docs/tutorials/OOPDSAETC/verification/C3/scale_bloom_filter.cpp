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

class BloomFilter {
public:
    BloomFilter(size_t numBits, int numHashes)
        : bits((numBits + 63) / 64, 0), numBits(numBits), numHashes(numHashes) {}
    void add(const std::string& key) { for (int i = 0; i < numHashes; ++i) setBit(indexFor(key, i)); }
private:
    size_t indexFor(const std::string& key, int i) const {
        size_t h1 = djb2(key), h2 = fnv1a(key);
        return (h1 + static_cast<size_t>(i) * h2) % numBits;
    }
    void setBit(size_t pos) { bits[pos / 64] |= (uint64_t(1) << (pos % 64)); }
    std::vector<uint64_t> bits; size_t numBits; int numHashes;
};

int main() {
    const size_t n = 200000;
    const size_t numBits = 10 * n;
    BloomFilter presence(numBits, 3);
    for (size_t i = 0; i < n; ++i) {
        presence.add("catalog-item-number-" + std::to_string(i) + "-abcdefghij");
    }
    std::cout << "added " << n << " keys into a " << numBits << "-bit filter ("
              << (numBits / 8) << " bytes of bit array)" << std::endl;
    return 0;
}

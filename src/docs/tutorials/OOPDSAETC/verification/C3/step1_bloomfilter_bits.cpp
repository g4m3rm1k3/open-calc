#include <cstdint>
#include <iostream>
#include <vector>

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
    std::cout << "before setting any bits: ";
    presence.printBits();

    presence.debugSetBit(3);
    presence.debugSetBit(10);
    std::cout << "after setting bits 3 and 10: ";
    presence.printBits();

    return 0;
}

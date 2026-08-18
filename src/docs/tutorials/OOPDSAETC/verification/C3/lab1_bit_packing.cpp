#include <cstdint>
#include <iostream>

int main() {
    std::cout << "sizeof(bool) = " << sizeof(bool) << " byte(s)" << std::endl;

    uint8_t packed = 0;
    packed |= (1 << 0);
    packed |= (1 << 2);

    std::cout << "packed byte after setting bits 0 and 2: " << static_cast<int>(packed) << std::endl;

    bool hasStock     = (packed & (1 << 0)) != 0;
    bool isPerishable = (packed & (1 << 1)) != 0;
    bool isOnSale     = (packed & (1 << 2)) != 0;

    std::cout << "hasStock=" << hasStock << " isPerishable=" << isPerishable << " isOnSale=" << isOnSale << std::endl;
    return 0;
}

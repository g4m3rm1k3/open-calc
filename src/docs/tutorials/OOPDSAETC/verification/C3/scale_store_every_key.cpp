#include <iostream>
#include <string>
#include <vector>

int main() {
    const size_t n = 200000;
    std::vector<std::string> keys;
    keys.reserve(n);
    for (size_t i = 0; i < n; ++i) {
        keys.push_back("catalog-item-number-" + std::to_string(i) + "-abcdefghij");
    }
    std::cout << "stored " << keys.size() << " real keys, first: " << keys.front()
              << " last: " << keys.back() << std::endl;
    return 0;
}

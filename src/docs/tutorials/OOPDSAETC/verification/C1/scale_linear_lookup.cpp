#include <iostream>
#include <random>
#include <string>
#include <vector>

class CatalogItem {
public:
    CatalogItem(std::string label) : label(label) {}
    virtual int totalQuantity() const = 0;

    std::string label;
};

class Product : public CatalogItem {
public:
    Product(std::string label, int quantity) : CatalogItem(label), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

private:
    int quantity;
};

int main() {
    const int N = 200000;
    const int LOOKUPS = 5000;

    std::vector<Product*> catalog;
    catalog.reserve(N);
    for (int i = 0; i < N; ++i) {
        catalog.push_back(new Product("Product" + std::to_string(i), i % 100));
    }

    std::mt19937 rng(42);
    std::uniform_int_distribution<int> dist(0, N - 1);

    long long foundCount = 0;
    for (int q = 0; q < LOOKUPS; ++q) {
        std::string target = "Product" + std::to_string(dist(rng));
        for (Product* p : catalog) {
            if (p->label == target) {
                ++foundCount;
                break;
            }
        }
    }

    std::cout << "linear scan: " << LOOKUPS << " lookups over " << N
              << " products, found " << foundCount << std::endl;
    return 0;
}

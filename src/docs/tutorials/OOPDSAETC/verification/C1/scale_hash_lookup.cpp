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

size_t djb2(const std::string& key) {
    size_t hash = 5381;
    for (char c : key) {
        hash = hash * 33 + static_cast<unsigned char>(c);
    }
    return hash;
}

size_t bucketIndexOf(const std::string& key, size_t capacity) {
    return djb2(key) % capacity;
}

class ProductIndex {
public:
    ProductIndex(size_t initialCapacity = 4) : buckets(initialCapacity) {}

    void insert(const std::string& key, Product* value) {
        double loadFactorAfter = static_cast<double>(count + 1) / buckets.size();
        if (loadFactorAfter > 0.75) {
            rehash();
        }
        size_t idx = bucketIndexOf(key, buckets.size());
        buckets[idx].push_back({key, value});
        ++count;
    }

    Product* find(const std::string& key) const {
        size_t idx = bucketIndexOf(key, buckets.size());
        for (const Entry& e : buckets[idx]) {
            if (e.key == key) {
                return e.value;
            }
        }
        return nullptr;
    }

private:
    struct Entry {
        std::string key;
        Product* value;
    };

    void rehash() {
        std::vector<std::vector<Entry>> old = std::move(buckets);
        buckets.assign(old.size() * 2, {});
        for (auto& bucket : old) {
            for (auto& e : bucket) {
                size_t newIdx = bucketIndexOf(e.key, buckets.size());
                buckets[newIdx].push_back(std::move(e));
            }
        }
    }

    std::vector<std::vector<Entry>> buckets;
    size_t count = 0;
};

int main() {
    const int N = 200000;
    const int LOOKUPS = 5000;

    std::vector<Product*> catalog;
    catalog.reserve(N);
    ProductIndex index;
    for (int i = 0; i < N; ++i) {
        Product* p = new Product("Product" + std::to_string(i), i % 100);
        catalog.push_back(p);
        index.insert(p->label, p);
    }

    std::mt19937 rng(42);
    std::uniform_int_distribution<int> dist(0, N - 1);

    long long foundCount = 0;
    for (int q = 0; q < LOOKUPS; ++q) {
        std::string target = "Product" + std::to_string(dist(rng));
        if (index.find(target) != nullptr) {
            ++foundCount;
        }
    }

    std::cout << "hash map lookup: " << LOOKUPS << " lookups over " << N
              << " products, found " << foundCount << std::endl;
    return 0;
}

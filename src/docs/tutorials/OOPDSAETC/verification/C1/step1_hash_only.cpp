#include <iostream>
#include <string>
#include <vector>

class CatalogItem {
public:
    CatalogItem(std::string label) : label(label) {}
    virtual int totalQuantity() const = 0;

    std::string label;
};

class TagPool {
public:
    const std::string* intern(const std::string& text) {
        for (std::string* existing : pool) {
            if (*existing == text) {
                return existing;
            }
        }
        std::string* fresh = new std::string(text);
        pool.push_back(fresh);
        return fresh;
    }

private:
    std::vector<std::string*> pool;
};

class Product : public CatalogItem {
public:
    Product(std::string label, int quantity, const std::string* tag)
        : CatalogItem(label), tag(tag), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

    const std::string* tag;

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

int main() {
    size_t capacity = 4;
    std::cout << "bucketIndexOf(\"Apple\", " << capacity << ")  = " << bucketIndexOf("Apple", capacity) << std::endl;
    std::cout << "bucketIndexOf(\"Banana\", " << capacity << ") = " << bucketIndexOf("Banana", capacity) << std::endl;
    std::cout << "bucketIndexOf(\"Cheese\", " << capacity << ") = " << bucketIndexOf("Cheese", capacity) << std::endl;
    return 0;
}

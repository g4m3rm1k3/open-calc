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

// BROKEN ON PURPOSE: one Entry slot per bucket, no chain. A second key that
// hashes to an already-occupied bucket silently overwrites the first.
class BrokenProductIndex {
public:
    BrokenProductIndex(size_t capacity) : buckets(capacity) {}

    void insert(const std::string& key, Product* value) {
        size_t idx = djb2(key) % buckets.size();
        std::cout << "insert(\"" << key << "\") -> bucket " << idx;
        if (buckets[idx].value != nullptr) {
            std::cout << " (OVERWRITING \"" << buckets[idx].key << "\", which was already there)";
        }
        std::cout << std::endl;
        buckets[idx] = {key, value};
    }

    Product* find(const std::string& key) const {
        size_t idx = djb2(key) % buckets.size();
        if (buckets[idx].value != nullptr && buckets[idx].key == key) {
            return buckets[idx].value;
        }
        return nullptr;
    }

private:
    struct Entry {
        std::string key;
        Product* value = nullptr;
    };

    std::vector<Entry> buckets;
};

int main() {
    TagPool tags;
    const std::string* perishable = tags.intern("perishable");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, tags.intern("perishable"));
    Product* cheese = new Product("Cheese", 3, tags.intern("imported"));
    Product* bread = new Product("Bread", 9, tags.intern("imported"));

    BrokenProductIndex index(4);
    index.insert(apple->label, apple);
    index.insert(banana->label, banana);
    index.insert(cheese->label, cheese);
    index.insert(bread->label, bread);

    Product* found = index.find("Banana");
    std::cout << "\nfind(\"Banana\") -> "
              << (found != nullptr ? found->label : "not found — but it was inserted above!")
              << std::endl;

    return 0;
}

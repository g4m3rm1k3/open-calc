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
    TagPool tags;
    const std::string* perishable = tags.intern("perishable");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, tags.intern("perishable"));
    Product* cheese = new Product("Cheese", 3, tags.intern("imported"));
    Product* bread = new Product("Bread", 9, tags.intern("imported"));

    ProductIndex index;
    index.insert(apple->label, apple);
    index.insert(banana->label, banana);
    index.insert(cheese->label, cheese);
    index.insert(bread->label, bread);

    Product* found = index.find("Cheese");
    std::cout << "find(\"Cheese\") -> ";
    if (found != nullptr) {
        std::cout << found->label << ", quantity " << found->totalQuantity()
                  << ", tag " << *found->tag << std::endl;
    } else {
        std::cout << "not found" << std::endl;
    }

    Product* missing = index.find("Mango");
    std::cout << "find(\"Mango\") -> " << (missing == nullptr ? "not found (nullptr)" : "found") << std::endl;

    return 0;
}

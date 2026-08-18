#include <cstdint>
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
    BloomFilter(size_t numBits, int numHashes)
        : bits((numBits + 63) / 64, 0), numBits(numBits), numHashes(numHashes) {}

    void add(const std::string& key) {
        for (int i = 0; i < numHashes; ++i) {
            setBit(indexFor(key, i));
        }
    }

    bool mightContain(const std::string& key) const {
        for (int i = 0; i < numHashes; ++i) {
            if (!testBit(indexFor(key, i))) {
                return false;
            }
        }
        return true;
    }

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
    int numHashes;
};

void printQuery(const std::string& label, bool result) {
    std::cout << "presence.mightContain(\"" << label << "\") -> " << (result ? "true" : "false") << std::endl;
}

int main() {
    TagPool tags;
    const std::string* perishable = tags.intern("perishable");
    const std::string* imported = tags.intern("imported");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, perishable);
    Product* cheese = new Product("Cheese", 3, imported);
    Product* bread = new Product("Bread", 9, imported);
    Product* cherry = new Product("Cherry", 15, perishable);
    Product* pea = new Product("Pea", 30, perishable);
    Product* peach = new Product("Peach", 20, perishable);

    BloomFilter presence(42, 3);
    presence.add(apple->label);
    presence.add(banana->label);
    presence.add(cheese->label);
    presence.add(bread->label);
    presence.add(cherry->label);
    presence.add(pea->label);
    presence.add(peach->label);

    printQuery("Apple", presence.mightContain("Apple"));
    printQuery("Banana", presence.mightContain("Banana"));
    printQuery("Cheese", presence.mightContain("Cheese"));
    printQuery("Bread", presence.mightContain("Bread"));
    printQuery("Cherry", presence.mightContain("Cherry"));
    printQuery("Pea", presence.mightContain("Pea"));
    printQuery("Peach", presence.mightContain("Peach"));
    printQuery("Mango", presence.mightContain("Mango"));
    printQuery("Melon", presence.mightContain("Melon"));

    return 0;
}

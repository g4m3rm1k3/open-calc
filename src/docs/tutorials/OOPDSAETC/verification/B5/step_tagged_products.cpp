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

int main() {
    TagPool tags;

    const std::string* perishable = tags.intern("perishable");
    const std::string* imported = tags.intern("imported");

    Product* apple = new Product("Apple", 12, perishable);
    Product* banana = new Product("Banana", 7, tags.intern("perishable"));
    Product* cheese = new Product("Cheese", 3, tags.intern("imported"));

    std::cout << apple->label << " tag: " << *apple->tag << std::endl;
    std::cout << banana->label << " tag: " << *banana->tag << std::endl;
    std::cout << cheese->label << " tag: " << *cheese->tag << std::endl;

    std::cout << "apple->tag == banana->tag: " << (apple->tag == banana->tag) << std::endl;
    std::cout << "apple->tag == cheese->tag: " << (apple->tag == cheese->tag) << std::endl;
    std::cout << "imported == cheese->tag:   " << (imported == cheese->tag) << std::endl;

    return 0;
}

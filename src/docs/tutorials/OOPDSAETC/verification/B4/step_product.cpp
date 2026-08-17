#include <iostream>
#include <string>

class CatalogItem {
public:
    CatalogItem(std::string label) : label(label) {}
    virtual int totalQuantity() const = 0;

    std::string label;
};

class Product : public CatalogItem {
public:
    Product(std::string label, int quantity)
        : CatalogItem(label), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

private:
    int quantity;
};

int main() {
    Product apple("Apple", 12);
    CatalogItem& item = apple;

    std::cout << item.label << ": " << item.totalQuantity() << std::endl;
    return 0;
}

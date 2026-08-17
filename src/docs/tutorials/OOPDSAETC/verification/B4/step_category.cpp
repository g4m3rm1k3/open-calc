#include <iostream>
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
    Product(std::string label, int quantity)
        : CatalogItem(label), quantity(quantity) {}

    int totalQuantity() const override {
        return quantity;
    }

private:
    int quantity;
};

class Category : public CatalogItem {
public:
    Category(std::string label) : CatalogItem(label) {}

    void add(CatalogItem* item) {
        children.push_back(item);
    }

    int totalQuantity() const override {
        int sum = 0;
        for (CatalogItem* child : children) {
            sum += child->totalQuantity();
        }
        return sum;
    }

private:
    std::vector<CatalogItem*> children;
};

int main() {
    Product* apple = new Product("Apple", 12);
    Product* banana = new Product("Banana", 7);

    Category* produce = new Category("Produce");
    produce->add(apple);
    produce->add(banana);

    std::cout << produce->label << ": " << produce->totalQuantity() << std::endl;

    return 0;
}

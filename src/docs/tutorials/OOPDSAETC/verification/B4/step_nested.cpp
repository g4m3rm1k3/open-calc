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

void report(const std::string& label, CatalogItem* item) {
    std::cout << label << ": " << item->totalQuantity() << std::endl;
}

int main() {
    Product* apple = new Product("Apple", 12);
    Product* banana = new Product("Banana", 7);
    Product* bread = new Product("Bread", 4);

    Category* produce = new Category("Produce");
    produce->add(apple);
    produce->add(banana);

    Category* bakery = new Category("Bakery");
    bakery->add(bread);

    Category* catalog = new Category("Catalog");
    catalog->add(produce);
    catalog->add(bakery);

    report("a single product (Apple)", apple);
    report("a small category (Produce)", produce);
    report("the entire nested catalog", catalog);

    return 0;
}

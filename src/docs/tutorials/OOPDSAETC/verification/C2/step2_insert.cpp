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

struct TrieNode {
    TrieNode* children[128] = {};
    bool isEnd = false;
    Product* product = nullptr;
};

class ProductTrie {
public:
    ProductTrie() : root(new TrieNode()) {}

    void insert(const std::string& label, Product* product) {
        TrieNode* current = root;
        for (char c : label) {
            unsigned char index = static_cast<unsigned char>(c);
            if (current->children[index] == nullptr) {
                current->children[index] = new TrieNode();
            }
            current = current->children[index];
        }
        current->isEnd = true;
        current->product = product;
    }

    TrieNode* root;
};

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

    ProductTrie trie;
    trie.insert(apple->label, apple);
    trie.insert(banana->label, banana);
    trie.insert(cheese->label, cheese);
    trie.insert(bread->label, bread);
    trie.insert(cherry->label, cherry);
    trie.insert(pea->label, pea);
    trie.insert(peach->label, peach);

    // Manually walk the path for "Pea": root -> 'P' -> 'e' -> 'a'.
    TrieNode* afterP = trie.root->children[static_cast<unsigned char>('P')];
    TrieNode* afterPe = afterP->children[static_cast<unsigned char>('e')];
    TrieNode* afterPea = afterPe->children[static_cast<unsigned char>('a')];
    std::cout << "root->children['P']->children['e']->children['a']->isEnd = " << afterPea->isEnd
              << ", product = " << (afterPea->product != nullptr ? afterPea->product->label : "nullptr")
              << std::endl;

    // Continue past "Pea" to "Peach": same node's 'c' child keeps going.
    TrieNode* afterPeac = afterPea->children[static_cast<unsigned char>('c')];
    TrieNode* afterPeach = afterPeac->children[static_cast<unsigned char>('h')];
    std::cout << "...->children['c']->children['h']->isEnd = " << afterPeach->isEnd
              << ", product = " << (afterPeach->product != nullptr ? afterPeach->product->label : "nullptr")
              << std::endl;

    std::cout << "\"Pea\" node's own isEnd = " << afterPea->isEnd
              << " even though it has a child leading to \"Peach\" -- both are real, complete words."
              << std::endl;

    return 0;
}

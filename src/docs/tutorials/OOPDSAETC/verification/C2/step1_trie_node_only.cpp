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
};

int main() {
    TrieNode* root = new TrieNode();
    std::cout << "root->isEnd = " << root->isEnd << std::endl;
    std::cout << "root->children['A'] is " << (root->children[static_cast<unsigned char>('A')] != nullptr ? "set" : "nullptr") << std::endl;
    std::cout << "root->children['Z'] is " << (root->children[static_cast<unsigned char>('Z')] != nullptr ? "set" : "nullptr") << std::endl;
    return 0;
}

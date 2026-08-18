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

    std::vector<Product*> autocomplete(const std::string& prefix) const {
        TrieNode* current = root;
        for (char c : prefix) {
            unsigned char index = static_cast<unsigned char>(c);
            if (current->children[index] == nullptr) {
                return {};
            }
            current = current->children[index];
        }
        std::vector<Product*> matches;
        collect(current, matches);
        return matches;
    }

private:
    void collect(TrieNode* node, std::vector<Product*>& matches) const {
        if (node->isEnd) {
            matches.push_back(node->product);
        }
        for (int i = 0; i < 128; ++i) {
            if (node->children[i] != nullptr) {
                collect(node->children[i], matches);
            }
        }
    }

    TrieNode* root;
};

void printMatches(const std::string& prefix, const std::vector<Product*>& matches) {
    std::cout << "autocomplete(\"" << prefix << "\") -> [";
    for (size_t i = 0; i < matches.size(); ++i) {
        std::cout << matches[i]->label;
        if (i + 1 < matches.size()) std::cout << ", ";
    }
    std::cout << "]" << std::endl;
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

    ProductTrie trie;
    trie.insert(apple->label, apple);
    trie.insert(banana->label, banana);
    trie.insert(cheese->label, cheese);
    trie.insert(bread->label, bread);
    trie.insert(cherry->label, cherry);
    trie.insert(pea->label, pea);
    trie.insert(peach->label, peach);

    printMatches("Ch", trie.autocomplete("Ch"));
    printMatches("Che", trie.autocomplete("Che"));
    printMatches("Pea", trie.autocomplete("Pea"));
    printMatches("B", trie.autocomplete("B"));
    printMatches("Xyz", trie.autocomplete("Xyz"));

    return 0;
}
